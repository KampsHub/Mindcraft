import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logApiCall } from "@/lib/api-logger";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { getAnthropicClient } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";

const EXERCISE_SYSTEM_PROMPT = `You are the coaching companion selecting and delivering today's exercise. You receive:
1. Their coaching plan (goals, focus areas, current phase)
2. Their recent journal entries and theme tags
3. A set of candidate frameworks from the coaching library

Your job: select ONE framework and deliver it in a way that connects to what this person is actually working through right now.

## Voice

Talk TO the person. Use "you." Quote their recent words to show why this exercise, right now. The introduction should feel like: "Given what you wrote yesterday about X, this exercise is going to ask you to look at Y." Not a generic description of the exercise — a framing that connects it to their specific moment.

Be warm and direct. No clinical labels. No motivational language. Teach what the exercise does and why it matters for them specifically.

## Selection criteria
- Match the framework to their current themes and recent entries
- Follow the coaching plan's weekly theme progression
- Don't repeat a framework they did recently (check recent entries)
- Prioritise frameworks at the right difficulty level — start easier, go deeper over time
- If they're in emotional distress, choose a grounding or self-awareness framework, not a challenging one

## Delivery
Adapt the framework's instructions for this specific person. Reference:
- Their actual words from recent entries
- Their specific situation (package context)
- Their values and patterns from the coaching plan

Do NOT just copy-paste the framework instructions. Personalise the framing, the examples, and the opening line.

## Framework attribution
When delivering an exercise, always use the exact official framework name and include the originator. Specifically:
- "The Seven Levels of Personal, Group and Organizational Effectiveness" must always use the full name and be attributed to BEabove Leadership (© BEabove Leadership). Never abbreviate to "Seven Levels" or "Levels of Effectiveness" without the full title and attribution.
- For all frameworks, include the originator name in the introduction so the client sees proper attribution.

## Response format
Return valid JSON (no markdown, no code fences):
{
  "framework_name": "Name of the selected framework",
  "framework_id": "UUID of the framework",
  "title": "A personalised title for today's exercise",
  "introduction": "2-3 sentences connecting this exercise to what the client has been working on recently. Reference their words.",
  "what_this_is": "1-2 sentences explaining the framework in plain language. What it is, where it comes from, and why it matters. Write for someone with zero coaching background.",
  "steps": [
    "Step 1: Clear, specific instruction. Tell them exactly what to do, not what to think about. Include example prompts or sentence starters where helpful.",
    "Step 2: Next action. Each step should be completable in 2-3 minutes.",
    "Step 3: Continue until the exercise is fully instructed.",
    "Step 4: Always end with a reflection or journaling prompt."
  ],
  "estimated_time": "10-15 min",
  "theme_tags": ["relevant_theme_1", "relevant_theme_2"]
}

## Exercise instruction rules
- Every step must be concrete and actionable. "Reflect on your patterns" is NOT a step. "Write down 3 situations this week where you noticed yourself withdrawing" IS a step.
- Include sentence starters, specific prompts, or example responses where helpful.
- If the exercise uses a concept (saboteur, parts, somatic mapping), explain it in plain language within the step — never assume the person knows jargon.
- Steps should build on each other. The person should be able to follow them sequentially without re-reading.
- 4-6 steps per exercise. Not fewer, not more.`;

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

    // Rate limit (AI bucket — 10 req/min)
    const rateLimitResponse = checkRateLimit(user.id, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // Fetch coaching plan
    const { data: plan } = await supabase
      .from("coaching_plans")
      .select("id, goals, focus_areas, weekly_themes, current_phase, package")
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

    // Fetch low-rated exercises (under 4 stars) to exclude from selection
    const { data: lowRatedExercises } = await supabase
      .from("exercise_completions")
      .select("framework_id, star_rating")
      .eq("client_id", user.id)
      .lt("star_rating", 4)
      .not("framework_id", "is", null);
    const lowRatedFrameworkIds = new Set(
      (lowRatedExercises || []).map((e) => e.framework_id).filter(Boolean)
    );

    // Collect current themes from recent entries
    const currentThemes = [...new Set(
      (recentEntries || []).flatMap((e) => e.theme_tags || [])
    )];

    // Fetch matching frameworks
    const packageFilter = plan?.package || "general";
    const { data: frameworks } = await supabase
      .from("frameworks_library")
      .select("id, name, category, modality, originator, source_work, difficulty_level, theme_tags, description, target_packages")
      .eq("active", true)
      .contains("target_packages", [packageFilter]);

    // Filter out recently used and low-rated frameworks
    const candidateFrameworks = (frameworks || []).filter(
      (f) => !recentFrameworkIds.includes(f.id) && !lowRatedFrameworkIds.has(f.id)
    );

    if (!candidateFrameworks.length) {
      return NextResponse.json(
        { error: "No available frameworks. Please add frameworks to the library." },
        { status: 404 }
      );
    }

    // Fetch active enrollment for client profile personalization
    const { data: activeEnrollment } = await supabase
      .from("program_enrollments")
      .select("id")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const profile = activeEnrollment
      ? await getClientProfile(activeEnrollment.id, "summary")
      : null;
    const profileContext = formatProfileForPrompt(profile, "summary");

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

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    const memories = await getRelevantMemories(user.id, 8);
    const memoryContext = formatMemoriesForPrompt(memories);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: EXERCISE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: memoryContext + profileContext + userPrompt }],
    });

    const latencyMs = Date.now() - startTime;
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    // Strip markdown code fences if Claude wraps the JSON in ```json ... ```
    let rawExercise = textBlock.text.trim();
    if (rawExercise.startsWith("```")) {
      rawExercise = rawExercise.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const exercise = JSON.parse(rawExercise);

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

    // Log the API call (without sensitive content for privacy)
    await logApiCall({
      clientId: user.id,
      endpoint: "/api/daily-exercise",
      model: message.model,
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
