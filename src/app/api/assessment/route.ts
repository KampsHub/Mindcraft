import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Persist a /assessment quiz completion to assessment_responses.
 * Email is optional — anonymous quizzes are still valuable signal.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, scores, situation, challenge, source } = body;

    if (!scores || typeof scores !== "object") {
      return NextResponse.json({ error: "Missing scores object" }, { status: 400 });
    }

    const numericScores = Object.values(scores)
      .map((v) => (typeof v === "number" ? v : Number(v)))
      .filter((v) => !isNaN(v));
    const avgScore = numericScores.length > 0
      ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length
      : null;

    // top 3 disruptions = 3 lowest scores
    const topDisruptions = Object.entries(scores as Record<string, number | string>)
      .map(([id, val]) => [id, typeof val === "number" ? val : Number(val)] as [string, number])
      .filter(([, v]) => !isNaN(v))
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([id]) => id);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const db = createClient(supabaseUrl, serviceKey);
    const { error } = await db.from("assessment_responses").insert({
      email: email || null,
      scores,
      avg_score: avgScore,
      top_disruptions: topDisruptions,
      situation: situation || null,
      challenge: challenge || null,
      source: source || null,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
