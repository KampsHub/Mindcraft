import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Associates a GA4 client_id with the current user's enrollment so that
 * server-side events (Stripe webhook, dropout cron) can target the correct
 * GA4 user. Called once per session by AnalyticsSessionBoundary.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      enrollment_id?: string;
      ga_client_id?: string;
    };
    const enrollmentId = body?.enrollment_id;
    const gaClientId = body?.ga_client_id;
    if (!enrollmentId || !gaClientId) {
      return NextResponse.json({ error: "missing params" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("program_enrollments")
      .update({ ga_client_id: gaClientId })
      .eq("id", enrollmentId)
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
