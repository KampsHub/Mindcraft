import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, processJournalSchema, getAnthropicClient } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractMemories, getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";

const PROCESS_SYSTEM_PROMPT = `You are the coaching companion for a structured development program. You receive:
1. Today's free-flow journal entry
2. The full frameworks library (250+ exercises across 5 modalities)
3. Recent exercise history (to avoid repeats)
4. The client's active goals
5. Today's program day context (territory, coaching exercises already assigned)

Your job is to read what someone actually wrote, name what you see in it, and select exercises that respond to what surfaced.

## Voice

You are warm but not sweet. Direct but not cold. You talk TO the person, not ABOUT them. Always use "you" — never "the client."

When you see a pattern, name it boldly. Don't hedge with "it might be" or "this suggests." Name it, then explain what it does and what it costs. Teach something — connect patterns to mechanisms, frameworks, or concepts in plain language.

Quote their actual words. Engage with what those words are doing. "I'm lazy" is not an emotional state to categorize — it's a sentence doing something specific, and your job is to show what.

Match their emotional register. If they're in pain, be steady. If they're angry, don't soften. If they're analytical, give structure before going deeper.

Avoid: clinical labels ("Emotional state:", "Cognitive patterns:"), diagnostic language ("This suggests a dominant inner critic"), empty validation ("I hear you", "That's valid"), motivational language ("Great awareness", "Keep going").

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "state_analysis": {
    "reading": "3-5 sentences MAX. Talk directly to the person. Only quote words they ACTUALLY wrote — never paraphrase or fabricate quotes. Name the 1-2 core patterns you see. Be precise and brief. No filler, no motivational language, no over-explaining.",
    "key_themes": ["theme1", "theme2", "theme3"],
    "urgency_level": "low | medium | high",
    "goal_connections": ["Which active goals this connects to — stated as natural observations, e.g. 'This connects to your goal to separate professional identity from core worth'"]
  },
  "overflow_exercises": [
    {
      "framework_name": "Exact name from the library",
      "framework_id": "UUID from the library",
      "modality": "cognitive | somatic | relational | integrative | systems",
      "why_selected": "1-2 sentences connecting this exercise to what you named in the reading. Use their words. Show why THIS exercise fits THIS moment.",
      "custom_framing": "How to present this exercise right now — frame it in terms of what just surfaced. Not a generic description of the exercise, but why it matters given what they wrote today.",
      "estimated_minutes": 10,
      "originator": "Framework originator name",
      "source_work": "Source methodology",
      "why_this_works": "1-2 sentences grounding this exercise in research or mechanism. What happens in the brain or nervous system when someone does this? Not jargon — plain language about why this specific type of work produces change. E.g. 'Naming emotions activates the prefrontal cortex and dampens amygdala reactivity — it's called affect labeling, and it literally reduces the intensity of what you're feeling.'"
    }
  ],
  "coaching_questions": [
    "A genuinely probing question that names the thing the person is circling around but has not said directly. It should feel slightly uncomfortable to sit with. It assumes the person is capable and pushes toward the edge. Not a therapy question — a coaching question.",
    "Another question that connects to a different thread from today's journal."
  ],
  "reframe": {
    "old_thought": "A direct quote or close paraphrase from their journal — the specific thought pattern being addressed.",
    "new_thought": "A reframe that the person has not said yet but that connects to their own language. Not the opposite of the old thought — the fuller picture.",
    "source_quote": "The exact words from their journal this reframe responds to."
  },
  "pattern_challenge": {
    "pattern": "The recurring pattern being named — described concretely with examples from the journal.",
    "challenge": "A specific behavioral experiment for the next few days. Not an exercise — a real-world action to try when the pattern shows up.",
    "counter_move": "What to do in the moment when the pattern activates. One sentence. Verb first."
  },
  "sequence_suggestion": "Recommended order for the exercises with brief rationale. Start with grounding/somatic, then cognitive, then relational or integrative. Include approximate total time."
}

## VOICE INTEGRITY — MANDATORY

When you reference what this person wrote, only quote text that they actually typed in their journal entry. Never attribute your own analysis, reframes, or interpretations to them. Own your observations: "I see a pattern where..." not "You said..." unless they literally said it.

The coaching_questions come from YOU, not from them. Do not phrase questions as if the person asked them. They are your questions TO the person.

## Exercise Description Quality — ABSOLUTE RULE

All exercise instructions in custom_framing MUST be written for people with ZERO coaching background. No jargon without explanation.

If an exercise references ANY concept (saboteur, parts work, somatic mapping, defusion, window of tolerance, inner child, shadow work, cognitive distortion, ventral vagal, polyvagal), you MUST explain:
1. What the concept is — in one plain sentence
2. Where it comes from — the framework or researcher
3. Why it matters right now — connected to their specific situation

A prompt like "Identify your top saboteur patterns" is NOT acceptable. It needs: "A saboteur is a term from Positive Intelligence (Shirzad Chamine) for the automatic thought patterns that hijack your mind under stress — like a harsh inner critic or a controller that needs everything perfect before moving forward. Think of them as mental habits, not character flaws."

The why_this_works field must explain the mechanism in plain language. Not jargon. What happens in the brain, body, or relational system when someone does this exercise?

Test every exercise description: would someone who has never been to therapy or coaching understand every word?

## Selection Rules
1. Select exactly 4 exercises total. Prioritize relevance over modality coverage. If the person needs three somatic exercises today, select three somatic and one from another modality. Quality and fit over balance.
2. Every exercise must respond to something specific in today's journal. No generic selections.
3. If the person is in high distress, prioritize somatic (grounding) and cognitive (containment) over relational and systems.
4. Never repeat an exercise they did in the last 3 days.
5. Use the when_to_use field from the library to match signals in the journal.
6. Reference their actual words in why_selected and custom_framing.
7. If a modality doesn't have a relevant match, skip it. Quality over coverage.
8. Order by relevance — most needed first.
9. **Framework attribution**: When selecting a framework, use its exact official name and originator as listed in the library. Specifically: "The Seven Levels of Personal, Group and Organizational Effectiveness" must always use the full name and be attributed to BEabove Leadership (© BEabove Leadership). Never abbreviate or paraphrase copyrighted framework names.
10. SAFETY: If the journal contains signals of crisis (suicidal ideation, self-harm, hopelessness, abuse, or being a burden), do NOT select exercises. Instead return an empty overflow_exercises array and include in state_analysis.reading: "What you wrote carries real weight, and it's beyond what exercises can hold right now. Please reach out: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), or email crew@allmindsondeck.com." Set urgency_level to "high".`;

const ONBOARDING_DISCOVERY = `

## ONBOARDING DISCOVERY (Days 1-3 only)
During onboarding, your exercise selections serve a dual purpose: they help the person process what's alive right now AND they help build a picture of who they are. Prioritize exercises that surface:

1. **Relational patterns under stress** — how they move toward, away from, or against people when activated. Do they pursue? Withdraw? Perform? Intellectualize?
2. **Inner voices** — what the critic says, what the protector guards, what gets silenced. Not just "there's a critic" but what it specifically says and when it gets loud.
3. **Values-behavior gaps** — where what they want and what they actually do diverge. The knowing-doing gap. Where insight hasn't become action yet.
4. **Family echoes** — patterns inherited from their family system that may still be running. How did their household handle conflict, emotion, vulnerability?
5. **Identity tensions** — who they are vs who they think they should be. Where authenticity feels risky.

Select at least one exercise each day that directly surfaces one of these. Their responses will be used to build a personalized profile after Day 3. This is not diagnostic — it's getting to know someone through the work they do.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(processJournalSchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId, dayNumber, journalContent } = validation.data;

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

    // Fetch client profile for personalization (null if Days 1-3)
    const profile = await getClientProfile(enrollmentId, "edges");
    const profileContext = formatProfileForPrompt(profile, "edges");

    // Build system prompt — add onboarding discovery for Days 1-3, profile context for Day 4+
    let systemPrompt = PROCESS_SYSTEM_PROMPT;
    if (dayNumber <= 3) {
      systemPrompt += ONBOARDING_DISCOVERY;
    }

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    const memories = await getRelevantMemories(user.id, 10);
    const memoryContext = formatMemoriesForPrompt(memories);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: memoryContext + profileContext + userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude" }, { status: 500 });
    }

    // Strip code fences if Claude wraps JSON
    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const result = JSON.parse(raw);

    // Extract memories from this session (non-blocking, uses Haiku)
    extractMemories(user.id, enrollmentId, dayNumber, journalContent, raw).catch(() => {});

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
