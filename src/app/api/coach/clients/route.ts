import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = [
  "stefanie@allmindsondeck.com",
  "stefanie.kamps@gmail.com",
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // Check coach role
    let isCoach = ADMIN_EMAILS.includes(user.email || "");
    if (!isCoach) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      isCoach = profile?.role === "admin" || profile?.role === "coach";
    }
    if (!isCoach) {
      return NextResponse.json({ error: "Coach access required." }, { status: 403 });
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch all coach_clients for this coach
    const { data: coachClients } = await admin
      .from("coach_clients")
      .select("id, client_id, client_email, status, invited_at, accepted_at")
      .eq("coach_id", user.id)
      .order("invited_at", { ascending: false });

    if (!coachClients || coachClients.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    // For active clients, fetch their data
    const activeClients = coachClients.filter(c => c.status === "active" && c.client_id);
    const clientIds = activeClients.map(c => c.client_id!);

    // Batch fetch all client data
    const [enrollmentsRes, goalsRes, assessmentsRes, summariesRes, sessionsRes] = await Promise.all([
      clientIds.length > 0
        ? admin.from("program_enrollments")
            .select("id, client_id, current_day, status, current_streak, best_streak, programs(name, slug)")
            .in("client_id", clientIds)
            .in("status", ["active", "onboarding", "awaiting_goals", "pre_start", "completed", "paused"])
        : { data: [] },
      clientIds.length > 0
        ? admin.from("client_goals")
            .select("id, client_id, enrollment_id, goal_text, status")
            .in("client_id", clientIds)
            .eq("status", "active")
        : { data: [] },
      clientIds.length > 0
        ? admin.from("client_assessments")
            .select("client_id, type, data")
            .in("client_id", clientIds)
            .eq("type", "enneagram")
        : { data: [] },
      clientIds.length > 0
        ? admin.from("shared_summaries")
            .select("id, enrollment_id, period_start, period_end, approved_summary, approved_at, status")
            .in("enrollment_id", (await admin.from("program_enrollments").select("id").in("client_id", clientIds)).data?.map(e => e.id) || [])
            .eq("status", "approved")
            .order("approved_at", { ascending: false })
            .limit(20)
        : { data: [] },
      clientIds.length > 0
        ? admin.from("daily_sessions")
            .select("client_id, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: false })
        : { data: [] },
    ]);

    const enrollments = (enrollmentsRes as { data: unknown[] | null }).data || [];
    const goals = (goalsRes as { data: unknown[] | null }).data || [];
    const assessments = (assessmentsRes as { data: unknown[] | null }).data || [];
    const summaries = (summariesRes as { data: unknown[] | null }).data || [];
    const sessions = (sessionsRes as { data: unknown[] | null }).data || [];

    // Get last active dates per client
    const lastActiveMap = new Map<string, string>();
    for (const s of sessions as { client_id: string; created_at: string }[]) {
      if (!lastActiveMap.has(s.client_id)) {
        lastActiveMap.set(s.client_id, s.created_at);
      }
    }

    // Build enriched client list
    const enrichedClients = coachClients.map(cc => {
      if (cc.status !== "active" || !cc.client_id) {
        return { ...cc, enrollment: null, goals: [], enneagram: null, sharedInsights: [], lastActive: null };
      }

      const clientEnrollment = (enrollments as { client_id: string; current_day: number; status: string; current_streak: number; best_streak: number; programs: { name: string; slug: string } }[])
        .find(e => e.client_id === cc.client_id);

      const clientGoals = (goals as { client_id: string; goal_text: string; status: string }[])
        .filter(g => g.client_id === cc.client_id);

      const clientEnneagram = (assessments as { client_id: string; data: unknown }[])
        .find(a => a.client_id === cc.client_id);

      const clientSummaries = clientEnrollment
        ? (summaries as { enrollment_id: string; approved_summary: unknown; approved_at: string; period_start: string; period_end: string }[])
            .filter(s => s.enrollment_id === (clientEnrollment as unknown as { id: string }).id)
        : [];

      return {
        ...cc,
        enrollment: clientEnrollment || null,
        goals: clientGoals,
        enneagram: clientEnneagram?.data || null,
        sharedInsights: clientSummaries,
        lastActive: lastActiveMap.get(cc.client_id) || null,
      };
    });

    return NextResponse.json({ clients: enrichedClients });
  } catch (error) {
    console.error("Coach clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
  }
}
