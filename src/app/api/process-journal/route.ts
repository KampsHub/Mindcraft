import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt } from "@/lib/client-profile";
import { validateBody, processJournalSchema, getAnthropicClient, buildCachedSystem, getModelForTier } from "@/lib/api-validation";
import { parseAIResponse } from "@/lib/parse-ai-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractMemories, getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";
import { STANDARD_VOICE } from "@/lib/coaching-voice";

const PROCESS_SYSTEM_PROMPT = `You are the coaching companion for a structured development program. You receive:
1. Today's free-flow journal entry
2. The full frameworks library (350+ exercises across 5 modalities)
3. Recent exercise history (to avoid repeats)
4. The client's active goals
5. Today's program day context (territory, coaching exercises already assigned)

Your job is to read what someone actually wrote, name what you see in it, and select exercises that respond to what surfaced.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "state_analysis": {
    "reading": "2-3 sentences MAX. Quote one thing they wrote. Say one thing you noticed — using 'I noticed' not 'You are.' Frame all observations as tentative: 'It seems like...', 'It looks like...', 'One way to read this is...' Never declare what they're feeling, why they did something, or state a pattern as fact. Never say 'The pattern is clear' or 'You are [doing X]' — say 'It sounds like you might be [doing X].' If they wrote 10 words, you respond with 20 words. Match their energy exactly.",
    "key_themes": ["theme1", "theme2"],
    "urgency_level": "low | medium | high"
  },
  "overflow_exercises": [
    {
      "framework_name": "Exact name from the library",
      "framework_id": "UUID from the library",
      "modality": "cognitive | somatic | relational | integrative | systems",
      "instruction": "The actual exercise instruction. Action-first. Tell them exactly what to do, step by step, in plain language. 3-5 steps max. Start each step with a verb.",
      "why_now": "One sentence connecting this exercise to what they wrote today. Pattern-level, not generic.",
      "why_this_works": "One sentence on the neuroscientific, psychological, or behavioral mechanism. What this exercise does to the brain/body and why it helps. Plain language — no jargon.",
      "estimated_minutes": 10,
      "originator": "Framework originator name"
    }
  ],
  "pattern_challenge": {
    "pattern": "Name of the pattern you noticed (e.g., 'The Preemptive Exit')",
    "description": "1-2 sentences explaining what this pattern is and how it shows up for them specifically, grounded in what they wrote",
    "challenge": "What this pattern costs them or blocks",
    "counter_move": "One concrete thing they could try differently this week"
  },
  "coaching_questions": ["1-2 questions that invite deeper reflection on what they wrote"],
  "reframe": {
    "old_thought": "A limiting belief surfaced in their writing",
    "new_thought": "A reframe that holds the same truth without the self-punishment",
    "source_quote": "The exact words from their journal that this reframe responds to"
  },
  "sequence_suggestion": "Optional — one sentence suggesting what to do first if they feel overwhelmed by the exercises"
}

## Selection Rules
1. Select exactly 2 overflow_exercises matched to what the person wrote today. Each must respond to something specific in their journal.
2. If the person has active goals, also select 1 exercise connected to their goals (include in overflow_exercises with why_now referencing the goal).
3. If the person is in high distress, prioritize somatic (grounding) over everything else.
4. Never repeat an exercise they did in the last 3 days.
5. Instructions must be action-first but MUST be preceded by context. For every exercise:
   - Start with WHY this exercise was selected (connection to their writing)
   - Explain the concept behind it in plain language (e.g., "A saboteur is an inner voice that criticizes or shames you — like a harsh internal boss. Everyone has 2-3 dominant ones.")
   - Explain WHY it works (the neuroscience/psychology in one sentence)
   - THEN give the steps
6. IMPORTANT: Your total output should be SHORT. If the user wrote 50 words, keep readings brief. But exercises always need full context + steps regardless of journal length.
7. **Assessment weighting**: If disruption assessment scores are provided, weight exercise selection toward low-scoring domains (scores ≤ 4). When the journal touches on a low-scoring area, the exercise should feel directly responsive to both what they wrote AND the underlying disruption. This does NOT mean every exercise must address a low-scoring domain — journal relevance always comes first — but when choosing between equally relevant options, prefer exercises that address disrupted areas.
9. **Framework attribution**: When selecting a framework, use its exact official name and originator as listed in the library. Specifically: "The Seven Levels of Personal, Group and Organizational Effectiveness" must always use the full name and be attributed to BEabove Leadership (© BEabove Leadership). Never abbreviate or paraphrase copyrighted framework names.
10. **Profile-driven selection**: If a client profile with growth edges is provided, weight exercise selection toward exercises that address known growth edges. When choosing between equally relevant options, prefer exercises that target an active growth edge. If the journal entry touches on a known pattern from the profile, select an exercise that specifically addresses that pattern — not just the surface topic.
11. **Learn-Recognize-Practice arc**: Every exercise should complete the full arc. If you select a recognition exercise (naming a pattern, identifying a saboteur), also include a practice step in the instruction — a rehearsal, a script, or a concrete "try this" action. Don't stop at naming; the user should walk away having practiced the alternative.
12. **Scaffolded difficulty by program day**: Adjust instruction complexity based on where they are in the program.
    - Days 1-7: More hand-holding. Provide examples, pre-fill suggestions, narrow the choices. "Here are 3 common patterns — which one resonates?" not "Name your pattern."
    - Days 8-14: Moderate scaffolding. Offer a framework but let them fill in their own content. "Using the OFNR model, try this with your situation."
    - Days 15-21: Lighter touch. Name the tool, give one example, then step back. "You've seen this before — apply it to what came up today."
    - Days 22-30: Minimal scaffolding. The user should be generating their own insight. "What tool from the last 3 weeks fits here? Try it." Don't over-explain frameworks they've already used.
10. SAFETY — urgency_level guide:
  - "low": Normal emotional processing. Sadness, frustration, grief, anger about job loss, self-doubt, feeling stuck — these are ALL normal and expected in a coaching context. Keep urgency "low" for these.
  - "medium": Persistent despair across multiple entries, isolation language ("nobody cares"), or statements about giving up on life goals. Still provide exercises but note the pattern.
  - "high": ONLY for explicit crisis signals — direct statements of suicidal intent ("I want to end it"), active self-harm plans, descriptions of ongoing abuse, or explicit statements of being a danger to self/others. General feelings of being "a burden" or "hopeless about my career" are NOT high urgency — they are normal coaching territory.

  If urgency_level is "high": return empty overflow_exercises and include in state_analysis.reading: "What you wrote carries real weight, and it's beyond what exercises can hold right now. Please reach out: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), or email crew@allmindsondeck.com."

  IMPORTANT: This is a coaching program for people processing job loss, PIPs, and career transitions. Grief, anger, shame, self-doubt, and feeling lost are the ENTIRE POINT of this work. Do not flag normal emotional processing as crisis.`;

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
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
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

    // Fetch recent exercise completions (last 7 days to avoid repeats)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentCompletions } = await supabase
      .from("exercise_completions")
      .select("framework_name, framework_id, modality, completed_at")
      .eq("enrollment_id", enrollmentId)
      .gte("completed_at", sevenDaysAgo)
      .order("completed_at", { ascending: false });

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

    // Fetch Day 1 disruption inventory scores (assessment data)
    let disruptionScoresContext = "";
    if (dayNumber > 1) {
      const { data: disruptionExercise } = await supabase
        .from("exercise_completions")
        .select("responses")
        .eq("enrollment_id", enrollmentId)
        .ilike("framework_name", "%Seven Disruptions%")
        .order("completed_at", { ascending: true })
        .limit(1)
        .single();

      if (disruptionExercise?.responses) {
        try {
          const responses = disruptionExercise.responses as Record<string, string>;
          // Extract scores — stored as JSON in the "main" response field or as direct key-value pairs
          const mainData = responses.main ? JSON.parse(responses.main) : responses;
          const scores: { domain: string; score: number }[] = [];

          for (const [key, val] of Object.entries(mainData)) {
            const numVal = typeof val === "number" ? val : parseFloat(val as string);
            if (!isNaN(numVal) && numVal >= 1 && numVal <= 10) {
              scores.push({ domain: key, score: numVal });
            }
          }

          if (scores.length > 0) {
            // Sort by score ascending — lowest scores = most disrupted = highest priority
            scores.sort((a, b) => a.score - b.score);
            const lowScoring = scores.filter((s) => s.score <= 4);
            const highScoring = scores.filter((s) => s.score >= 7);

            disruptionScoresContext = `
## Disruption Assessment Scores (Day 1 baseline)
${scores.map((s) => `- ${s.domain}: ${s.score}/10`).join("\n")}

${lowScoring.length > 0 ? `**Most disrupted areas (prioritize exercises here):** ${lowScoring.map((s) => s.domain).join(", ")}` : ""}
${highScoring.length > 0 ? `**Strengths (less urgent):** ${highScoring.map((s) => s.domain).join(", ")}` : ""}

When selecting overflow exercises, weight toward the most disrupted domains. If the journal touches on a low-scoring area, that exercise should feel directly responsive to both what they wrote AND what the assessment revealed.`;
          }
        } catch {
          // Non-blocking — if scores can't be parsed, proceed without them
        }
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

    // Fetch yesterday's commitments for follow-through awareness
    let yesterdayCommitments: string[] = [];
    if (dayNumber > 1) {
      const { data: yesterdaySession } = await supabase
        .from("daily_sessions")
        .select("step_5_summary")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", dayNumber - 1)
        .single();
      if (yesterdaySession?.step_5_summary) {
        const summary = yesterdaySession.step_5_summary as Record<string, unknown>;
        yesterdayCommitments = [
          ...((summary.extracted_commitments as string[]) || []),
          ...((summary.committed_actions as string[]) || []),
        ];
      }
    }

    const userPrompt = `
## Today's Journal Entry (Day ${dayNumber})
${journalContent}

${programDayContext}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}
${disruptionScoresContext}

## Yesterday's Commitments
${yesterdayCommitments.length > 0
  ? yesterdayCommitments.map(c => `- ${c}`).join("\n") + "\nIf the journal mentions following through, select exercises that build momentum. If it mentions not following through, select exercises about barriers or re-commitment — never shame."
  : "No commitments from yesterday."}

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
      model: getModelForTier("standard"),
      max_tokens: 2000,
      system: buildCachedSystem(STANDARD_VOICE, systemPrompt),
      messages: [{ role: "user", content: memoryContext + profileContext + userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Unable to generate response. Please try again in a moment." }, { status: 500 });
    }

    let result;
    try {
      result = parseAIResponse<Record<string, any>>(textBlock.text);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", textBlock.text.substring(0, 200));
      return NextResponse.json(
        { error: "Unable to process response. Please try again." },
        { status: 500 }
      );
    }

    // Extract memories from this session (non-blocking, uses Haiku)
    extractMemories(user.id, enrollmentId, dayNumber, journalContent, textBlock.text).catch((err) => console.warn("Memory extraction failed:", err));

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
