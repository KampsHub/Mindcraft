import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, generateGoalsSchema } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";

const GOAL_SYSTEM_PROMPT = `You are a coaching goal architect for All Minds on Deck. You receive a client's pre-start intake responses and their first 3 days of journal entries, exercise responses, and onboarding data from a structured coaching program.

Your job is to generate exactly 6 specific, personalized coaching goals for this client.

## What you produce

Return valid JSON in this exact format (no markdown, no code fences):

{
  "goals": [
    {
      "goal_text": "Specific, actionable coaching goal written in second person",
      "why_generated": "2-3 sentences explaining why this goal was generated based on what the client wrote. Reference their actual words."
    }
  ]
}

## Guidelines

1. Generate exactly 6 goals. Each must be specific to THIS person — reference their actual words, patterns, and situation.
2. Goals should span different dimensions: emotional processing, identity, practical concerns, relational, forward movement, and self-awareness.
3. Goals are NOT tasks. They are developmental outcomes. "Separate financial facts from financial fear" is a goal. "Update your resume" is a task.
4. Each goal must have clear reasoning that the client can read and think "yes, that's exactly right."
5. The first 2-3 goals should address what is most urgent/activated based on what surfaced in Days 1-3.
6. The last 2-3 goals should address deeper patterns — things the client may not fully see yet but that showed up across their responses.
7. Be direct. No motivational language. No "you will discover" or "you will learn." State the work.
8. These goals become the developmental spine of the program. The client will approve 2-3 to be active at a time. The rest stay visible.
9. Order them from most immediately relevant to most developmental/long-term.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(generateGoalsSchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId } = validation.data;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Rate limit (AI bucket — 10 req/min)
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Fetch enrollment with program data
    const { data: enrollment, error: enrollError } = await supabase
      .from("program_enrollments")
      .select("*, programs(*)")
      .eq("id", enrollmentId)
      .eq("client_id", user.id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Fetch Days 1-3 journal entries
    const { data: entries } = await supabase
      .from("entries")
      .select("content, theme_tags, date, metadata")
      .eq("client_id", user.id)
      .order("date", { ascending: true })
      .limit(10);

    // Fetch any exercise completions from Days 1-3
    // (These may not exist yet if daily_sessions table isn't created,
    // so we gracefully handle missing data)
    let exerciseResponses: Record<string, unknown>[] = [];
    try {
      const { data: exercises } = await supabase
        .from("exercise_completions")
        .select("framework_id, responses, exercise_type")
        .eq("enrollment_id", enrollmentId)
        .limit(10);
      if (exercises) exerciseResponses = exercises;
    } catch {
      // exercise_completions table may not exist yet — that's OK
    }

    // Build the prompt
    const promptData = `
## Program
${enrollment.programs?.name || "PARACHUTE"} — ${enrollment.programs?.tagline || "30-Day Coaching Program"}

## Pre-Start Intake Data
${JSON.stringify(enrollment.pre_start_data, null, 2)}

## Onboarding Data (Days 1-3 exercises)
${JSON.stringify(enrollment.onboarding_data, null, 2)}

## Assessment Data
${JSON.stringify(enrollment.assessment_data, null, 2)}

## Journal Entries (Days 1-3)
${
  entries && entries.length > 0
    ? entries
        .map(
          (e: Record<string, unknown>) =>
            `Date: ${e.date}\nThemes: ${(e.theme_tags as string[])?.join(", ") || "none"}\n${e.content}\n---`
        )
        .join("\n")
    : "No journal entries yet."
}

## Exercise Responses (Days 1-3)
${
  exerciseResponses.length > 0
    ? JSON.stringify(exerciseResponses, null, 2)
    : "No exercise responses yet."
}

Generate 6 personalized coaching goals for this client based on everything above.`;

    // Fetch client profile if available (generated just before goals)
    const profile = await getClientProfile(enrollmentId, "edges");
    const profileContext = formatProfileForPrompt(profile, "edges");
    const fullPrompt = profileContext + promptData;

    // Call Claude
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: GOAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: fullPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No response from Claude" },
        { status: 500 }
      );
    }

    const result = JSON.parse(textBlock.text);

    // Save goals to client_goals table
    const goalsToInsert = result.goals.map(
      (
        g: { goal_text: string; why_generated: string },
        index: number
      ) => ({
        enrollment_id: enrollmentId,
        client_id: user.id,
        goal_text: g.goal_text,
        why_generated: g.why_generated,
        status: "proposed",
        order_index: index,
      })
    );

    const { data: savedGoals, error: saveError } = await supabase
      .from("client_goals")
      .insert(goalsToInsert)
      .select();

    if (saveError) {
      console.error("Failed to save goals:", saveError);
      return NextResponse.json(
        { error: "Failed to save goals" },
        { status: 500 }
      );
    }

    // Update enrollment status
    await supabase
      .from("program_enrollments")
      .update({ status: "awaiting_goals" })
      .eq("id", enrollmentId);

    return NextResponse.json({
      goals: savedGoals,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/generate-goals:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
