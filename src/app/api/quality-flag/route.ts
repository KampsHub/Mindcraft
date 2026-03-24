import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { qualityFlagSchema, validateBody } from "@/lib/api-validation";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // setAll can fail in read-only contexts
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateBody(qualityFlagSchema, body);
    if (!validation.success) return validation.response;
    const { data } = validation;

    // Find active enrollment for the user
    const { data: enrollment } = await supabase
      .from("program_enrollments")
      .select("id")
      .eq("client_id", user.id)
      .in("status", ["active", "onboarding"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase.from("quality_flags").insert({
      client_id: user.id,
      enrollment_id: enrollment?.id || null,
      daily_session_id: data.dailySessionId || null,
      output_type: data.outputType,
      framework_name: data.frameworkName || null,
      flag_reason: data.flagReason,
      user_comment: data.userComment || null,
    });

    if (error) {
      console.error("Quality flag insert error:", error);
      return NextResponse.json({ error: "Failed to save flag" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (error: unknown) {
    console.error("Quality flag error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
