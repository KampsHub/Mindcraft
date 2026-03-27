import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, dailyThemesSchema, getAnthropicClient, getModelForTier, buildCachedSystem } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { COMPRESSED_VOICE } from "@/lib/coaching-voice";

const THEMES_SYSTEM_PROMPT = `You are the coaching companion for a structured development program. You receive the last 2-3 journal entries, exercise responses, free-flow captures, a thread seed from yesterday's summary, and today's program territory.

Your primary output is the Thread — a narrative that traces the person's movement across their last 2-3 sessions. This is not a summary. It is a reading of where they are in their development arc.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "thread": "2-3 paragraphs of narrative prose. Re-read the last 2-3 journal entries AND exercise responses. Quote the person's actual words. Trace the movement: where did they go deeper? Where did they push back? Where did a pattern show up again? Connect the arc to today's program territory. This should feel like someone who has been reading carefully says: 'Here is the line I see across the last few days, and here is why today matters.' If a thread_seed was provided from yesterday's summary, use it as your starting point.",

  "themes": ["theme 1", "theme 2", "theme 3"],
  "summary": "Brief 2-sentence summary for metadata purposes.",

  "personal_prompt": {
    "prompt": "A personally grounded journaling prompt. Use backward-looking framing: 'recently', 'the last couple of days'. Never reference 'today' as if the day has already happened. Connect to what the person wrote recently.",
    "context": "Why this prompt fits right now — reference their recent writing."
  },

  "follow_up": {
    "commitments": ["Things they explicitly said they would do in exercise responses or journal. Only include things they actually said — not things you suggested."],
    "coaching_questions": ["Unanswered coaching questions from prior sessions. Only carry forward questions that the person did not respond to."],
    "highlight": "A specific exercise response worth revisiting — something they wrote that opened something up or that they left unfinished."
  },

  "patterns": [
    {
      "observation": "A pattern across multiple days — named directly, with evidence.",
      "days_observed": 3,
      "connection": "How this connects to their goals or growth edges."
    }
  ],
  "carry_forward": "A living question or observation to carry into today."
}

## Guidelines
1. The Thread is the most important output. Ground it in concrete observations from the last 2-3 sessions.
2. Quote their actual words — show them you read carefully.
3. Be direct. No motivational language. No "great job" or "keep going."
4. Journal prompts are backward-looking. Use "recently," "the last couple of days" — never "today" as if the day happened.
5. Patterns require at least 2 days of evidence. Don't fabricate patterns from a single entry.
6. The carry_forward should be a question or observation, not an instruction.
7. When naming patterns, teach something — why this pattern exists, what it protects, what it costs.
8. For follow_up.commitments, only include things the person actually wrote they would do. Not things exercises suggested.
9. For follow_up.coaching_questions, only carry forward questions that went unanswered.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(dailyThemesSchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId, dayNumber } = validation.data;

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

    // Fetch yesterday's daily session (dayNumber - 1)
    const { data: yesterdaySession } = await supabase
      .from("daily_sessions")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("day_number", dayNumber - 1)
      .single();

    // Fetch yesterday's exercise completions
    let yesterdayExercises: Record<string, unknown>[] = [];
    if (yesterdaySession) {
      const { data } = await supabase
        .from("exercise_completions")
        .select("framework_name, exercise_type, modality, responses, star_rating")
        .eq("daily_session_id", yesterdaySession.id);
      if (data) yesterdayExercises = data;
    }

    // Fetch recent free-flow entries (last 2 days)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const { data: recentFreeFlow } = await supabase
      .from("free_flow_entries")
      .select("content, created_at")
      .eq("enrollment_id", enrollmentId)
      .gte("created_at", twoDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    // Fetch last 3 sessions with full journal, analysis, and summary data (for Thread)
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("id, day_number, step_1_themes, step_2_journal, step_3_analysis, step_5_summary")
      .eq("enrollment_id", enrollmentId)
      .lt("day_number", dayNumber)
      .order("day_number", { ascending: false })
      .limit(3);

    // Fetch exercise responses from recent sessions (for Thread — what the person actually wrote)
    const recentSessionIds = (recentSessions || []).map(s => s.id).filter(Boolean);
    let recentExerciseResponses: Record<string, unknown>[] = [];
    if (recentSessionIds.length > 0) {
      const { data } = await supabase
        .from("exercise_completions")
        .select("daily_session_id, framework_name, responses, star_rating")
        .in("daily_session_id", recentSessionIds)
        .order("completed_at", { ascending: true });
      if (data) recentExerciseResponses = data;
    }

    // Fetch today's program day for territory context
    let todayContext = { title: "", territory: "" };
    if (true) {
      const { data: enrollmentData } = await supabase
        .from("program_enrollments")
        .select("program_id")
        .eq("id", enrollmentId)
        .single();
      if (enrollmentData) {
        const { data: todayDay } = await supabase
          .from("program_days")
          .select("title, territory")
          .eq("program_id", enrollmentData.program_id)
          .eq("day_number", dayNumber)
          .single();
        if (todayDay) todayContext = todayDay;
      }
    }

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text, status")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    // If Day 1, return a minimal response — no yesterday data
    if (dayNumber === 1) {
      return NextResponse.json({
        themes: [],
        summary: "This is your first day. No themes to review yet.",
        patterns: [],
        carry_forward: "Notice what comes up as you begin.",
      });
    }

    // Extract thread_seed and for_tomorrow from yesterday's summary
    const yesterdaySummary = recentSessions?.[0]?.step_5_summary as Record<string, unknown> | null;
    const threadSeed = yesterdaySummary?.thread_seed || null;
    const forTomorrow = yesterdaySummary?.for_tomorrow as Record<string, unknown> | null;

    // Extract coaching questions from yesterday's analysis (to carry forward if unanswered)
    const yesterdayAnalysis = recentSessions?.[0]?.step_3_analysis as Record<string, unknown> | null;
    const prevCoachingQuestions = (yesterdayAnalysis as Record<string, unknown> | null)?.coaching_questions || [];

    // Build exercise responses text
    const exerciseResponsesText = (recentExerciseResponses || [])
      .map(e => `- ${e.framework_name}: ${JSON.stringify(e.responses).substring(0, 400)}`)
      .join("\n");

    // Build the prompt
    const promptData = `
## Thread Seed from Yesterday's Summary
${threadSeed || "No thread seed available — generate the Thread from the journal entries directly."}

## For Tomorrow (from yesterday's closing)
${forTomorrow ? `Watch for: ${(forTomorrow as Record<string, string>).watch_for || "none"}\nTry this: ${(forTomorrow as Record<string, string>).try_this || "none"}\nSit with: ${(forTomorrow as Record<string, string>).sit_with || "none"}` : "No for_tomorrow prompts from yesterday."}

## Recent Journal Entries (last 2-3 sessions)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map((s) => {
      const summary = s.step_5_summary as Record<string, unknown> | null;
      return `### Day ${s.day_number}\n**Journal:**\n${s.step_2_journal || "(no entry)"}\n\n**Summary:** ${summary?.summary || "(no summary)"}`;
    }).join("\n\n---\n\n")
  : "No prior sessions."}

## Recent Exercise Responses (what the person wrote during exercises)
${exerciseResponsesText || "No exercise responses yet."}

## Previous Coaching Questions (carry forward if unanswered)
${Array.isArray(prevCoachingQuestions) && (prevCoachingQuestions as string[]).length > 0
  ? (prevCoachingQuestions as string[]).map(q => `- ${q}`).join("\n")
  : "None."}

## Yesterday's Exercise Completions
${yesterdayExercises.length > 0
  ? yesterdayExercises.map((e) =>
      `- ${e.framework_name} (${e.exercise_type}, ${e.modality})\n  Rating: ${e.star_rating || "not rated"}\n  Responses: ${JSON.stringify(e.responses).substring(0, 500)}`
    ).join("\n")
  : "No exercises completed yesterday."}

## Recent Free-Flow Captures
${recentFreeFlow && recentFreeFlow.length > 0
  ? recentFreeFlow.map((f) =>
      `[${new Date(f.created_at).toLocaleString()}] ${f.content}`
    ).join("\n")
  : "No free-flow captures."}

## Today's Program Context
Day ${dayNumber}: ${todayContext.title || "unknown"}
Territory: ${todayContext.territory || "unknown"}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

Generate the Thread and today's themes for Day ${dayNumber}.`;

    // Fetch client profile for personalization (edges depth for growth edge naming in Thread)
    const profile = await getClientProfile(enrollmentId, "edges");
    const profileContext = formatProfileForPrompt(profile, "edges");

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    const message = await anthropic.messages.create({
      model: getModelForTier("fast"),
      max_tokens: 2048,
      system: buildCachedSystem(COMPRESSED_VOICE, THEMES_SYSTEM_PROMPT),
      messages: [{ role: "user", content: profileContext + promptData }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const result = JSON.parse(raw);

    // ── Extract commitment tracking data from recent sessions ──
    // Yesterday's commitments (from step_5_summary.extracted_commitments)
    const extractedCommitments = (yesterdaySummary?.extracted_commitments as string[] | undefined) || [];
    const committedActions = (yesterdaySummary?.committed_actions as string[] | undefined) || [];

    // Yesterday's for_tomorrow prompts (already extracted above)
    // forTomorrow is already available from line ~187

    // Active pattern challenges from last 3 days (from step_3_analysis.pattern_challenge)
    const recentPatternChallenges = (recentSessions || [])
      .filter(s => {
        const analysis = s.step_3_analysis as Record<string, unknown> | null;
        return analysis?.pattern_challenge;
      })
      .map(s => {
        const analysis = s.step_3_analysis as Record<string, unknown>;
        const challenge = analysis.pattern_challenge as { pattern: string; challenge: string; counter_move: string };
        return {
          ...challenge,
          day_number: s.day_number,
          days_ago: dayNumber - s.day_number,
        };
      })
      .filter(pc => pc.days_ago <= 3); // Only show challenges from last 3 days

    return NextResponse.json({
      ...result,
      usage: message.usage,
      // Commitment tracking data (passthrough from recent sessions)
      yesterday_commitments: extractedCommitments,
      yesterday_committed_actions: committedActions,
      yesterday_for_tomorrow: forTomorrow || null,
      active_pattern_challenges: recentPatternChallenges,
    });
  } catch (error: unknown) {
    console.error("Error in /api/daily-themes:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
