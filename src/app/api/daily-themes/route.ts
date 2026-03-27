import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, dailyThemesSchema, getAnthropicClient, getModelForTier, buildCachedSystem } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { STANDARD_VOICE } from "@/lib/coaching-voice";

const THEMES_SYSTEM_PROMPT = `You are the coaching companion for a structured development program. You receive the last 2-3 journal entries, exercise responses, free-flow captures, a thread seed from yesterday's summary, and today's program territory.

Your primary output is the Thread — a brief, grounded recap of what the person actually said and did in their last sessions, plus any patterns you're noticing across days. This is NOT an interpretation or analysis. It's a "here's what you said, here's what I noticed" summary that helps them pick up where they left off.

IMPORTANT: Match the length and energy of their input. If they wrote 3 sentences yesterday, your thread should be 3-5 sentences — not paragraphs. If they went deep, you can go a little deeper. Don't overinterpret short entries.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "thread": "A brief recap grounded in what they actually wrote. Start with their words, not your interpretation. If a pattern is emerging across days, name it simply — 'You keep coming back to X' or 'This is the second time you've mentioned Y.' Don't perform insight. If a thread_seed was provided, use it as your starting point. Match your length to their input length. 3-8 sentences max unless they wrote extensively.",

  "themes": ["theme 1", "theme 2", "theme 3"],
  "summary": "Brief 2-sentence summary for metadata purposes.",

  "personal_prompt": {
    "prompt": "A personally grounded journaling prompt. Use backward-looking framing: 'recently', 'the last couple of days'. Never reference 'today' as if the day has already happened. Connect to what the person wrote recently.",
    "context": "Why this prompt fits right now — reference their recent writing."
  },

  "follow_up": {
    "commitments": ["Only things they explicitly said they would do — in their own words. If they didn't commit to anything, return an empty array. Never invent commitments."],
    "check_in_prompt": "A single sentence asking how it went, if they committed to something. E.g., 'You said you'd write about how your body feels — did you?' If no commitments, this is null."
  },

  "patterns": [
    {
      "observation": "A pattern across multiple days — stated simply, with evidence. Not an analysis — just 'You keep coming back to X' or 'This is the second time Y showed up.'",
      "days_observed": 2,
      "connection": "One sentence — how this connects to what they're working on."
    }
  ],
  "carry_forward": "A living question to sit with — not an instruction. One sentence max."
}

## Guidelines
1. The Thread is the most important output. Ground it in concrete observations from the last 2-3 sessions.
2. Quote their actual words — show them you read carefully.
3. Be direct. No motivational language. No "great job" or "keep going."
4. Journal prompts are backward-looking. Use "recently," "the last couple of days" — never "today" as if the day happened.
5. Patterns require at least 2 days of evidence. Don't fabricate patterns from a single entry.
6. The carry_forward should be a question or observation, not an instruction.
7. When naming patterns, keep it simple — "You keep coming back to X" or "This showed up again." Don't teach or analyze the pattern unless they've seen it 3+ times.
8. For follow_up.commitments, only include things the person explicitly said they would do. If they didn't commit to anything, return an empty array.
9. The check_in_prompt is a single sentence asking how their commitment went. If no commitments, set to null.
10. IMPORTANT: Don't carry forward unanswered coaching questions or past highlights. If someone didn't engage with something, let it go. Only carry forward their own commitments.`;

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
      system: buildCachedSystem(STANDARD_VOICE, THEMES_SYSTEM_PROMPT),
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

    const responseData = {
      ...result,
      usage: message.usage,
      // Commitment tracking data (passthrough from recent sessions)
      yesterday_commitments: extractedCommitments,
      yesterday_committed_actions: committedActions,
      yesterday_for_tomorrow: forTomorrow || null,
      active_pattern_challenges: recentPatternChallenges,
    };

    // Cache themes in daily_sessions so the day page can load instantly
    // (upsert — creates session if it doesn't exist yet)
    try {
      await supabase
        .from("daily_sessions")
        .upsert(
          {
            enrollment_id: enrollmentId,
            day_number: dayNumber,
            step_1_themes: responseData,
          },
          { onConflict: "enrollment_id,day_number" }
        );
    } catch {
      // Non-blocking — if caching fails, the response still works
    }

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error("Error in /api/daily-themes:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
