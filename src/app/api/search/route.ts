import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() || "";
    const type = url.searchParams.get("type") || "exercises";
    const enrollmentId = url.searchParams.get("enrollmentId");

    if (type === "exercises") {
      let query = supabase
        .from("exercise_completions")
        .select("id, framework_name, framework_id, custom_framing, modality, exercise_type, responses, star_rating, insight, completed_at, daily_session_id")
        .eq("client_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(50);

      if (enrollmentId) query = query.eq("enrollment_id", enrollmentId);

      if (q) {
        // Search by framework name or custom framing
        query = query.or(`framework_name.ilike.%${q}%,custom_framing.ilike.%${q}%`);
      }

      const { data: exercises } = await query;

      // Get day numbers from daily_sessions
      const sessionIds = [...new Set((exercises || []).map(e => e.daily_session_id).filter(Boolean))];
      let dayMap = new Map<string, number>();
      if (sessionIds.length > 0) {
        const { data: sessions } = await supabase
          .from("daily_sessions")
          .select("id, day_number")
          .in("id", sessionIds);
        if (sessions) {
          sessions.forEach(s => dayMap.set(s.id, s.day_number));
        }
      }

      // Get framework instructions from frameworks_library
      const frameworkNames = [...new Set((exercises || []).map(e => e.framework_name).filter(Boolean))];
      let frameworkMap = new Map<string, { instructions: string; originator: string; description: string }>();
      if (frameworkNames.length > 0) {
        const { data: frameworks } = await supabase
          .from("frameworks_library")
          .select("name, instructions, originator, description")
          .in("name", frameworkNames);
        if (frameworks) {
          frameworks.forEach(f => frameworkMap.set(f.name, { instructions: f.instructions, originator: f.originator, description: f.description }));
        }
      }

      const results = (exercises || []).map(e => ({
        ...e,
        day_number: dayMap.get(e.daily_session_id) || null,
        framework: frameworkMap.get(e.framework_name) || null,
      }));

      return NextResponse.json({ results, type: "exercises" });
    }

    if (type === "entries") {
      let query = supabase
        .from("daily_sessions")
        .select("id, day_number, step_2_journal, date, completed_at")
        .eq("client_id", user.id)
        .not("step_2_journal", "is", null)
        .order("day_number", { ascending: false })
        .limit(50);

      if (enrollmentId) query = query.eq("enrollment_id", enrollmentId);

      if (q) {
        query = query.ilike("step_2_journal", `%${q}%`);
      }

      const { data: entries } = await query;

      return NextResponse.json({ results: entries || [], type: "entries" });
    }

    if (type === "insights") {
      // Search exercise-level insights
      let exerciseQuery = supabase
        .from("exercise_completions")
        .select("id, framework_name, insight, completed_at, daily_session_id")
        .eq("client_id", user.id)
        .not("insight", "is", null)
        .order("completed_at", { ascending: false })
        .limit(30);

      if (enrollmentId) exerciseQuery = exerciseQuery.eq("enrollment_id", enrollmentId);
      if (q) exerciseQuery = exerciseQuery.ilike("insight", `%${q}%`);

      const { data: exerciseInsights } = await exerciseQuery;

      // Get day numbers
      const sessionIds = [...new Set((exerciseInsights || []).map(e => e.daily_session_id).filter(Boolean))];
      let dayMap = new Map<string, number>();
      if (sessionIds.length > 0) {
        const { data: sessions } = await supabase
          .from("daily_sessions")
          .select("id, day_number")
          .in("id", sessionIds);
        if (sessions) sessions.forEach(s => dayMap.set(s.id, s.day_number));
      }

      // Search weekly insights
      let weeklyQuery = supabase
        .from("weekly_reviews")
        .select("id, week_number, key_insights, created_at")
        .eq("client_id", user.id)
        .order("week_number", { ascending: false })
        .limit(20);

      if (enrollmentId) weeklyQuery = weeklyQuery.eq("enrollment_id", enrollmentId);

      const { data: weeklyReviews } = await weeklyQuery;

      // Flatten weekly insights and filter by query
      const weeklyInsights = (weeklyReviews || []).flatMap(wr => {
        const insights = (wr.key_insights as { insight: string; source: string; type: string }[] | null) || [];
        return insights
          .filter(i => !q || i.insight?.toLowerCase().includes(q.toLowerCase()))
          .map(i => ({
            id: `${wr.id}-${i.insight?.substring(0, 20)}`,
            insight: i.insight,
            source: `Week ${wr.week_number}`,
            type: i.type || "pattern",
            created_at: wr.created_at,
          }));
      });

      const exerciseResults = (exerciseInsights || []).map(e => ({
        id: e.id,
        insight: e.insight,
        source: `${e.framework_name} — Day ${dayMap.get(e.daily_session_id) || "?"}`,
        type: "exercise",
        created_at: e.completed_at,
      }));

      const allInsights = [...exerciseResults, ...weeklyInsights]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 50);

      return NextResponse.json({ results: allInsights, type: "insights" });
    }

    return NextResponse.json({ error: "Invalid type. Use: exercises, entries, insights" }, { status: 400 });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
