import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Coach Analytics API — GDPR compliant, aggregated data only.
 * No individual client data is returned. All metrics are counts, averages, or distributions.
 */
export async function GET() {
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
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // ── 1. Quality Flags (aggregated) ──
    const { data: flagsRaw } = await supabase
      .from("quality_flags")
      .select("flag_reason, output_type, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    const flags = flagsRaw || [];
    const flagsThisWeek = flags.filter(
      (f) => new Date(f.created_at) >= sevenDaysAgo
    ).length;
    const flagsThisMonth = flags.length;

    // Flag reason distribution
    const flagReasonCounts: Record<string, number> = {};
    const flagTypeCounts: Record<string, number> = {};
    for (const flag of flags) {
      flagReasonCounts[flag.flag_reason] =
        (flagReasonCounts[flag.flag_reason] || 0) + 1;
      flagTypeCounts[flag.output_type] =
        (flagTypeCounts[flag.output_type] || 0) + 1;
    }

    // ── 2. Exercise Ratings (aggregated) ──
    const { data: exerciseRatingsRaw } = await supabase
      .from("exercise_completions")
      .select("star_rating, framework_name, completed_at")
      .not("star_rating", "is", null)
      .gte("completed_at", thirtyDaysAgo.toISOString());

    const exerciseRatings = exerciseRatingsRaw || [];
    const avgExerciseRating =
      exerciseRatings.length > 0
        ? exerciseRatings.reduce((sum, r) => sum + r.star_rating, 0) /
          exerciseRatings.length
        : null;

    // Rating distribution (1-5)
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of exerciseRatings) {
      ratingDistribution[r.star_rating] =
        (ratingDistribution[r.star_rating] || 0) + 1;
    }

    // Low-rated exercises grouped by name (aggregated counts only)
    const lowRatedByName: Record<string, number> = {};
    for (const r of exerciseRatings) {
      if (r.star_rating <= 2) {
        lowRatedByName[r.framework_name] =
          (lowRatedByName[r.framework_name] || 0) + 1;
      }
    }

    // Weekly rating trend (last 4 weeks)
    const weeklyRatingTrend: { week: string; avg: number; count: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekRatings = exerciseRatings.filter((r) => {
        const d = new Date(r.completed_at);
        return d >= weekStart && d < weekEnd;
      });
      const avg =
        weekRatings.length > 0
          ? weekRatings.reduce((s, r) => s + r.star_rating, 0) /
            weekRatings.length
          : 0;
      weeklyRatingTrend.push({
        week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avg: Math.round(avg * 10) / 10,
        count: weekRatings.length,
      });
    }

    // ── 3. Day Ratings (aggregated) ──
    const { data: dayRatingsRaw } = await supabase
      .from("daily_sessions")
      .select("day_rating, completed_at")
      .not("day_rating", "is", null)
      .not("completed_at", "is", null)
      .gte("completed_at", thirtyDaysAgo.toISOString());

    const dayRatings = dayRatingsRaw || [];
    const avgDayRating =
      dayRatings.length > 0
        ? dayRatings.reduce((sum, r) => sum + r.day_rating, 0) /
          dayRatings.length
        : null;

    // ── 4. Engagement metrics ──
    // Total clients
    const { count: totalClients } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true });

    // Active enrollments
    const { count: activeEnrollments } = await supabase
      .from("program_enrollments")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "onboarding"]);

    // Sessions completed this week / month
    const { count: sessionsThisWeek } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null)
      .gte("completed_at", sevenDaysAgo.toISOString());

    const { count: sessionsThisMonth } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null)
      .gte("completed_at", thirtyDaysAgo.toISOString());

    // Exercises completed this month
    const { count: exercisesCompletedMonth } = await supabase
      .from("exercise_completions")
      .select("id", { count: "exact", head: true })
      .gte("completed_at", thirtyDaysAgo.toISOString());

    // ── 5. Day feedback count (how many left written feedback) ──
    const { count: dayFeedbackCount } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .not("day_feedback", "is", null)
      .gte("completed_at", thirtyDaysAgo.toISOString());

    // ── 6. Payment Funnel (aggregated from Stripe data + clients table) ──
    // Subscription status distribution
    const { data: subStatusRaw } = await supabase
      .from("clients")
      .select("subscription_status");
    const subStatusCounts: Record<string, number> = {};
    for (const c of subStatusRaw || []) {
      const status = c.subscription_status || "none";
      subStatusCounts[status] = (subStatusCounts[status] || 0) + 1;
    }

    // Abandoned checkouts (logged to api_logs by Stripe webhook)
    const { count: abandonedCheckouts } = await supabase
      .from("api_logs")
      .select("id", { count: "exact", head: true })
      .eq("endpoint", "checkout.session.expired")
      .gte("created_at", thirtyDaysAgo.toISOString());

    // ── 7. Day Start → Completion Rates (aggregated) ──
    // Total sessions started
    const { count: totalSessionsStarted } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true });

    // Total sessions completed
    const { count: totalSessionsCompleted } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .not("completed_at", "is", null);

    // Step completion distribution (which steps get completed most/least)
    const { data: stepsRaw } = await supabase
      .from("daily_sessions")
      .select("completed_steps");
    const stepCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const s of stepsRaw || []) {
      for (const step of s.completed_steps || []) {
        if (step >= 1 && step <= 5) {
          stepCounts[step] = (stepCounts[step] || 0) + 1;
        }
      }
    }

    // Day 1 specifically: started vs completed
    const { count: day1Started } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .eq("day_number", 1);

    const { count: day1Completed } = await supabase
      .from("daily_sessions")
      .select("id", { count: "exact", head: true })
      .eq("day_number", 1)
      .not("completed_at", "is", null);

    // ── 8. Enrollment Progression (aggregated status counts) ──
    const { data: enrollStatusRaw } = await supabase
      .from("program_enrollments")
      .select("status, current_day");
    const enrollStatusCounts: Record<string, number> = {};
    let totalCurrentDay = 0;
    let activeCount = 0;
    for (const e of enrollStatusRaw || []) {
      enrollStatusCounts[e.status] = (enrollStatusCounts[e.status] || 0) + 1;
      if (e.status === "active" || e.status === "onboarding") {
        totalCurrentDay += e.current_day || 0;
        activeCount++;
      }
    }
    const avgCurrentDay = activeCount > 0 ? Math.round((totalCurrentDay / activeCount) * 10) / 10 : 0;

    // Furthest day reached (how far anyone has gotten)
    const furthestDay = (enrollStatusRaw || []).reduce(
      (max, e) => Math.max(max, e.current_day || 0), 0
    );

    // ── 9. Welcome email stats ──
    const { count: welcomeEmailsSent } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("welcome_email_sent", true);

    // ── 10. Email Engagement (from Resend webhooks) ──
    const { data: emailEventsRaw } = await supabase
      .from("email_events")
      .select("event_type, email_subject, timestamp")
      .gte("timestamp", thirtyDaysAgo.toISOString());

    const emailEvents = emailEventsRaw || [];
    const emailEventCounts: Record<string, number> = {};
    for (const ev of emailEvents) {
      emailEventCounts[ev.event_type] = (emailEventCounts[ev.event_type] || 0) + 1;
    }

    // Email engagement rates
    const sent = emailEventCounts["email.sent"] || 0;
    const delivered = emailEventCounts["email.delivered"] || 0;
    const opened = emailEventCounts["email.opened"] || 0;
    const clicked = emailEventCounts["email.clicked"] || 0;
    const bounced = emailEventCounts["email.bounced"] || 0;

    // Emails by subject (top 5)
    const subjectCounts: Record<string, { sent: number; opened: number; clicked: number }> = {};
    for (const ev of emailEvents) {
      const subj = ev.email_subject || "Unknown";
      if (!subjectCounts[subj]) subjectCounts[subj] = { sent: 0, opened: 0, clicked: 0 };
      if (ev.event_type === "email.sent") subjectCounts[subj].sent++;
      if (ev.event_type === "email.opened") subjectCounts[subj].opened++;
      if (ev.event_type === "email.clicked") subjectCounts[subj].clicked++;
    }
    const topEmails = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b.sent - a.sent)
      .slice(0, 5)
      .map(([subject, counts]) => ({ subject, ...counts }));

    return NextResponse.json({
      quality: {
        flagsThisWeek,
        flagsThisMonth,
        flagReasonCounts,
        flagTypeCounts,
      },
      ratings: {
        avgExerciseRating: avgExerciseRating
          ? Math.round(avgExerciseRating * 10) / 10
          : null,
        avgDayRating: avgDayRating
          ? Math.round(avgDayRating * 10) / 10
          : null,
        ratingDistribution,
        lowRatedExercises: Object.entries(lowRatedByName)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([name, count]) => ({ name, count })),
        weeklyTrend: weeklyRatingTrend,
        totalRated: exerciseRatings.length,
      },
      engagement: {
        totalClients: totalClients || 0,
        activeEnrollments: activeEnrollments || 0,
        sessionsThisWeek: sessionsThisWeek || 0,
        sessionsThisMonth: sessionsThisMonth || 0,
        exercisesCompletedMonth: exercisesCompletedMonth || 0,
        dayFeedbackCount: dayFeedbackCount || 0,
      },
      funnel: {
        subscriptionStatus: subStatusCounts,
        abandonedCheckouts: abandonedCheckouts || 0,
        welcomeEmailsSent: welcomeEmailsSent || 0,
      },
      progression: {
        totalSessionsStarted: totalSessionsStarted || 0,
        totalSessionsCompleted: totalSessionsCompleted || 0,
        completionRate: totalSessionsStarted
          ? Math.round(((totalSessionsCompleted || 0) / totalSessionsStarted) * 100)
          : 0,
        stepCompletionCounts: stepCounts,
        day1Started: day1Started || 0,
        day1Completed: day1Completed || 0,
        enrollmentStatus: enrollStatusCounts,
        avgCurrentDay,
        furthestDay,
      },
      emailEngagement: {
        sent,
        delivered,
        opened,
        clicked,
        bounced,
        deliveryRate: sent > 0 ? Math.round((delivered / sent) * 100) : 0,
        openRate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
        topEmails,
      },
    });
  } catch (error: unknown) {
    console.error("Coach analytics error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
