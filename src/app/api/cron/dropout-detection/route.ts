import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  sendServerEvent,
  syntheticClientId,
} from "@/lib/ga-measurement-protocol";

/**
 * Nightly cron: detect users who have been inactive 14+ days on a non-terminal
 * enrollment. Fires `dropout_detected` via GA4 Measurement Protocol so the
 * event lands in GA4 even though the user never returned to the browser.
 *
 * Also marks the enrollment as `lapsed` so future user-property lookups
 * report the correct cohort in GA4.
 *
 * Scheduled in vercel.json at 04:17 local daily.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const cutoff14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Query enrollments that have been inactive for 14+ days and are not already terminal/lapsed.
  const { data: stale, error: staleErr } = await supabase
    .from("program_enrollments")
    .select(
      "id, client_id, program_id, status, current_day, last_active_at, ga_client_id, programs(slug)",
    )
    .lte("last_active_at", cutoff14d)
    .in("status", ["active", "onboarding", "awaiting_goals", "pre_start"]);

  if (staleErr) {
    console.error("dropout-detection: query failed", staleErr);
    return NextResponse.json({ error: staleErr.message }, { status: 500 });
  }
  if (!stale || stale.length === 0) {
    return NextResponse.json({ detected: 0 });
  }

  let fired = 0;
  let lapsed = 0;
  for (const row of stale) {
    const program = Array.isArray(row.programs)
      ? row.programs[0]?.slug
      : (row.programs as { slug?: string } | null)?.slug;
    const daysInactive = Math.floor(
      (Date.now() - new Date(row.last_active_at as string).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const clientId =
      (row.ga_client_id as string | null) ||
      syntheticClientId(`enrollment.${row.id}`);

    const result = await sendServerEvent(clientId, "dropout_detected", {
      program: program ?? "unknown",
      last_day_number: row.current_day ?? 0,
      days_inactive: daysInactive,
      enrollment_id: row.id as string,
    });
    if (result.ok) fired += 1;

    // Mark as lapsed so GA4 user_property (set next time they log in) reflects it.
    const { error: updateErr } = await supabase
      .from("program_enrollments")
      .update({ status: "lapsed" })
      .eq("id", row.id as string);
    if (!updateErr) lapsed += 1;
  }

  return NextResponse.json({
    detected: stale.length,
    fired,
    lapsed,
  });
}
