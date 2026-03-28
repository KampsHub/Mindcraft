import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt, appendObservation } from "@/lib/client-profile";
import { validateBody, dailySummarySchema, getAnthropicClient, getModelForTier, buildCachedSystem } from "@/lib/api-validation";
import { parseAIResponse } from "@/lib/parse-ai-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";
import { STANDARD_VOICE } from "@/lib/coaching-voice";

const SUMMARY_SYSTEM_PROMPT = `You are the coaching companion closing today's session. You receive today's complete session data: journal entry, exercise completions with responses, free-flow captures, and the upcoming day's territory.

Your job is to reflect back what someone said and did today — in their language, at their pace. If they wrote a lot, you can say more. If they wrote briefly, keep it brief. Don't perform insight. Don't analyze. Just name what happened, in a way that makes them feel heard.

IMPORTANT: Match their energy. Short input = short summary. Deep input = you can go deeper. Never write more than they did.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "summary": "2 sentences max. What they said. What happened. No interpretation.",
  "questions_to_sit_with": ["2-3 questions to carry until tomorrow. Drawn from what they wrote. Not therapy questions — honest, specific questions about their situation."],
  "challenges": ["2-3 small real-world actions/experiments to try before tomorrow. Under 5 minutes each. Verb first. Connected to what they wrote today. Not exercises — things they do in a real moment."],
  "thread_seed": "1-2 sentences for tomorrow's context. What happened today and what's still open. Reference their words.",
  "extracted_commitments": ["Only things they explicitly said they would do. If nothing, empty array."]
}

## Guidelines
1. Keep it SHORT. 2 sentences for the summary. 1 sentence per question/challenge. That's it.
2. Quote one thing they actually wrote. No paraphrasing.
3. No motivational language. No "great work." No "you explored."
4. Questions should be specific to what they wrote — not generic coaching questions.
5. Challenges should be things they can do in a real moment — verb first, under 5 minutes.
6. Match their energy. If they wrote 20 words today, your entire output should be under 50 words.
7. No editorial theme tags like "somatic awareness breakthrough" — just reflect what happened.
8. Frame everything as observation, not diagnosis. "It seemed like..." not "You were..." Never declare what someone's behavior means — offer it as one possible reading.
9. SAFETY: Only flag for crisis if the journal contains EXPLICIT statements of suicidal intent, active self-harm plans, or being a danger to self/others. Normal grief, anger, shame, self-doubt, and career despair are expected in a coaching program — do NOT treat them as crisis. If genuine crisis, include: "What you wrote carries real weight. Please reach out: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), or crew@allmindsondeck.com."`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(dailySummarySchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId, dayNumber, sessionId } = validation.data;

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
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Rate limit (AI bucket — 10 req/min)
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Fetch today's session
    const { data: session } = await supabase
      .from("daily_sessions")
      .select("id, day_number, step_1_themes, step_2_journal, step_3_analysis, step_5_summary, day_rating, day_feedback, completed_at, enrollment_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Could not find your session. Please refresh the page." }, { status: 404 });
    }

    // Fetch today's exercise completions
    const { data: exercises } = await supabase
      .from("exercise_completions")
      .select("framework_name, exercise_type, modality, responses, star_rating, custom_framing")
      .eq("daily_session_id", sessionId);

    // Fetch today's free-flow entries
    const { data: freeFlow } = await supabase
      .from("free_flow_entries")
      .select("content, created_at")
      .eq("daily_session_id", sessionId)
      .order("created_at", { ascending: true });

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    // Fetch tomorrow's program day
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("program_id")
      .eq("id", enrollmentId)
      .single();

    let tomorrowContext = { title: "End of program", territory: "Completion", day_number: dayNumber + 1 };
    if (enrollment) {
      const { data: tomorrowDay } = await supabase
        .from("program_days")
        .select("title, territory, day_number")
        .eq("program_id", enrollment.program_id)
        .eq("day_number", dayNumber + 1)
        .single();
      if (tomorrowDay) {
        tomorrowContext = tomorrowDay;
      }
    }

    // Fetch recent sessions for pattern detection
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("day_number, step_1_themes, step_2_journal")
      .eq("enrollment_id", enrollmentId)
      .lt("day_number", dayNumber)
      .order("day_number", { ascending: false })
      .limit(5);

    // Fetch today's program day for micro-content
    let microContent = "";
    if (enrollment) {
      const { data: todayDay } = await supabase
        .from("program_days")
        .select("micro_content")
        .eq("program_id", enrollment.program_id)
        .eq("day_number", dayNumber)
        .single();
      if (todayDay?.micro_content) {
        microContent = todayDay.micro_content;
      }
    }

    const userPrompt = `
## Today's Journal (Day ${dayNumber})
${session.step_2_journal || "No journal entry today."}

## Today's Exercise Completions
${exercises && exercises.length > 0
  ? exercises.map((e) =>
      `### ${e.framework_name} (${e.exercise_type}, ${e.modality})
Framing: ${e.custom_framing || "standard"}
Rating: ${e.star_rating || "not yet rated"}
Responses: ${JSON.stringify(e.responses)}`
    ).join("\n\n")
  : "No exercises completed today."}

## Free-Flow Captures Today
${freeFlow && freeFlow.length > 0
  ? freeFlow.map((f) => `[${new Date(f.created_at).toLocaleTimeString()}] ${f.content}`).join("\n")
  : "No free-flow captures today."}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

## Recent Days (for pattern detection)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map((s) => `Day ${s.day_number}: ${(s.step_2_journal as string)?.substring(0, 300) || "(no entry)"}`).join("\n\n")
  : "No prior sessions."}

## Tomorrow Preview
Day ${tomorrowContext.day_number}: ${tomorrowContext.title}
Territory: ${tomorrowContext.territory}

Generate today's summary for Day ${dayNumber}.`;

    // Fetch client profile for personalization
    const profile = await getClientProfile(enrollmentId, "edges");
    const profileContext = formatProfileForPrompt(profile, "edges");

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    const memories = await getRelevantMemories(user.id, 8);
    const memoryContext = formatMemoriesForPrompt(memories);

    const message = await anthropic.messages.create({
      model: getModelForTier("standard"),
      max_tokens: 500,
      system: buildCachedSystem(STANDARD_VOICE, SUMMARY_SYSTEM_PROMPT),
      messages: [{ role: "user", content: memoryContext + profileContext + userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Unable to generate response. Please try again in a moment." }, { status: 500 });
    }

    let result;
    try {
      result = parseAIResponse<Record<string, any>>(textBlock.text);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", textBlock.text.substring(0, 200));
      return NextResponse.json(
        { error: "Unable to process response. Please try again." },
        { status: 500 }
      );
    }

    // ── Daily observation extraction (background, non-blocking) ──
    // Only run if profile exists (Day 4+) and journal content is present
    if (profile && session.step_2_journal && dayNumber > 3) {
      try {
        const obsMsg = await anthropic.messages.create({
          model: getModelForTier("fast"),
          max_tokens: 300,
          system: `You are noting what's new about this person based on today's session. Only note genuine observations — things that shifted, surprised, or revealed something that wasn't visible before. If nothing new surfaced today, return exactly: null

Return valid JSON (no fences):
{
  "observation": "One sentence — what was new or shifted",
  "evidence": "The specific words or moment that revealed it",
  "connects_to": "Which growth edge or trait this touches, or null"
}`,
          messages: [{
            role: "user",
            content: `Today's journal:\n${session.step_2_journal}\n\nToday's summary themes: ${(result.today_themes || []).join(", ")}\n\nKnown growth edges:\n${profile.growth_edges ? JSON.stringify((profile.growth_edges as Record<string, unknown>).edges) : "none"}`,
          }],
        });

        const obsBlock = obsMsg.content.find((b) => b.type === "text");
        if (obsBlock && obsBlock.type === "text") {
          let obsRaw = obsBlock.text.trim();
          if (obsRaw.startsWith("```")) {
            obsRaw = obsRaw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }
          if (obsRaw !== "null") {
            const obs = JSON.parse(obsRaw);
            await appendObservation(enrollmentId, {
              day: dayNumber,
              date: new Date().toISOString().split("T")[0],
              observation: obs.observation,
              evidence: obs.evidence,
              connects_to: obs.connects_to,
            });
          }
        }
      } catch (obsErr) {
        // Observation extraction is supplementary — never block the summary
        console.warn("Observation extraction failed (non-blocking):", obsErr);
      }
    }

    return NextResponse.json({
      ...result,
      micro_content: microContent,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/daily-summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
