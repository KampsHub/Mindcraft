import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Persists inactivity-gap flags onto an enrollment when a new threshold is
 * crossed. Called by AnalyticsSessionBoundary so GA4 user properties stay in
 * sync with server state.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      enrollment_id?: string;
      gap_days?: number;
      crossed_3d?: boolean;
      crossed_7d?: boolean;
    };
    const { enrollment_id, gap_days, crossed_3d, crossed_7d } = body;
    if (!enrollment_id) {
      return NextResponse.json({ error: "missing enrollment_id" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Fetch current values to avoid clobbering higher max_inactivity_days.
    const { data: current } = await supabase
      .from("program_enrollments")
      .select("max_inactivity_days, had_3d_gap, had_7d_gap")
      .eq("id", enrollment_id)
      .eq("client_id", user.id)
      .maybeSingle();

    const patch: Record<string, boolean | number> = {};
    if (crossed_3d && !current?.had_3d_gap) patch.had_3d_gap = true;
    if (crossed_7d && !current?.had_7d_gap) patch.had_7d_gap = true;
    if (typeof gap_days === "number" && gap_days > (current?.max_inactivity_days ?? 0)) {
      patch.max_inactivity_days = gap_days;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await supabase
      .from("program_enrollments")
      .update(patch)
      .eq("id", enrollment_id)
      .eq("client_id", user.id);

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
