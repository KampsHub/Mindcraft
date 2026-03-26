import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/api-validation";

const PLAN_SYSTEM_PROMPT = `You are a coaching plan architect for All Minds on Deck. You receive a client's intake responses — their values, family patterns, identity, relationship style, saboteurs, work context, goals, and package-specific answers.

Your job is to generate a personalised 4-week (30-day) coaching plan. This plan will guide what exercises and frameworks the coaching companion delivers daily.

## What you produce

Return valid JSON in this exact format (no markdown, no code fences):

{
  "summary": "A 2-3 sentence overview of this client's core work — what they're navigating, what patterns are at play, and the growth opportunity.",
  "goals": [
    {
      "goal": "Specific, measurable coaching goal",
      "why": "Why this matters based on their intake responses"
    }
  ],
  "focus_areas": [
    {
      "area": "Name of the focus area",
      "description": "What this means for this client specifically",
      "related_intake": "Which intake responses informed this"
    }
  ],
  "weekly_themes": [
    {
      "weeks": "1",
      "theme": "Theme name",
      "description": "What the client will work on and why it comes first",
      "frameworks": ["Framework or tool suggestions from coaching methodology"]
    }
  ],
  "current_phase": "Name of the opening phase"
}

## Guidelines

1. Generate 3-5 goals. Make them specific to this person — reference their actual words from the intake.
2. Generate 3-4 focus areas. These are the recurring threads the coaching will return to.
3. Generate 4 weekly theme blocks (one per week of the 30-day program). Sequence them intentionally — foundation first, deeper work in the middle, integration at the end.
4. The plan should feel like it was written by someone who read every word of the intake carefully. No generic coaching language.
5. For the weekly themes, suggest specific frameworks: parts work, Enneagram patterns, saboteur identification, values clarification, boundary work, narrative reframing, somatic awareness, Wheel of Life, leadership presence, differentiation, cognitive reframes, grief processing — whichever are relevant.
6. Name patterns you see across their responses. If their family-of-origin answers connect to their relationship patterns or work frustrations, say so.
7. Be direct but warm. This plan is for the coaching system, but the client will see it.`;

export async function POST() {
  try {
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

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch the user's intake responses
    const { data: intake, error: intakeError } = await supabase
      .from("intake_responses")
      .select("*")
      .eq("client_id", user.id)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json(
        { error: "No completed intake found. Please complete intake first." },
        { status: 404 }
      );
    }

    // Build the prompt with intake data
    const intakePrompt = `
## Client's Package
${intake.package}

## Universal Intake Responses
${JSON.stringify(intake.universal, null, 2)}

## Package-Specific Responses
${JSON.stringify(intake.package_specific, null, 2)}

Generate a personalised 4-week coaching plan for this client.`;

    // Call Claude
    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: PLAN_SYSTEM_PROMPT,
      messages: [{ role: "user", content: intakePrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    const plan = JSON.parse(textBlock.text);

    // Save to coaching_plans table
    const { data: savedPlan, error: saveError } = await supabase
      .from("coaching_plans")
      .insert({
        client_id: user.id,
        package: intake.package,
        goals: plan.goals,
        focus_areas: plan.focus_areas,
        weekly_themes: plan.weekly_themes,
        current_phase: plan.current_phase,
        summary: plan.summary,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save plan:", saveError);
      return NextResponse.json({ error: "Failed to save plan" }, { status: 500 });
    }

    return NextResponse.json({
      plan: savedPlan,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/generate-plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
