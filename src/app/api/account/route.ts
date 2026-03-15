import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/account — Export all user data as JSON
 * DELETE /api/account — Delete all user data (with optional ?export=true to get data first)
 */

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* read-only context */ }
        },
      },
    }
  );
}

async function collectUserData(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const [
    { data: entries },
    { data: enrollments },
    { data: goals },
    { data: sessions },
    { data: exercises },
    { data: summaries },
    { data: consent },
  ] = await Promise.all([
    supabase.from("entries").select("id, type, content, theme_tags, date, created_at").eq("client_id", userId).order("date", { ascending: false }),
    supabase.from("program_enrollments").select("id, program_id, status, current_day, pre_start_data, created_at, programs(name, slug)").eq("client_id", userId),
    supabase.from("client_goals").select("id, goal_text, status, created_at, enrollment_id").eq("client_id", userId),
    supabase.from("daily_sessions").select("id, day_number, step_2_journal, step_5_summary, day_rating, day_feedback, completed_at, enrollment_id").eq("enrollment_id", (await supabase.from("program_enrollments").select("id").eq("client_id", userId)).data?.map((e: { id: string }) => e.id) || []),
    supabase.from("exercise_completions").select("id, framework_name, modality, responses, star_rating, feedback, completed_at").eq("client_id", userId),
    supabase.from("shared_summaries").select("id, status, period_start, period_end, approved_summary, created_at").eq("client_id", userId),
    supabase.from("consent_settings").select("ai_processing, coach_sharing, aggregate_analytics, updated_at").eq("client_id", userId).single(),
  ]);

  return {
    exported_at: new Date().toISOString(),
    account: { user_id: userId },
    consent_settings: consent || null,
    journal_entries: entries || [],
    program_enrollments: enrollments || [],
    goals: goals || [],
    daily_sessions: sessions || [],
    exercise_completions: exercises || [],
    shared_summaries: summaries || [],
  };
}

export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await collectUserData(supabase, user.id);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mindcraft-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const exportFirst = request.nextUrl.searchParams.get("export") === "true";
    let exportedData = null;

    if (exportFirst) {
      exportedData = await collectUserData(supabase, user.id);
    }

    // Delete in dependency order (children first)
    const enrollmentIds = ((await supabase.from("program_enrollments").select("id").eq("client_id", user.id)).data || []).map(e => e.id);

    if (enrollmentIds.length > 0) {
      await Promise.all([
        supabase.from("exercise_completions").delete().in("enrollment_id", enrollmentIds),
        supabase.from("daily_sessions").delete().in("enrollment_id", enrollmentIds),
        supabase.from("client_goals").delete().in("enrollment_id", enrollmentIds),
        supabase.from("shared_summaries").delete().eq("client_id", user.id),
      ]);
      await supabase.from("program_enrollments").delete().eq("client_id", user.id);
    }

    await Promise.all([
      supabase.from("entries").delete().eq("client_id", user.id),
      supabase.from("consent_settings").delete().eq("client_id", user.id),
      supabase.from("clients").delete().eq("id", user.id),
    ]);

    if (exportFirst && exportedData) {
      return new NextResponse(JSON.stringify(exportedData, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="mindcraft-data-final-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    return NextResponse.json({ success: true, message: "All data deleted." });
  } catch (error: unknown) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
