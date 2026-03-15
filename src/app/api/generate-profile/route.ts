import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateBody, generateProfileSchema } from "@/lib/api-validation";
import { checkRateLimit } from "@/lib/rate-limit";

/* ── Admin client (bypasses RLS for writes) ── */
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/* ── Voice shared across all three calls ── */
const PROFILE_VOICE = `You are building a working model of this person — not a diagnosis. Everything you write is provisional, offered as a lens, not declared as truth.

Voice rules:
- Use "seems to", "may", "could", "there's something here about" — never definitive statements about who someone IS
- Be insightful, not obvious. If a pattern is surface-level, go one layer deeper. Ask yourself: what's underneath this?
- Assume this person is intelligent and fairly self-aware. They'll recognize clichés and generic observations instantly
- Name patterns specifically — use their actual words from the journal, not category labels
- Hold contradictions. Two things can be true at once. Don't flatten complexity
- Don't over-explain. Trust the reader to connect dots
- Reference specific moments from their writing, not generic observations
- When naming what something costs or protects, be concrete — not "this may cause difficulties" but "this means the thing you actually need never gets said out loud"
- Don't perform insight. If you only have 3 days of data and something isn't visible yet, say so. "Not enough here yet" is more useful than a guess`;

/* ── Call 1: Client Context ── */
const CLIENT_CONTEXT_PROMPT = `${PROFILE_VOICE}

You are generating the "read me first" brief for this client — the document that any AI system would need to understand who this person is and how to talk to them.

This is NOT a clinical assessment. It's a working portrait: what drives them, how they move, what's alive right now.

Return valid JSON (no markdown fences, no code blocks) in this exact format:

{
  "who_they_are": "2-3 sentences. Not demographics — what seems to drive this person. What's their energy? What matters to them?",
  "presenting_situation": "What brought them here, in their words. Quote directly where possible.",
  "family_echoes": "Patterns from their family system that may still be running. If not surfaced in 3 days, say 'Not visible yet — needs more time.'",
  "relational_style": "How they seem to move in relationships — toward people, away from them, or against them. What's the default under stress?",
  "conflict_style": "What seems to happen when things get tense. If not visible yet, say so.",
  "coping_patterns": "How they manage distress — what they reach for. Overwork? Withdrawal? Control? Performance? Be specific.",
  "strengths_visible": "What's already working. What they do well, even if they don't see it.",
  "active_tensions": "2-3 things that seem unresolved right now. These aren't problems to fix — they're edges to work.",
  "practiced_modalities": "Frameworks, practices, or approaches they already use or reference. Empty array if none visible.",
  "voice_notes": "How to talk to this person. What register works? Are they analytical? Emotional? Direct? What would land wrong?"
}

Be honest about what you can and can't see from 3 days of data. A provisional portrait that knows its limits is more useful than a confident one that's wrong.`;

/* ── Call 2: Growth Edges ── */
const GROWTH_EDGES_PROMPT = `${PROFILE_VOICE}

You are identifying 3-5 growth edges for this client — recurring patterns that shape how they experience their life right now.

A growth edge is NOT a problem to solve. It's a pattern that:
- Shows up repeatedly (even across just 3 days)
- Costs something — energy, connection, clarity, movement
- Has a protective function — it exists for a reason
- Has a direction it could grow — not "fix this" but "what would it look like if..."

Name each edge with a specific, evocative name. Not clinical labels ("Avoidance Pattern") but names that capture the lived experience ("The Quiet Exit" or "The Performance That Never Ends").

Return valid JSON (no markdown fences, no code blocks):

{
  "edges": [
    {
      "name": "Evocative name — not clinical. Something they'd recognize.",
      "what_seems_to_happen": "The pattern as observed. Use their words. Use tentative language — 'it looks like', 'there may be something here about'. 2-3 sentences.",
      "what_it_may_cost": "What this pattern could be protecting against, and what it might cost them. Be concrete, not abstract. 1-2 sentences.",
      "growth_direction": "Where movement could happen. Framed as possibility, not prescription. 'The work here might be...' or 'What if...' 1-2 sentences.",
      "signals_to_watch": "Specific moments in daily life where this edge may show up. Concrete enough to notice. 1-2 sentences.",
      "questions_to_hold": ["2-3 living questions. Not instructions. Not homework. Questions that don't need answering yet — they just need holding."]
    }
  ]
}

Important:
- 3 edges minimum, 5 maximum. Only name what you can actually see in the data
- If something feels like it might be there but you're not sure, include it with explicit uncertainty: "There may be something here about X, but it's early"
- Don't reach for edges that aren't supported by what they actually wrote
- Order from most visible/activated to most tentative`;

/* ── Call 3: Development Map ── */
const DEVELOPMENT_MAP_PROMPT = `${PROFILE_VOICE}

You are mapping 6-8 developmental traits for this client — where they seem to sit right now on each one, based on 3 days of journal and exercise data.

These traits represent capacities, not character. Everyone has all of them. The question is: where does this person seem to be right now?

For each trait, place them on a spectrum:
- "struggling" — the pattern runs automatically, little observer awareness
- "developing" — they can see it, name it, but it still runs in the moment
- "integrated" — they can catch it, hold it, and choose differently most of the time

Return valid JSON (no markdown fences, no code blocks):

{
  "traits": [
    {
      "trait": "Name (e.g., 'Emotional Regulation', 'Honest Communication', 'Boundary Setting')",
      "where_they_seem_to_be": "struggling | developing | integrated",
      "evidence": "What from their writing suggests this position. Quote their words. 1-2 sentences.",
      "reframe": {
        "limiting": "What they may currently believe about this. Use their language where possible.",
        "integrated": "What could also be true. Not the opposite — the fuller picture."
      },
      "matched_exercises": ["2-3 framework names from the exercise library that would serve this trait"],
      "embodiment_anchor": "One concrete micro-practice, under 2 minutes. Something they could do tomorrow morning."
    }
  ]
}

Trait selection guidelines:
- Choose traits that are ACTIVE — where you see evidence of struggle or development. Don't list traits with no data.
- Include at least one trait where they're already strong. People need to see what's working, not just what's broken.
- The reframes should feel like something a smart friend would say, not a self-help poster.
- Matched exercises must come from real coaching/psychology frameworks. Name the specific exercise and its originator if known.
- The embodiment anchor is physical — something involving the body, not just a thought experiment.

Possible traits to consider (choose only what's relevant):
Emotional Regulation, Self-Awareness, Empathy Without Absorption, Differentiation, Honest Communication, Boundary Setting, Conflict Navigation, Self-Compassion, Authenticity, Reality Acceptance, Cognitive Sophistication, Shadow Integration, Generative Capacity, Existential Maturity`;

/* ── Helper: strip code fences from Claude response ── */
function stripFences(text: string): string {
  let raw = text.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return raw;
}

/* ── Helper: build the context prompt from all Day 1-3 data ── */
function buildContextPrompt(
  enrollment: Record<string, unknown>,
  sessions: Record<string, unknown>[],
  exerciseCompletions: Record<string, unknown>[]
): string {
  const programName =
    (enrollment.programs as Record<string, unknown>)?.name || "Unknown Program";

  // Intake data
  const intakeSection = enrollment.pre_start_data
    ? `## Intake Responses\n${JSON.stringify(enrollment.pre_start_data, null, 2)}`
    : "## Intake Responses\nNone provided.";

  // Assessment data (optional — Enneagram, etc.)
  const assessmentSection = enrollment.assessment_data
    ? `## Assessment Data\n${JSON.stringify(enrollment.assessment_data, null, 2)}`
    : "";

  // Journal entries from Days 1-3
  const journalSection = sessions.length > 0
    ? sessions
        .map((s) => {
          const journal = (s.step_2_journal as string) || "";
          const dayNum = s.day_number;
          const themes = (s.step_3_analysis as Record<string, unknown>)?.key_themes || [];
          const summary = (s.step_5_summary as Record<string, unknown>)?.summary || "";
          return `### Day ${dayNum}\n**Journal:**\n${journal}\n\n**Themes identified:** ${(themes as string[]).join(", ") || "none"}\n\n**Day summary:** ${summary}`;
        })
        .join("\n\n---\n\n")
    : "No journal entries yet.";

  // Exercise completions with responses
  const exerciseSection = exerciseCompletions.length > 0
    ? exerciseCompletions
        .map((e) => {
          const name = e.framework_name || "Unknown exercise";
          const modality = e.modality || "";
          const responses = e.responses ? JSON.stringify(e.responses) : "No written response";
          return `- **${name}** (${modality}): ${responses}`;
        })
        .join("\n")
    : "No exercise responses yet.";

  return `## Program: ${programName}

${intakeSection}

${assessmentSection}

## Journal Entries (Days 1-3)
${journalSection}

## Exercise Responses (Days 1-3)
${exerciseSection}`;
}

/* ── Main route ── */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateBody(generateProfileSchema, body);
    if (!validation.success) return validation.response;
    const { enrollmentId } = validation.data;

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

    // Fetch enrollment with program
    const { data: enrollment, error: enrollError } = await supabase
      .from("program_enrollments")
      .select("*, programs(*)")
      .eq("id", enrollmentId)
      .eq("client_id", user.id)
      .single();

    if (enrollError || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Fetch Days 1-3 sessions
    const { data: sessions } = await supabase
      .from("daily_sessions")
      .select("day_number, step_2_journal, step_3_analysis, step_5_summary")
      .eq("enrollment_id", enrollmentId)
      .lte("day_number", 3)
      .order("day_number", { ascending: true });

    // Fetch Days 1-3 exercise completions
    const { data: exercises } = await supabase
      .from("exercise_completions")
      .select("framework_name, framework_id, modality, responses, exercise_type, custom_framing")
      .eq("enrollment_id", enrollmentId)
      .order("completed_at", { ascending: true });

    // Build the shared context prompt
    const contextPrompt = buildContextPrompt(
      enrollment,
      (sessions || []) as Record<string, unknown>[],
      (exercises || []) as Record<string, unknown>[]
    );

    const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

    // ── Call 1: Client Context ──
    const contextMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: CLIENT_CONTEXT_PROMPT,
      messages: [{ role: "user", content: contextPrompt }],
    });

    const contextBlock = contextMsg.content.find((b) => b.type === "text");
    if (!contextBlock || contextBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude (context)" }, { status: 500 });
    }
    const clientContext = JSON.parse(stripFences(contextBlock.text));

    // ── Call 2: Growth Edges ──
    // Include the client context so edges can reference it
    const edgesInput = `${contextPrompt}\n\n## Client Context (already generated)\n${JSON.stringify(clientContext, null, 2)}`;

    const edgesMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: GROWTH_EDGES_PROMPT,
      messages: [{ role: "user", content: edgesInput }],
    });

    const edgesBlock = edgesMsg.content.find((b) => b.type === "text");
    if (!edgesBlock || edgesBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude (edges)" }, { status: 500 });
    }
    const growthEdges = JSON.parse(stripFences(edgesBlock.text));

    // ── Call 3: Development Map ──
    // Include context + edges so traits can reference them
    const mapInput = `${contextPrompt}\n\n## Client Context\n${JSON.stringify(clientContext, null, 2)}\n\n## Growth Edges\n${JSON.stringify(growthEdges, null, 2)}`;

    const mapMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system: DEVELOPMENT_MAP_PROMPT,
      messages: [{ role: "user", content: mapInput }],
    });

    const mapBlock = mapMsg.content.find((b) => b.type === "text");
    if (!mapBlock || mapBlock.type !== "text") {
      return NextResponse.json({ error: "No response from Claude (map)" }, { status: 500 });
    }
    const developmentMap = JSON.parse(stripFences(mapBlock.text));

    // ── Save to client_profiles (admin client for insert) ──
    const admin = getAdminSupabase();
    const now = new Date().toISOString();

    const { data: profile, error: saveError } = await admin
      .from("client_profiles")
      .upsert({
        client_id: user.id,
        enrollment_id: enrollmentId,
        client_context: clientContext,
        growth_edges: growthEdges,
        development_map: developmentMap,
        observations_log: [],
        generated_at: now,
        last_refined_at: now,
      }, { onConflict: "enrollment_id" })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save client profile:", saveError);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return NextResponse.json({
      profile,
      usage: {
        context: contextMsg.usage,
        edges: edgesMsg.usage,
        map: mapMsg.usage,
      },
    });
  } catch (error: unknown) {
    console.error("Error in /api/generate-profile:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
