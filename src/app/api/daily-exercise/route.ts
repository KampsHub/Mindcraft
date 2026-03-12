import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logApiCall } from "@/lib/api-logger";

const EXERCISE_SYSTEM_PROMPT = `You are the daily exercise selector for All Minds on Deck's coaching companion. You receive:
1. The client's coaching plan (goals, focus areas, current phase)
2. Their recent journal entries and theme tags
3. A set of candidate frameworks from the coaching library

Your job: select ONE framework from the candidates and deliver a personalised exercise based on it.

## Selection criteria
- Match the framework to the client's current themes and recent entries
- Follow the coaching plan's weekly theme progression
- Don't repeat a framework the client did recently (check recent entries)
- Prioritise frameworks at the right difficulty level — start easier, go deeper over time
- If the client is in emotional distress, choose a grounding or self-awareness framework, not a challenging one

## Delivery
Adapt the framework's instructions for this specific client. Reference:
- Their actual words from recent entries
- Their specific situation (package context)
- Their values and patterns from the coaching plan

Do NOT just copy-paste the framework instructions. Personalise the framing, the examples, and the opening line.

## Response format
Return valid JSON (no markdown, no code fences):
{
  "framework_name": "Name of the selected framework",
  "framework_id": "UUID of the framework",
  "title": "A personalised title for today's exercise",
  "introduction": "2-3 sentences connecting this exercise to what the client has been working on recently. Reference their words.",
  "exercise": "The full personalised exercise instructions.",
  "estimated_time": "10-15 min",
  "theme_tags": ["relevant_theme_1", "relevant_theme_2"]
}`;

export async function POST() {
  const startTime = Date.now();

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch coaching plan
    const { data: plan } = await supabase
      .from("coaching_plans")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Fetch recent entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: recentEntries } = await supabase
      .from("entries")
      .select("content, theme_tags, date, type")
      .eq("client_id", user.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(10);

    // Fetch recent exercises (to avoid repeats)
    const { data: recentExercises } = await supabase
      .from("exercises")
      .select("framework_id, date")
      .eq("client_id", user.id)
      .order("date", { ascending: false })
      .limit(5);

    const recentFrameworkIds = (recentExercises || []).map((e) => e.framework_id).filter(Boolean);

    // Collect current themes from recent entries
    const currentThemes = [...new Set(
      (recentEntries || []).flatMap((e) => e.theme_tags || [])
    )];

    // Fetch matching frameworks
    const packageFilter = plan?.package || "general";
    const { data: frameworks } = await supabase
      .from("frameworks_library")
      .select("*")
      .eq("active", true)
      .contains("target_packages", [packageFilter]);

    // Filter out recently used frameworks
    const candidateFrameworks = (frameworks || []).filter(
      (f) => !recentFrameworkIds.includes(f.id)
    );

    if (!candidateFrameworks.length) {
      return NextResponse.json(
        { error: "No available frameworks. Please add frameworks to the library." },
        { status: 404 }
      );
    }

    // Build the prompt
    const userPrompt = `
## Client's Coaching Plan
${plan ? JSON.stringify({ goals: plan.goals, focus_areas: plan.focus_areas, weekly_themes: plan.weekly_themes, current_phase: plan.current_phase, package: plan.package }, null, 2) : "No plan generated yet."}

## Recent Journal Entries (last 7 days)
${(recentEntries || []).map((e) => `[${e.date}] (${e.type}) ${e.content?.substring(0, 500)}${e.content && e.content.length > 500 ? "..." : ""}\nThemes: ${(e.theme_tags || []).join(", ")}`).join("\n\n") || "No recent entries."}

## Current Themes
${currentThemes.join(", ") || "None yet."}

## Candidate Frameworks
${candidateFrameworks.map((f) => `- ID: ${f.id}\n  Name: ${f.name}\n  Category: ${f.category}\n  Difficulty: ${f.difficulty_level}\n  Theme tags: ${(f.theme_tags || []).join(", ")}\n  Description: ${f.description}`).join("\n\n")}

Select the best framework and deliver a personalised exercise for today.`;

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: EXERCISE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const latencyMs = Date.now() - startTime;
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    const exercise = JSON.parse(textBlock.text);

    // Save exercise to database
    await supabase.from("exercises").insert({
      client_id: user.id,
      coach_id: user.id,
      coaching_plan_id: plan?.id,
      framework_id: exercise.framework_id,
      content: JSON.stringify(exercise),
      completed: false,
      date: new Date().toISOString().split("T")[0],
    });

    // Log the API call
    await logApiCall({
      clientId: user.id,
      endpoint: "/api/daily-exercise",
      model: message.model,
      inputPrompt: userPrompt.substring(0, 5000),
      output: textBlock.text.substring(0, 5000),
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      latencyMs,
    });

    return NextResponse.json({ exercise, usage: message.usage, latencyMs });
  } catch (error: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    await logApiCall({
      endpoint: "/api/daily-exercise",
      error: errorMessage,
      latencyMs,
    });

    console.error("Error in /api/daily-exercise:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
