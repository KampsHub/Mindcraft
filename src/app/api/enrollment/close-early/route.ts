import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { runOfframp } from "@/lib/program-offramp";

/**
 * POST /api/enrollment/close-early
 * Body: { enrollment_id: string }
 *
 * User-initiated: closes an active enrollment early and triggers the off-ramp
 * (final insights + personal 20% off promo + email).
 *
 * Auth: verifies the caller owns the enrollment. The actual off-ramp runs
 * with a service-role client.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const enrollmentId: string | undefined = body?.enrollment_id;
    if (!enrollmentId) {
      return NextResponse.json({ error: "Missing enrollment_id" }, { status: 400 });
    }

    // Auth check with the user's session
    const userSupabase = await createServerSupabaseClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify ownership + active status
    const { data: enrollment, error: loadErr } = await userSupabase
      .from("program_enrollments")
      .select("id, client_id, status")
      .eq("id", enrollmentId)
      .single();
    if (loadErr || !enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    if (enrollment.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!["active", "onboarding", "awaiting_goals", "pre_start"].includes(enrollment.status)) {
      return NextResponse.json(
        { error: `Cannot close an enrollment with status '${enrollment.status}'` },
        { status: 400 }
      );
    }

    // Run the off-ramp with a service-role client
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const result = await runOfframp(service, enrollmentId, { reason: "closed_early" });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Off-ramp failed" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      insights_url: `/insights/final?enrollment=${enrollmentId}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
