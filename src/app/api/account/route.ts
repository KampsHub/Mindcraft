import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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

/** Service-role client bypasses RLS — required for DELETE operations */
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
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
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const exportFirst = request.nextUrl.searchParams.get("export") === "true";
    let exportedData = null;

    if (exportFirst) {
      exportedData = await collectUserData(supabase, user.id);
    }

    // Use admin client to bypass RLS for deletions
    const admin = getAdminSupabase();

    // Delete in dependency order (children first, sequential to respect FK constraints)
    const { data: enrollmentRows } = await admin.from("program_enrollments").select("id").eq("client_id", user.id);
    const enrollmentIds = (enrollmentRows || []).map((e: { id: string }) => e.id);

    if (enrollmentIds.length > 0) {
      // Children of daily_sessions
      await admin.from("exercise_completions").delete().in("enrollment_id", enrollmentIds);
      await admin.from("free_flow_entries").delete().in("enrollment_id", enrollmentIds);
      // daily_sessions itself
      await admin.from("daily_sessions").delete().in("enrollment_id", enrollmentIds);
      // Other enrollment children
      await admin.from("client_goals").delete().in("enrollment_id", enrollmentIds);
      await admin.from("client_profiles").delete().in("enrollment_id", enrollmentIds);
      await admin.from("weekly_reviews").delete().in("enrollment_id", enrollmentIds);
      await admin.from("program_enrollments").delete().eq("client_id", user.id);
    }

    // These may exist regardless of enrollments
    await admin.from("shared_summaries").delete().eq("client_id", user.id);
    await admin.from("client_assessments").delete().eq("client_id", user.id);
    await admin.from("entries").delete().eq("client_id", user.id);
    await admin.from("consent_settings").delete().eq("client_id", user.id);

    // GDPR: delete from tables that store user context
    await admin.from("api_logs").delete().eq("client_id", user.id);
    await admin.from("quality_flags").delete().eq("client_id", user.id);
    await admin.from("email_events").delete().eq("user_id", user.id);
    await admin.from("coaching_memories").delete().eq("client_id", user.id);
    await admin.from("coach_clients").delete().eq("client_id", user.id);
    await admin.from("coach_notes").delete().eq("client_id", user.id);
    // Best-effort: contact_messages and waitlist_signups (keyed by email, not id)
    if (user.email) {
      await admin.from("contact_messages").delete().eq("email", user.email);
      await admin.from("waitlist_signups").delete().eq("email", user.email);
    }

    // Clean up Supabase Storage (enneagram docs)
    try {
      const { data: storageFiles } = await admin.storage
        .from("enneagram-docs")
        .list(user.id);
      if (storageFiles && storageFiles.length > 0) {
        const paths = storageFiles.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from("enneagram-docs").remove(paths);
      }
    } catch {
      // Storage cleanup is best-effort
    }

    // Delete Supabase Auth user
    try {
      await admin.auth.admin.deleteUser(user.id);
    } catch {
      // Auth deletion is best-effort — client row deletion below is the critical step
    }

    // Client row last — all FKs should be clear now
    const { error: deleteClientError } = await admin.from("clients").delete().eq("id", user.id);
    if (deleteClientError) {
      console.error("Failed to delete client row:", deleteClientError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

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
