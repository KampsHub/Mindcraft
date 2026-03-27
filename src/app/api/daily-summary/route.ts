import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientProfile, formatProfileForPrompt, appendObservation } from "@/lib/client-profile";
import { validateBody, dailySummarySchema, getAnthropicClient } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRelevantMemories, formatMemoriesForPrompt } from "@/lib/coaching-memory";

const SUMMARY_SYSTEM_PROMPT = `You are the coaching companion closing today's session. You receive today's complete session data: journal entry, exercise completions with responses, free-flow captures, and the upcoming day's territory.

Your job is to tell someone what happened today — what moved, what stayed stuck, what's emerging — in their own words.

## Voice

Talk TO the person, not about them. Use "you." Quote their actual words from the journal and exercise responses. When you name what an exercise revealed, say what it revealed — not that they completed it. When you connect today to tomorrow, make it feel like a natural continuation, not a homework assignment.

Be warm and direct. No clinical labels. No motivational language. No "great work" or "well done." Engage with their words.

## What you produce

Return valid JSON (no markdown, no code fences):

{
  "today_themes": ["theme1", "theme2", "theme3"],
  "summary": "3-4 sentences in natural prose. Quote their words. Name what moved, what stayed stuck, and what's emerging. Talk directly to them.",
  "exercise_insights": [
    {
      "exercise_name": "Name of the exercise",
      "insight": "One sentence about what this exercise revealed or shifted — not praise for completing it."
    }
  ],
  "goal_progress": [
    {
      "goal_text": "The goal",
      "observation": "What today's work showed about this goal. Talk to them: 'You wrote about X, which connects to your goal to Y.'"
    }
  ],
  "tomorrow_preview": {
    "title": "Tomorrow's day title",
    "territory": "What territory tomorrow covers",
    "connection": "One sentence connecting today's work to what's coming — organic, not prescriptive."
  },
  "pattern_note": "Optional. If you see a multi-day pattern forming, name it boldly with evidence. Otherwise null.",
  "for_tomorrow": {
    "watch_for": "A specific moment or pattern to notice tomorrow — connected to what surfaced today. Concrete enough to catch in real life.",
    "try_this": "A small behavioral experiment to carry into tomorrow. One action, under 2 minutes, verb-first.",
    "sit_with": "A question to hold without answering. A living question that needs holding, not resolving."
  },
  "thread_seed": "2-3 sentences that explicitly seed tomorrow's Thread. Name what was discovered today and the open question going forward. This should be specific enough that tomorrow's Thread can build directly on it. Reference the person's words. Name the edge they are approaching. Do not give instructions — name what happened and what is emerging.",
  "extracted_commitments": ["Things the person explicitly said they would do, in their own words. Only include genuine commitments from the journal or exercise responses — not things you suggested."],
  "mini_actions": [
    "A specific, concrete action completable in under 5 minutes. Must be behavioral (do something, not think something). Reference their specific situation from today's journal.",
    "Second option — different category. If the first involves another person, this one should be solo (self-care, writing, movement).",
    "Third option — different again. At least one of the three should involve reaching out to someone."
  ]
}

## VOICE INTEGRITY — MANDATORY

When you reference what this person wrote, only quote text that they actually typed in their journal entry or exercise responses. Never attribute your own analysis, reframes, or interpretations to them. Own your observations: "I see..." or "What I notice is..." — not "You said..." unless they literally said it.

When generating the thread_seed and for_tomorrow:
- Only reference what the person actually wrote or said during exercises
- Do not attribute your exercise instructions, reframes, or analysis to them
- The thread_seed should be built from their discoveries, not from your suggestions

When generating extracted_commitments:
- Only include things the person explicitly stated as intentions ("I will...", "I want to try...", "Tomorrow I'm going to...")
- Never include things exercises suggested or that your analysis recommended

## Guidelines
1. Quote their actual words — from the journal and exercise responses.
2. Be direct. No motivational language. No "great work" or "well done."
3. Exercise insights should focus on what was revealed, not praise for completing them.
4. Goal observations should be factual and direct: "You wrote about X, which connects to your goal to Y" — not "You're making progress."
5. The pattern_note is only for genuine multi-day patterns. Don't force it. When you name one, teach something about why it exists.
6. Tomorrow's connection should feel organic, not like a homework assignment.
7. **Framework attribution**: When referencing exercises by name, use the exact official framework name and include the originator. Specifically: "The Seven Levels of Personal, Group and Organizational Effectiveness" must always use the full name and be attributed to BEabove Leadership (© BEabove Leadership). Never abbreviate or paraphrase copyrighted framework names.
8. SAFETY: If today's journal or exercise responses contain signals of crisis (suicidal ideation, self-harm, hopelessness, abuse disclosures, expressions of being a burden), include in summary: "What you wrote carries real weight, and it's beyond what exercises can hold right now. Please reach out: 988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741), or email crew@allmindsondeck.com." Set pattern_note to flag this for review.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(dailySummarySchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId, dayNumber, sessionId } = validation.data;

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

    // Fetch today's session
    const { data: session } = await supabase
      .from("daily_sessions")
      .select("id, day_number, step_1_themes, step_2_journal, step_3_analysis, step_5_summary, day_rating, day_feedback, completed_at, enrollment_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch today's exercise completions
    const { data: exercises } = await supabase
      .from("exercise_completions")
      .select("framework_name, exercise_type, modality, responses, star_rating, custom_framing")
      .eq("daily_session_id", sessionId);

    // Fetch today's free-flow entries
    const { data: freeFlow } = await supabase
      .from("free_flow_entries")
      .select("content, created_at")
      .eq("daily_session_id", sessionId)
      .order("created_at", { ascending: true });

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from("client_goals")
      .select("goal_text")
      .eq("enrollment_id", enrollmentId)
      .eq("status", "active");

    // Fetch tomorrow's program day
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("program_id")
      .eq("id", enrollmentId)
      .single();

    let tomorrowContext = { title: "End of program", territory: "Completion", day_number: dayNumber + 1 };
    if (enrollment) {
      const { data: tomorrowDay } = await supabase
        .from("program_days")
        .select("title, territory, day_number")
        .eq("program_id", enrollment.program_id)
        .eq("day_number", dayNumber + 1)
        .single();
      if (tomorrowDay) {
        tomorrowContext = tomorrowDay;
      }
    }

    // Fetch recent sessions for pattern detection
    const { data: recentSessions } = await supabase
      .from("daily_sessions")
      .select("day_number, step_1_themes, step_2_journal")
      .eq("enrollment_id", enrollmentId)
      .lt("day_number", dayNumber)
      .order("day_number", { ascending: false })
      .limit(5);

    // Fetch today's program day for micro-content
    let microContent = "";
    if (enrollment) {
      const { data: todayDay } = await supabase
        .from("program_days")
        .select("micro_content")
        .eq("program_id", enrollment.program_id)
        .eq("day_number", dayNumber)
        .single();
      if (todayDay?.micro_content) {
        microContent = todayDay.micro_content;
      }
    }

    const userPrompt = `
## Today's Journal (Day ${dayNumber})
${session.step_2_journal || "No journal entry today."}

## Today's Exercise Completions
${exercises && exercises.length > 0
  ? exercises.map((e) =>
      `### ${e.framework_name} (${e.exercise_type}, ${e.modality})
Framing: ${e.custom_framing || "standard"}
Rating: ${e.star_rating || "not yet rated"}
Responses: ${JSON.stringify(e.responses)}`
    ).join("\n\n")
  : "No exercises completed today."}

## Free-Flow Captures Today
${freeFlow && freeFlow.length > 0
  ? freeFlow.map((f) => `[${new Date(f.created_at).toLocaleTimeString()}] ${f.content}`).join("\n")
  : "No free-flow captures today."}

## Active Goals
${activeGoals && activeGoals.length > 0
  ? activeGoals.map((g) => `- ${g.goal_text}`).join("\n")
  : "No active goals yet."}

## Recent Days (for pattern detection)
${recentSessions && recentSessions.length > 0
  ? recentSessions.map((s) => `Day ${s.day_number}: ${(s.step_2_journal as string)?.substring(0, 300) || "(no entry)"}`).join("\n\n")
  : "No prior sessions."}

## Tomorrow Preview
Day ${tomorrowContext.day_number}: ${tomorrowContext.title}
Territory: ${tomorrowContext.territory}

Generate today's summary for Day ${dayNumber}.`;

    // Fetch client profile for personalization
    const profile = await getClientProfile(enrollmentId, "edges");
    const profileContext = formatProfileForPrompt(profile, "edges");

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    // Retrieve coaching memories for continuity
    const memories = await getRelevantMemories(user.id, 8);
    const memoryContext = formatMemoriesForPrompt(memories);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SUMMARY_SYSTEM_PROMPT,
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

    // ── Daily observation extraction (background, non-blocking) ──
    // Only run if profile exists (Day 4+) and journal content is present
    if (profile && session.step_2_journal && dayNumber > 3) {
      try {
        const obsMsg = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: `You are noting what's new about this person based on today's session. Only note genuine observations — things that shifted, surprised, or revealed something that wasn't visible before. If nothing new surfaced today, return exactly: null

Return valid JSON (no fences):
{
  "observation": "One sentence — what was new or shifted",
  "evidence": "The specific words or moment that revealed it",
  "connects_to": "Which growth edge or trait this touches, or null"
}`,
          messages: [{
            role: "user",
            content: `Today's journal:\n${session.step_2_journal}\n\nToday's summary themes: ${(result.today_themes || []).join(", ")}\n\nKnown growth edges:\n${profile.growth_edges ? JSON.stringify((profile.growth_edges as Record<string, unknown>).edges) : "none"}`,
          }],
        });

        const obsBlock = obsMsg.content.find((b) => b.type === "text");
        if (obsBlock && obsBlock.type === "text") {
          let obsRaw = obsBlock.text.trim();
          if (obsRaw.startsWith("```")) {
            obsRaw = obsRaw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
          }
          if (obsRaw !== "null") {
            const obs = JSON.parse(obsRaw);
            await appendObservation(enrollmentId, {
              day: dayNumber,
              date: new Date().toISOString().split("T")[0],
              observation: obs.observation,
              evidence: obs.evidence,
              connects_to: obs.connects_to,
            });
          }
        }
      } catch (obsErr) {
        // Observation extraction is supplementary — never block the summary
        console.warn("Observation extraction failed (non-blocking):", obsErr);
      }
    }

    return NextResponse.json({
      ...result,
      micro_content: microContent,
      usage: message.usage,
    });
  } catch (error: unknown) {
    console.error("Error in /api/daily-summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
