import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Persist exit-survey responses to the exit_surveys table.
 * Authenticated users get client_id + enrollment context populated automatically.
 * Anonymous users still get a row (client_id = null).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reason, reason_other, comeback_text, enrollment_id } = body;

    let clientId: string | null = null;
    let program: string | null = null;
    let currentDay: number | null = null;
    let resolvedEnrollmentId: string | null = enrollment_id ?? null;

    // Try to enrich with auth context if available
    try {
      const userSupabase = await createServerSupabaseClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        clientId = user.id;
        // Pull current enrollment if not provided
        if (!resolvedEnrollmentId) {
          const { data: enrollment } = await userSupabase
            .from("program_enrollments")
            .select("id, current_day, programs(slug)")
            .eq("client_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (enrollment) {
            resolvedEnrollmentId = enrollment.id as string;
            currentDay = enrollment.current_day as number;
            const programs = enrollment.programs as { slug?: string } | { slug?: string }[] | null;
            program = Array.isArray(programs) ? programs[0]?.slug ?? null : programs?.slug ?? null;
          }
        }
      }
    } catch {
      // Anonymous OK
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const db = createClient(supabaseUrl, serviceKey);
    const { error } = await db.from("exit_surveys").insert({
      client_id: clientId,
      enrollment_id: resolvedEnrollmentId,
      program,
      reason,
      reason_other,
      comeback_text,
      current_day: currentDay,
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
