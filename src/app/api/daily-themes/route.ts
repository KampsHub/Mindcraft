import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const THEMES_SYSTEM_PROMPT = `You are a pattern analyst for a structured coaching program. You receive yesterday's journal entry, recent exercise completions, free-flow captures, and multi-day theme history.

Your job is to produce a concise "yesterday's themes" summary that the client reads at the start of their new day.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "themes": ["theme 1", "theme 2", "theme 3"],
  "summary": "2-3 sentences summarizing what surfaced yesterday. Reference the client's actual words. Be specific, not generic.",
  "patterns": [
    {
      "observation": "A pattern you see across multiple days. Be concrete.",
      "days_observed": 3,
      "connection": "How this connects to their active goals or program territory."
    }
  ],
  "carry_forward": "One sentence about what to notice today based on what surfaced yesterday."
}

## Guidelines
1. Reference the client's actual words — use brief quotes.
2. Be direct. No motivational language. No "great job" or "keep going."
3. Patterns require at least 2 days of evidence. Don't fabricate patterns from a single entry.
4. If there's not enough data (Day 1), say so honestly and keep the summary brief.
5. The carry_forward should be an observation or question, not an instruction.`;

export async function POST(request: Request) {
  try {
    const { enrollmentId, dayNumber } = await request.json();

    if (!enrollmentId || !dayNumber) {
      return NextResponse.json(
        { error: "Missing enrollmentId or dayNumber" },
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

    // Fetch theme history (last 7 sessions)
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("day_number, step_1_themes, step_2_journal, step_5_summary")
      .eq("enrollment_id", enrollmentId)
      .lt("day_number", dayNumber)
      .order("day_number", { ascending: false })
      .limit(7);

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

    // Build the prompt
    const promptData = `
## Yesterday's Journal (Day ${dayNumber - 1})
${yesterdaySession?.step_2_journal || "No journal entry yesterday."}

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

## Theme History (last 7 days)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map((s) => {
      const themes = s.step_1_themes as Record<string, unknown>;
      return `Day ${s.day_number}: ${JSON.stringify(themes?.themes || [])}`;
    }).join("\n")
  : "No prior theme history."}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

Generate yesterday's themes summary for Day ${dayNumber}.`;

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: THEMES_SYSTEM_PROMPT,
      messages: [{ role: "user", content: promptData }],
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

    return NextResponse.json({
      ...result,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/daily-themes:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
