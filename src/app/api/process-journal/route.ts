import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PROCESS_SYSTEM_PROMPT = `You are the adaptive exercise selection engine for a structured coaching program. You receive:
1. Today's free-flow journal entry
2. The full frameworks library (250+ exercises across 5 modalities)
3. Recent exercise history (to avoid repeats)
4. The client's active goals
5. Today's program day context (territory, coaching exercises already assigned)

Your job is to analyze the journal content and select up to 5 overflow exercises — one from each modality — that respond to what the client actually wrote today.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "state_analysis": {
    "emotional_state": "What emotional state is present in the journal. Be specific.",
    "cognitive_patterns": "What thinking patterns are showing up.",
    "somatic_signals": "Any body-based signals mentioned or implied.",
    "key_themes": ["theme1", "theme2"],
    "urgency_level": "low | medium | high",
    "goal_connections": ["Which active goals this connects to"]
  },
  "overflow_exercises": [
    {
      "framework_name": "Exact name from the library",
      "framework_id": "UUID from the library",
      "modality": "cognitive | somatic | relational | integrative | systems",
      "why_selected": "1-2 sentences explaining why this exercise matches what surfaced in the journal. Reference the client's words.",
      "custom_framing": "How to present this exercise to the client right now, referencing their specific situation.",
      "estimated_minutes": 10,
      "originator": "Framework originator name",
      "source_work": "Source methodology"
    }
  ]
}

## Selection Rules
1. Select exactly one exercise per modality when possible: cognitive, somatic, relational, integrative, systems.
2. Every exercise must respond to something specific in today's journal. No generic selections.
3. If the client is in high distress, prioritize somatic (grounding) and cognitive (containment) over relational and systems.
4. Never repeat an exercise the client did in the last 3 days.
5. Use the when_to_use field from the library to match signals in the journal.
6. Reference the client's actual words in why_selected and custom_framing.
7. If a modality doesn't have a relevant match, skip it. Quality over coverage.
8. Order by relevance — most needed first.
9. **Framework attribution**: When selecting a framework, use its exact official name and originator as listed in the library. Specifically: "The Seven Levels of Personal, Group and Organizational Effectiveness" must always use the full name and be attributed to BEabove Leadership (© BEabove Leadership). Never abbreviate or paraphrase copyrighted framework names.
10. SAFETY: If the journal contains signals of crisis (suicidal ideation, self-harm, hopelessness, abuse, or being a burden), do NOT select exercises. Instead return an empty overflow_exercises array and include in state_analysis.emotional_state: "Crisis signals detected. This entry requires human support, not exercises." Set urgency_level to "high".`;

export async function POST(request: Request) {
  try {
    const { enrollmentId, dayNumber, journalContent } = await request.json();

    if (!enrollmentId || !dayNumber || !journalContent) {
      return NextResponse.json(
        { error: "Missing enrollmentId, dayNumber, or journalContent" },
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

    // Fetch all active common frameworks in a single query
    const { data: frameworks } = await supabase
      .from("frameworks_library")
      .select("id, name, category, modality, originator, source_work, difficulty_level, theme_tags, when_to_use, duration_minutes, description")
      .eq("active", true)
      .eq("exercise_scope", "common");

    // Fetch recent exercise completions (last 3 days to avoid repeats)
    const { data: recentCompletions } = await supabase
      .from("exercise_completions")
      .select("framework_name, framework_id, modality, completed_at")
      .eq("enrollment_id", enrollmentId)
      .order("completed_at", { ascending: false })
      .limit(15);

    const recentFrameworkNames = new Set(
      (recentCompletions || []).map((c) => c.framework_name)
    );

    // Filter out recently used
    const candidateFrameworks = (frameworks || []).filter(
      (f) => !recentFrameworkNames.has(f.name as string)
    );

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text, status")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    // Fetch today's program day for context
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("program_id")
      .eq("id", enrollmentId)
      .single();

    let programDayContext = "";
    if (enrollment) {
      const { data: programDay } = await supabase
        .from("program_days")
        .select("title, territory, coaching_exercises, system_notes")
        .eq("program_id", enrollment.program_id)
        .eq("day_number", dayNumber)
        .single();

      if (programDay) {
        programDayContext = `
## Today's Program Context
Day ${dayNumber}: ${programDay.title}
Territory: ${programDay.territory}
Coaching exercises already assigned: ${JSON.stringify(programDay.coaching_exercises)}
System notes: ${programDay.system_notes || "none"}`;
      }
    }

    // Build the prompt — group frameworks by modality for Claude
    const frameworksByModality: Record<string, Record<string, unknown>[]> = {};
    candidateFrameworks.forEach((f) => {
      const mod = (f.modality as string) || "uncategorized";
      if (!frameworksByModality[mod]) frameworksByModality[mod] = [];
      frameworksByModality[mod].push(f);
    });

    const frameworksText = Object.entries(frameworksByModality)
      .map(([modality, fws]) => {
        // Limit each modality to 30 candidates to stay within context
        const limited = fws.slice(0, 30);
        return `### ${modality.toUpperCase()} (${limited.length} exercises)\n${limited
          .map((f) =>
            `- ID: ${f.id}\n  Name: ${f.name}\n  Originator: ${f.originator || "—"}\n  Source: ${f.source_work || "—"}\n  When to use: ${f.when_to_use || "—"}\n  Duration: ${f.duration_minutes || "10-15"}min\n  Themes: ${((f.theme_tags as string[]) || []).join(", ")}`
          )
          .join("\n")}`;
      })
      .join("\n\n");

    const userPrompt = `
## Today's Journal Entry (Day ${dayNumber})
${journalContent}

${programDayContext}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

## Recently Used Exercises (do NOT repeat)
${recentCompletions && recentCompletions.length > 0
  ? recentCompletions.map((c) => `- ${c.framework_name} (${c.modality})`).join("\n")
  : "None yet."}

## Available Frameworks Library
${frameworksText}

Analyze the journal content and select the best overflow exercises for this client today.`;

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: PROCESS_SYSTEM_PROMPT,
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
    console.error("Error in /api/process-journal:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
