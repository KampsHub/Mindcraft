import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const INSIGHTS_SYSTEM_PROMPT = `You are a pattern analyst for a structured coaching program. You receive a full week of daily session data: journal entries, exercise completions with client responses, day ratings, and the program's weekly theme.

Your job is to extract the 4-6 most important insights from the week — things the client actually said, patterns that emerged, shifts that happened, or sticking points that persisted.

Return valid JSON (no markdown, no code fences):

{
  "insights": [
    {
      "insight": "One clear sentence about what surfaced this week.",
      "source": "Brief attribution — 'From Day 3 journal' or 'Across Days 2-4 exercises' or 'Day 5 Saboteur Identification'",
      "type": "pattern" | "shift" | "sticking_point" | "breakthrough" | "connection"
    }
  ]
}

## Guidelines
1. Use the client's actual words when possible — short quotes, not paraphrases.
2. Prioritize patterns that span multiple days over single-day observations.
3. "shift" = something that changed or moved. "sticking_point" = something that stayed stuck despite attention. "breakthrough" = a moment of genuine new understanding. "connection" = a link between two things the client hadn't seen before. "pattern" = a recurring theme.
4. Be direct. No motivational language. No praise.
5. Each insight should be actionable context — something a coach would want to know going into next week.
6. Maximum 6 insights. Quality over quantity.`;

export async function POST(request: Request) {
  try {
    const { enrollmentId, weekNumber } = await request.json();

    if (!enrollmentId || !weekNumber) {
      return NextResponse.json(
        { error: "Missing enrollmentId or weekNumber" },
        { status: 400 }
      );
    }

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

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: INSIGHTS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
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
        system: `You write concise weekly summaries for a coaching client's self-review. You receive structured insights from the week. Write a 3-5 sentence narrative paragraph that covers: key patterns noticed, journal themes, exercise engagement, and overall progress or emerging direction. Write in second person ("you"). Be direct — no praise, no motivational language. The summary should read like something a thoughtful coach would write in a case note.`,
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
