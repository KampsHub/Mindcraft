import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const FRAMEWORK_ANALYSIS_PROMPT = `You are a framework analyst for a structured coaching program. You receive multi-day journal entries, exercises, and theme history, plus a library of foundational coaching frameworks.

Your job is to select ONE framework from the library and apply it to a pattern you've detected across the client's recent days. This is educational — you're showing the client how a real framework explains what they're experiencing.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "framework_name": "Name of the selected framework",
  "framework_id": "UUID from the library",
  "originator": "Who created this framework",
  "source_work": "The methodology or book it comes from",
  "explanation": "3-4 sentences explaining what this framework is. Factual, not promotional. Include the key insight.",
  "application": "3-4 sentences applying this framework to what YOU see in the client's pattern. Reference their actual words from multiple days. Show them something they might not see themselves.",
  "reflection_prompt": "One question for the client to sit with after reading this. Not a task — a question that opens something up."
}

## Guidelines
1. Choose a framework that genuinely illuminates a multi-day pattern, not just today's entry.
2. Be factual about the framework — include the originator and source. No vague attributions.
3. The application must reference specific things the client wrote across different days.
4. Don't choose the same framework two weeks in a row.
5. Prefer foundational frameworks (IFS, ACT, Polyvagal, Gottman, NVC, etc.) over niche tools.
6. The reflection_prompt should feel like a coaching question, not a homework assignment.
7. Be direct. No motivational language.`;

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

    // Fetch last 7 days of sessions for multi-day pattern detection
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("day_number, step_2_journal, step_1_themes, step_5_summary")
      .eq("enrollment_id", enrollmentId)
      .lte("day_number", dayNumber)
      .order("day_number", { ascending: false })
      .limit(7);

    // Fetch recent exercise completions with responses
    const { data: recentExercises } = await supabase
      .from("exercise_completions")
      .select("framework_name, exercise_type, modality, responses, star_rating")
      .eq("enrollment_id", enrollmentId)
      .order("completed_at", { ascending: false })
      .limit(20);

    // Fetch foundational frameworks (key frameworks file — 00 series + major ones)
    const { data: frameworks } = await supabase
      .from("frameworks_library")
      .select("id, name, originator, source_work, description, category, modality, neuroscience_rationale")
      .eq("active", true)
      .eq("exercise_scope", "common")
      .limit(60);

    // Fetch recently used frameworks in analysis (avoid repeats)
    const recentAnalysisNames = new Set(
      (recentExercises || [])
        .filter((e) => e.exercise_type === "framework_analysis")
        .map((e) => e.framework_name)
    );

    const candidateFrameworks = (frameworks || []).filter(
      (f) => !recentAnalysisNames.has(f.name)
    );

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    const userPrompt = `
## Recent Journal Entries (newest first)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map((s) => {
      return `Day ${s.day_number}:\n${(s.step_2_journal as string) || "(no journal entry)"}`;
    }).join("\n\n---\n\n")
  : "No journal entries yet."}

## Recent Exercise Responses
${recentExercises && recentExercises.length > 0
  ? recentExercises.slice(0, 10).map((e) =>
      `- ${e.framework_name} (${e.exercise_type}): ${JSON.stringify(e.responses).substring(0, 300)}`
    ).join("\n")
  : "No exercise responses yet."}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

## Available Frameworks for Analysis
${candidateFrameworks.map((f) =>
  `- ID: ${f.id}\n  Name: ${f.name}\n  Originator: ${f.originator || "—"}\n  Source: ${f.source_work || "—"}\n  Category: ${f.category}\n  Description: ${(f.description as string)?.substring(0, 200) || "—"}`
).join("\n\n")}

Select the best framework to apply to this client's multi-day pattern.`;

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: FRAMEWORK_ANALYSIS_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    const result = JSON.parse(textBlock.text);

    return NextResponse.json({
      ...result,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/framework-analysis:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
