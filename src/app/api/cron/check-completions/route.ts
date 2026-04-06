import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { runOfframp } from "@/lib/program-offramp";

/**
 * Daily cron: finds enrollments that hit day 30 and runs the off-ramp
 * (final insights + personal promo + completion email).
 *
 * The actual off-ramp logic lives in src/lib/program-offramp.ts so the
 * user-initiated close-early endpoint can reuse it.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: ready, error: readyErr } = await supabase
    .from("program_enrollments")
    .select("id")
    .lte("started_at", cutoff)
    .in("status", ["active", "onboarding", "awaiting_goals"]);

  if (readyErr) {
    console.error("check-completions: query failed", readyErr);
    return NextResponse.json({ error: readyErr.message }, { status: 500 });
  }
  if (!ready || ready.length === 0) {
    return NextResponse.json({ completed: 0 });
  }

  const results = await Promise.all(
    ready.map((row) => runOfframp(supabase, row.id as string, { reason: "completed" }))
  );

  return NextResponse.json({
    completed: results.filter((r) => r.ok && !r.skipped).length,
    attempted: results.length,
    results,
  });
}
