import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAnthropicClient, getModelForTier } from "@/lib/api-validation";
import { VOICE_EVAL_RUBRIC } from "@/lib/coaching-voice";

/**
 * Voice compliance evaluator.
 * Runs Haiku against recent AI outputs to score voice quality.
 *
 * POST /api/voice-eval
 * Body: { enrollmentId?: string, limit?: number }
 *
 * Can be called manually or via cron (weekly quality audit).
 * Uses Haiku (~$0.001 per eval) to keep costs minimal.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const limit = body.limit || 5;

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

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    // Fetch recent AI outputs to evaluate
    // Look at daily_sessions for state_analysis (process-journal output)
    const query = supabase
      .from("daily_sessions")
      .select("id, day_number, state_analysis, daily_summary, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (body.enrollmentId) {
      query.eq("enrollment_id", body.enrollmentId);
    }

    const { data: sessions } = await query;
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ message: "No sessions to evaluate", evals: [] });
    }

    const ac = getAnthropicClient();
    if (!ac.success) return ac.response;
    const anthropic = ac.client;

    const evals = [];

    for (const session of sessions) {
      // Evaluate state_analysis (the reading/coaching output)
      const output = session.state_analysis;
      if (!output) continue;

      const outputText = typeof output === "string" ? output : JSON.stringify(output);

      try {
        const message = await anthropic.messages.create({
          model: getModelForTier("fast"), // Haiku — ~$0.001 per eval
          max_tokens: 800,
          system: VOICE_EVAL_RUBRIC,
          messages: [{
            role: "user",
            content: `Evaluate this coaching output from Day ${session.day_number}:\n\n${outputText.slice(0, 3000)}`,
          }],
        });

        const textBlock = message.content.find((b) => b.type === "text");
        if (textBlock && textBlock.type === "text") {
          try {
            const evalResult = JSON.parse(textBlock.text);
            evals.push({
              session_id: session.id,
              day_number: session.day_number,
              output_type: "state_analysis",
              ...evalResult,
            });
          } catch {
            evals.push({
              session_id: session.id,
              day_number: session.day_number,
              output_type: "state_analysis",
              raw: textBlock.text,
              parse_error: true,
            });
          }
        }
      } catch (evalErr) {
        console.error(`Eval failed for session ${session.id}:`, evalErr);
      }
    }

    // Calculate averages
    const scored = evals.filter((e) => e.scores);
    const avgScores: Record<string, number> = {};
    if (scored.length > 0) {
      const criteria = Object.keys(scored[0].scores);
      for (const c of criteria) {
        const sum = scored.reduce((acc, e) => acc + (e.scores[c]?.score || 0), 0);
        avgScores[c] = Math.round((sum / scored.length) * 10) / 10;
      }
    }

    const avgOverall = scored.length > 0
      ? Math.round((scored.reduce((acc, e) => acc + (e.overall || 0), 0) / scored.length) * 10) / 10
      : 0;

    // Collect all flags
    const allFlags = scored.flatMap((e) => e.flags || []).filter(Boolean);

    return NextResponse.json({
      evaluated: evals.length,
      average_overall: avgOverall,
      average_scores: avgScores,
      flags: [...new Set(allFlags)],
      evals,
    });
  } catch (error) {
    console.error("Voice eval error:", error);
    return NextResponse.json({ error: "Eval failed" }, { status: 500 });
  }
}
