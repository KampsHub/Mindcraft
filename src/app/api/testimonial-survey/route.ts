import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Persist testimonial-survey responses to the testimonial_surveys table.
 * This is the structured weekly-review survey, NOT the public testimonials wall.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { describe_text, changed_text, permission_given } = body;

    let clientId: string | null = null;
    let program: string | null = null;
    let enrollmentId: string | null = null;

    try {
      const userSupabase = await createServerSupabaseClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        clientId = user.id;
        const { data: enrollment } = await userSupabase
          .from("program_enrollments")
          .select("id, programs(slug)")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (enrollment) {
          enrollmentId = enrollment.id as string;
          const programs = enrollment.programs as { slug?: string } | { slug?: string }[] | null;
          program = Array.isArray(programs) ? programs[0]?.slug ?? null : programs?.slug ?? null;
        }
      }
    } catch {
      // anonymous OK
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const db = createClient(supabaseUrl, serviceKey);
    const { error } = await db.from("testimonial_surveys").insert({
      client_id: clientId,
      enrollment_id: enrollmentId,
      program,
      describe_text,
      changed_text,
      permission_given: Boolean(permission_given),
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
