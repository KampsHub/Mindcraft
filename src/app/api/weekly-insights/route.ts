import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, weeklyInsightsSchema, getAnthropicClient } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const INSIGHTS_SYSTEM_PROMPT = `You are the coaching companion reviewing a full week. You receive daily session data: journal entries, exercise completions with responses, day ratings, and the program's weekly theme.

Your job is to name the 4-6 most important things that happened this week — what someone actually said, patterns that emerged across days, shifts that happened, or sticking points that persisted.

## Voice

Talk TO the person. Use "you." Quote their actual words — from specific days, not paraphrased. When you name a pattern, show the evidence: "On Day 2 you wrote X. By Day 5 that had become Y."

When you name a shift, name what moved. When you name a sticking point, name what stayed stuck and why that matters. Teach something about the pattern — what it protects, what it costs.

Be warm and direct. No clinical labels. No motivational language. No praise.

Return valid JSON (no markdown, no code fences):

{
  "insights": [
    {
      "insight": "One clear sentence — quoting their words where possible. Talk to them directly.",
      "source": "Brief attribution — 'From Day 3 journal' or 'Across Days 2-4 exercises' or 'Day 5 Saboteur Identification'",
      "type": "pattern" | "shift" | "sticking_point" | "breakthrough" | "connection"
    }
  ]
}

## Guidelines
1. Quote their actual words — show the evidence from specific days.
2. Prioritize patterns that span multiple days over single-day observations.
3. "shift" = something that changed or moved. "sticking_point" = something that stayed stuck despite attention. "breakthrough" = a moment of genuine new understanding. "connection" = a link between two things they hadn't seen before. "pattern" = a recurring theme.
4. Be direct. No motivational language. No praise.
5. Each insight should be something a coach would want to know going into next week.
6. Maximum 6 insights. Quality over quantity.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(weeklyInsightsSchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId, weekNumber } = validation.data;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch { /* Server Component context */ }
          },
        },
      }
    );

    // Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limit (AI bucket — 10 req/min)
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Calculate day range for this week
    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = weekNumber * 7;

    // Fetch all sessions for this week (single query with all needed fields)
    const { data: sessions } = await supabase
      .from("daily_sessions")
      .select("id, day_number, step_2_journal, step_5_summary, day_rating, completed_at")
      .eq("enrollment_id", enrollmentId)
      .gte("day_number", startDay)
      .lte("day_number", endDay)
      .order("day_number", { ascending: true });

    const sIds = sessions?.map((s) => s.id) || [];

    let exercises: { framework_name: string; exercise_type: string; modality: string | null; responses: Record<string, unknown>; star_rating: number | null; daily_session_id: string }[] = [];
    if (sIds.length > 0) {
      const { data: exData } = await supabase
        .from("exercise_completions")
        .select("framework_name, exercise_type, modality, responses, star_rating, daily_session_id")
        .in("daily_session_id", sIds);
      if (exData) exercises = exData;
    }

    // Fetch program weekly theme
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("program_id, programs(weekly_themes)")
      .eq("id", enrollmentId)
      .single();

    let weekTheme = { name: "", title: "", territory: "" };
    if (enrollment?.programs) {
      const themes = (enrollment.programs as unknown as { weekly_themes: { week: number; name: string; title: string; territory: string }[] }).weekly_themes || [];
      const found = themes.find((t) => t.week === weekNumber);
      if (found) weekTheme = found;
    }

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    // Build the prompt
    const sessionMap = new Map<number, string>();
    sessions?.forEach((fs) => {
      sessionMap.set(fs.day_number, fs.id);
    });

    const userPrompt = `
## Program Week ${weekNumber}: ${weekTheme.name} — "${weekTheme.title}"
Territory: ${weekTheme.territory}

## Active Goals
${activeGoals?.map((g) => `- ${g.goal_text}`).join("\n") || "None set yet."}

## Daily Sessions This Week
${sessions && sessions.length > 0
  ? sessions.map((s) => {
      const dayExercises = exercises.filter((e) => {
        const sid = sessionMap.get(s.day_number);
        return e.daily_session_id === sid;
      });
      return `### Day ${s.day_number} ${s.completed_at ? "(completed)" : "(in progress)"} — Rating: ${s.day_rating || "not rated"}
Journal: ${(s.step_2_journal as string)?.substring(0, 500) || "(no entry)"}
${dayExercises.length > 0
  ? "Exercises:\n" + dayExercises.map((e) =>
      `- ${e.framework_name} (${e.exercise_type}, ${e.modality}) — ${e.star_rating || "unrated"}/5\n  Response snippet: ${JSON.stringify(e.responses).substring(0, 300)}`
    ).join("\n")
  : "No exercises completed."}
${s.step_5_summary ? `Summary themes: ${JSON.stringify((s.step_5_summary as { today_themes?: string[] }).today_themes || [])}` : ""}`;
    }).join("\n\n")
  : "No sessions completed this week yet."}

Generate the key insights for Week ${weekNumber}.`;

    // Fetch client profile for personalization
    const profile = await getClientProfile(enrollmentId, "full");
    const profileContext = formatProfileForPrompt(profile, "full");

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    const memories = await getRelevantMemories(user.id, 8);
    const memoryContext = formatMemoriesForPrompt(memories);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: INSIGHTS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: memoryContext + profileContext + userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    // Strip markdown code fences if Claude wraps the JSON
    let rawText = textBlock.text.trim();
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const result = JSON.parse(rawText);

    // Generate a narrative summary paragraph from insights
    let summary = "";
    try {
      const summaryMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: `You write concise weekly summaries for someone reviewing their own week. Write a 3-5 sentence narrative paragraph in second person ("you"). Quote their actual words where possible. Name what moved, what stayed stuck, and what's emerging. Make connections across days they might not see. Be warm and direct — no praise, no motivational language. Talk to them like a smart colleague who knows their patterns well.`,
        messages: [{ role: "user", content: `Week ${weekNumber}: ${weekTheme.name} — "${weekTheme.title}"\nTerritory: ${weekTheme.territory}\n\nInsights:\n${(result.insights || []).map((i: { type: string; insight: string; source: string }) => `- [${i.type}] ${i.insight} (${i.source})`).join("\n")}\n\nWrite a narrative summary paragraph.` }],
      });
      const summaryBlock = summaryMessage.content.find((b) => b.type === "text");
      if (summaryBlock && summaryBlock.type === "text") {
        summary = summaryBlock.text.trim();
      }
    } catch (summaryErr) {
      console.error("Summary generation failed:", summaryErr);
      // Fall back to empty summary — client-side can use generateSummaryParagraph
    }

    // ── Weekly profile refinement (review days: weeks 1, 2, 3) ──
    // After generating insights, refine the client's profile documents
    if (profile && weekNumber <= 3) {
      try {
        const refinementMsg = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          system: `You are refining a client's personalization profile after a week of coaching work. You receive:
1. Their current profile (client context, growth edges, development map)
2. This week's observations log
3. This week's key insights

Your job is to UPDATE the profile — not regenerate it. Specifically:
- Sharpen edge names or descriptions if the week revealed more clarity
- Adjust trait positions on the spectrum if evidence supports movement (struggling → developing, etc.)
- Add new edges if something emerged that wasn't visible before (max 5 total)
- Update client_context fields if new information surfaced (relational style, coping patterns, etc.)
- Remove or merge edges that turned out to be the same pattern

Voice rules:
- Keep tentative language: "seems to", "may", "could"
- Use their actual words from this week where they sharpen the picture
- Don't over-correct from one week — note movement, don't declare transformation

Return valid JSON (no fences):
{
  "client_context": { ... updated full client_context object ... },
  "growth_edges": { "edges": [ ... updated full edges array ... ] },
  "development_map": { "traits": [ ... updated full traits array ... ] }
}`,
          messages: [{
            role: "user",
            content: `## Current Profile

### Client Context
${JSON.stringify(profile.client_context, null, 2)}

### Growth Edges
${JSON.stringify(profile.growth_edges, null, 2)}

### Development Map
${JSON.stringify(profile.development_map, null, 2)}

### Observations This Week
${profile.observations_log && profile.observations_log.length > 0
  ? profile.observations_log
      .filter((o) => {
        const obsDay = (o as Record<string, unknown>).day as number;
        return obsDay >= startDay && obsDay <= endDay;
      })
      .map((o) => `- Day ${(o as Record<string, unknown>).day}: ${(o as Record<string, unknown>).observation} (${(o as Record<string, unknown>).evidence})`)
      .join("\n")
  : "No new observations this week."}

### This Week's Insights
${(result.insights || []).map((i: { type: string; insight: string }) => `- [${i.type}] ${i.insight}`).join("\n")}

Refine the profile based on what this week revealed.`,
          }],
        });

        const refBlock = refinementMsg.content.find((b) => b.type === "text");
        if (refBlock && refBlock.type === "text") {
          let refRaw = refBlock.text.trim();
          if (refRaw.startsWith("```")) {
            refRaw = refRaw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }
          const refined = JSON.parse(refRaw);

          // Update the profile via admin client
          const admin = getAdminSupabase();
          await admin
            .from("client_profiles")
            .update({
              client_context: refined.client_context,
              growth_edges: refined.growth_edges,
              development_map: refined.development_map,
              last_refined_at: new Date().toISOString(),
            })
            .eq("enrollment_id", enrollmentId);
        }
      } catch (refineErr) {
        // Refinement is supplementary — never block insights delivery
        console.warn("Profile refinement failed (non-blocking):", refineErr);
      }
    }

    return NextResponse.json({
      ...result,
      summary,
      week_theme: weekTheme,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/weekly-insights:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
