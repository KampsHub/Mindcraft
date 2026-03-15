"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import GoalSlider from "@/components/GoalSlider";
import ProgramSwitcher from "@/components/ProgramSwitcher";

/* ── Design tokens (matches dashboard/landing page) ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Types ── */
interface ProgramEnrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  goals_approved: boolean;
  programs: {
    name: string;
    slug: string;
    weekly_themes: WeekTheme[];
  };
}

interface WeekTheme {
  week: number;
  name: string;
  title: string;
  territory: string;
}

interface ActiveGoal {
  id: string;
  goal_text: string;
  status: string;
}

interface DailySession {
  id: string;
  day_number: number;
  step_2_journal: string;
  day_rating: number | null;
  completed_at: string | null;
}

interface Insight {
  insight: string;
  source: string;
  type: "pattern" | "shift" | "sticking_point" | "breakthrough" | "connection";
}

interface GoalRating {
  rating: number;
  note: string;
}

interface ExerciseDetail {
  id: string;
  framework_name: string;
  exercise_type: string;
  modality: string | null;
  custom_framing: string | null;
  responses: Record<string, string>;
  star_rating: number | null;
  feedback: string | null;
  completed_at: string | null;
  daily_session_id: string;
}

interface PastWeekSummary {
  week_number: number;
  key_insights: Insight[];
  week_start: string;
  reflection: string;
}

function SectionHeader({ title, sectionKey, collapsed, onToggle, children }: {
  title: string;
  sectionKey: string;
  collapsed: boolean;
  onToggle: (key: string) => void;
  children?: import("react").ReactNode;
}) {
  return (
    <div
      onClick={() => onToggle(sectionKey)}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", padding: "4px 0", borderRadius: 8,
        transition: "background-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <h2 style={{
          fontFamily: display, fontSize: 18, fontWeight: 700,
          color: colors.textPrimary, margin: 0, letterSpacing: "-0.02em",
        }}>
          {title}
        </h2>
        {children}
      </div>
      <motion.svg
        width={18} height={18} viewBox="0 0 24 24" fill="none"
        stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        animate={{ rotate: collapsed ? 0 : 180 }}
        transition={{ duration: 0.2 }}
        style={{ flexShrink: 0 }}
      >
        <polyline points="6 9 12 15 18 9" />
      </motion.svg>
    </div>
  );
}

export default function WeeklyReviewPageWrapper() {
  return (
    <Suspense fallback={null}>
      <WeeklyReviewPage />
    </Suspense>
  );
}

function WeeklyReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<ProgramEnrollment | null>(null);
  const [activeGoals, setActiveGoals] = useState<ActiveGoal[]>([]);
  const [sessions, setSessions] = useState<DailySession[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [weekExercises, setWeekExercises] = useState<ExerciseDetail[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [sharingExercise, setSharingExercise] = useState<string | null>(null);
  const [exerciseShareEmail, setExerciseShareEmail] = useState("");
  const [sendingExercise, setSendingExercise] = useState(false);
  const [exerciseShareSuccess, setExerciseShareSuccess] = useState(false);
  const [journalEntryCount, setJournalEntryCount] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [goalRatings, setGoalRatings] = useState<Record<string, GoalRating>>({});
  const [reflection, setReflection] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekTheme, setWeekTheme] = useState<WeekTheme | null>(null);

  // Insight state
  const [insightChecked, setInsightChecked] = useState<Record<number, boolean>>({});
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  // Collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Weekly summary state (merged section)
  const [summaryText, setSummaryText] = useState("");
  const [weekSummaries, setWeekSummaries] = useState<PastWeekSummary[]>([]);
  const [sharingSummary, setSharingSummary] = useState(false);
  const [summaryShareEmail, setSummaryShareEmail] = useState("");
  const [summaryShareSuccess, setSummaryShareSuccess] = useState(false);
  const [showSummaryShare, setShowSummaryShare] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentParam = searchParams.get("enrollment");

  function handleSwitchEnrollment(enrollmentId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("enrollment", enrollmentId);
    router.push(`/weekly-review?${params.toString()}`);
    window.location.href = `/weekly-review?${params.toString()}`;
  }

  const loadData = useCallback(async (userId: string) => {
    // Fetch enrollment — specific or most recent
    let enroll: ProgramEnrollment | null = null;
    if (enrollmentParam) {
      const { data } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("id", enrollmentParam)
        .eq("client_id", userId)
        .single();
      if (data) enroll = data as ProgramEnrollment;
    }
    if (!enroll) {
      const { data: enrollments } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("client_id", userId)
        .in("status", ["active", "onboarding", "awaiting_goals"])
        .order("created_at", { ascending: false })
        .limit(1);
      if (enrollments && enrollments.length > 0) {
        enroll = enrollments[0] as ProgramEnrollment;
      }
    }

    if (!enroll) {
      setLoading(false);
      return;
    }
    setEnrollment(enroll);

    // Calculate current week number from current_day
    const currentWeek = Math.ceil(enroll.current_day / 7);
    // Show the review for the most recently completed week
    // If they're on day 8, review week 1. If on day 7, review week 1.
    const reviewWeek = enroll.current_day % 7 === 0 ? Math.floor(enroll.current_day / 7) : Math.max(1, currentWeek - 1);
    setWeekNumber(reviewWeek);

    // Get week theme from program
    const themes = enroll.programs?.weekly_themes || [];
    const theme = themes.find((t: WeekTheme) => t.week === reviewWeek);
    if (theme) setWeekTheme(theme);

    // Calculate day range for this week
    const startDay = (reviewWeek - 1) * 7 + 1;
    const endDay = reviewWeek * 7;

    // Fetch sessions for this week
    const { data: weekSessions } = await supabase
      .from("daily_sessions")
      .select("id, day_number, step_2_journal, day_rating, completed_at")
      .eq("enrollment_id", enroll.id)
      .gte("day_number", startDay)
      .lte("day_number", endDay)
      .order("day_number", { ascending: true });

    if (weekSessions) setSessions(weekSessions);

    // Fetch exercises for this week (full details + count)
    const sessionIds = weekSessions?.map((s) => s.id) || [];
    if (sessionIds.length > 0) {
      const { data: exData } = await supabase
        .from("exercise_completions")
        .select("id, framework_name, exercise_type, modality, custom_framing, responses, star_rating, feedback, completed_at, daily_session_id")
        .in("daily_session_id", sessionIds)
        .order("completed_at", { ascending: true });
      if (exData) {
        setWeekExercises(exData as ExerciseDetail[]);
        setExerciseCount(exData.length);
      }
    } else {
      setWeekExercises([]);
    }

    // Fetch mindful journal entry count for this week
    // Use session completed_at dates to determine date range
    const completedDates = weekSessions
      ?.filter((s) => s.completed_at)
      .map((s) => s.completed_at!.split("T")[0]) || [];
    if (completedDates.length > 0) {
      const minDate = completedDates[0];
      const maxDate = completedDates[completedDates.length - 1];
      // Add a day buffer on both ends
      const startDate = new Date(minDate);
      startDate.setDate(startDate.getDate() - 1);
      const endDate = new Date(maxDate);
      endDate.setDate(endDate.getDate() + 1);
      const { count: jCount } = await supabase
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("client_id", userId)
        .eq("metadata->>source", "mindful_journal")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);
      if (jCount !== null) setJournalEntryCount(jCount);
    } else {
      setJournalEntryCount(0);
    }

    // Fetch active goals
    const { data: goals } = await supabase
      .from("client_goals")
      .select("id, goal_text, status")
      .eq("enrollment_id", enroll.id)
      .eq("status", "active");
    if (goals) {
      setActiveGoals(goals);
      // Initialize ratings
      const initial: Record<string, GoalRating> = {};
      goals.forEach((g) => { initial[g.id] = { rating: 5, note: "" }; });
      setGoalRatings(initial);
    }

    // Check for existing review by enrollment + week number
    try {
      const { data: existing } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("client_id", userId)
        .eq("enrollment_id", enroll.id)
        .eq("week_number", reviewWeek)
        .maybeSingle();

      if (existing) {
        setReflection(existing.reflection || "");
        setFeedback(existing.plan_adjustments || "");
        setSaved(true);
        if (existing.goal_ratings) {
          setGoalRatings(existing.goal_ratings);
        }
        if (existing.key_insights && Array.isArray(existing.key_insights)) {
          setInsights(existing.key_insights);
          const checked: Record<number, boolean> = {};
          existing.key_insights.forEach((_: Insight, i: number) => { checked[i] = true; });
          setInsightChecked(checked);
        }
        if (existing.summary_text) {
          setSummaryText(existing.summary_text);
        } else if (existing.key_insights && Array.isArray(existing.key_insights)) {
          // Fallback: generate from insights if no saved summary
          const theme = themes.find((t: WeekTheme) => t.week === reviewWeek);
          setSummaryText(generateSummaryParagraph(existing.key_insights, reviewWeek, theme));
        }
      }
    } catch {
      // No existing review, that's fine
    }

    // Load past week summaries (reviews with insights)
    const { data: pastReviews } = await supabase
      .from("weekly_reviews")
      .select("week_number, key_insights, week_start, reflection")
      .eq("enrollment_id", enroll.id)
      .not("key_insights", "is", null)
      .neq("week_number", reviewWeek)
      .order("week_number", { ascending: false });
    if (pastReviews) setWeekSummaries(pastReviews as PastWeekSummary[]);

    setLoading(false);
  }, [supabase, enrollmentParam]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      loadData(user.id);
    });
  }, [supabase.auth, router, loadData]);

  function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split("T")[0];
  }

  async function generateInsights() {
    if (!enrollment) return;
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/weekly-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id, weekNumber }),
      });
      if (res.ok) {
        const data = await res.json();
        const newInsights = data.insights || [];
        setInsights(newInsights);
        // Initialize all checkboxes as checked
        const checked: Record<number, boolean> = {};
        newInsights.forEach((_: Insight, i: number) => { checked[i] = true; });
        setInsightChecked(checked);
        // Set the Claude-generated summary (or fallback to client-side)
        if (data.summary) {
          setSummaryText(data.summary);
        } else {
          setSummaryText(generateSummaryParagraph(newInsights, weekNumber, weekTheme));
        }
      } else {
        console.error("Failed to generate insights");
      }
    } catch (err) {
      console.error("Insight generation failed:", err);
    }
    setLoadingInsights(false);
  }

  function updateGoalRating(goalId: string, rating: number) {
    setGoalRatings((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], rating },
    }));
    setSaved(false);
  }

  function updateGoalNote(goalId: string, note: string) {
    setGoalRatings((prev) => ({
      ...prev,
      [goalId]: { ...prev[goalId], note },
    }));
    setSaved(false);
  }

  // Share the weekly summary via email
  async function handleShareSummary(text: string, week: number) {
    if (!summaryShareEmail || sharingSummary) return;
    setSharingSummary(true);
    setSummaryShareSuccess(false);
    try {
      const res = await fetch("/api/weekly-summary/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: summaryShareEmail,
          summary: text,
          weekNumber: week,
          programName: enrollment?.programs?.name,
        }),
      });
      if (res.ok) {
        setSummaryShareSuccess(true);
        setTimeout(() => { setSummaryShareSuccess(false); setShowSummaryShare(false); setSummaryShareEmail(""); }, 2000);
      }
    } catch (err) {
      console.error("Share summary failed:", err);
    } finally {
      setSharingSummary(false);
    }
  }

  function generateSummaryParagraph(ins: Insight[], week: number, theme?: WeekTheme | null): string {
    if (ins.length === 0) return "";
    const byType: Record<string, string[]> = {};
    ins.forEach((i) => {
      if (!byType[i.type]) byType[i.type] = [];
      byType[i.type].push(i.insight);
    });
    const parts: string[] = [];
    // Opening
    const themeLabel = theme ? ` (${theme.name}: ${theme.title})` : "";
    parts.push(`In Week ${week}${themeLabel}, several themes emerged.`);
    // Patterns & connections
    const context = [...(byType.pattern || []), ...(byType.connection || [])];
    if (context.length > 0) {
      parts.push(context.length === 1
        ? `A key pattern was noticed: ${context[0]}`
        : `Notable patterns included: ${context.join(". ")}`);
    }
    // Shifts & breakthroughs
    const growth = [...(byType.shift || []), ...(byType.breakthrough || [])];
    if (growth.length > 0) {
      parts.push(growth.length === 1
        ? `A meaningful shift emerged: ${growth[0]}`
        : `Growth showed up in: ${growth.join(". ")}`);
    }
    // Sticking points
    if (byType.sticking_point?.length) {
      parts.push(byType.sticking_point.length === 1
        ? `An area to continue exploring: ${byType.sticking_point[0]}`
        : `Areas to explore further: ${byType.sticking_point.join(". ")}`);
    }
    return parts.join(" ");
  }

  async function handleShareExercise(exercise: ExerciseDetail) {
    if (!exerciseShareEmail || sendingExercise) return;
    setSendingExercise(true);
    setExerciseShareSuccess(false);
    try {
      const res = await fetch("/api/exercises/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: exerciseShareEmail,
          exercise,
          weekNumber,
          programName: enrollment?.programs?.name,
        }),
      });
      if (res.ok) {
        setExerciseShareSuccess(true);
        setTimeout(() => { setExerciseShareSuccess(false); setSharingExercise(null); setExerciseShareEmail(""); }, 2000);
      }
    } catch (err) {
      console.error("Share exercise failed:", err);
    } finally {
      setSendingExercise(false);
    }
  }

  async function handleSave() {
    if (!user || !enrollment) return;
    setSaving(true);

    const completedSess = sessions.filter((s) => s.completed_at);

    const reviewData = {
      client_id: user.id,
      week_start: getWeekStart(),
      accountability_rating: Math.round(
        Object.values(goalRatings).reduce((sum, g) => sum + g.rating, 0) / Math.max(Object.values(goalRatings).length, 1)
      ),
      reflection,
      plan_adjustments: feedback,
      entries_count: completedSess.length,
      exercises_completed: exerciseCount,
      top_themes: weekTheme ? [weekTheme.name] : [],
      enrollment_id: enrollment.id,
      goal_ratings: goalRatings,
      week_number: weekNumber,
      key_insights: insights,
      summary_text: summaryText,
      sessions_completed: completedSess.length,
      exercises_count: exerciseCount,
    };

    // Check for existing review first, then update or insert
    const { data: existing } = await supabase
      .from("weekly_reviews")
      .select("id")
      .eq("client_id", user.id)
      .eq("enrollment_id", enrollment.id)
      .eq("week_number", weekNumber)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("weekly_reviews")
        .update(reviewData)
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("weekly_reviews")
        .insert(reviewData));
    }

    if (error) {
      console.error("Failed to save review:", error);
      alert("Failed to save. Check console for details.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ color: colors.textMuted }}>Loading review...</p>
        </div>
      </PageShell>
    );
  }

  /* ── No enrollment ── */
  if (!enrollment) {
    return (
      <PageShell>
        <div style={{ paddingTop: 48 }}>
          <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.textPrimary, marginBottom: 12 }}>
            No active program
          </h1>
          <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.6 }}>
            Start a program to access your weekly review.
          </p>
          <PillButton onClick={() => router.push("/intake")} style={{ marginTop: 20 }}>
            Start a Program
          </PillButton>
        </div>
      </PageShell>
    );
  }

  /* ── Stats ── */
  const completedSessions = sessions.filter((s) => s.completed_at);
  // Week is complete when all 7 days have been finished (completed_at set)
  const weekComplete = completedSessions.length >= 7;

  const insightTypeStyles: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode }> = {
    pattern: {
      bg: "rgba(99,102,241,0.06)", color: "#818cf8", border: "#818cf8",
      icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
    },
    shift: {
      bg: "rgba(224,149,133,0.06)", color: colors.coral, border: colors.coral,
      icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2} strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
    },
    sticking_point: {
      bg: "rgba(245,158,11,0.06)", color: "#fbbf24", border: "#fbbf24",
      icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    },
    breakthrough: {
      bg: "rgba(224,149,133,0.06)", color: colors.coral, border: colors.coral,
      icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2} strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    },
    connection: {
      bg: "rgba(59,130,246,0.06)", color: "#60a5fa", border: "#60a5fa",
      icon: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    },
  };

  return (
    <PageShell>

      {/* ── Program Switcher ── */}
      <ProgramSwitcher currentEnrollmentId={enrollment.id} onSwitch={handleSwitchEnrollment} />

      {/* ── Week Header ── */}
      <FadeIn preset="fade" duration={0.6} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{
              display: "inline-block",
              background: colors.coralWash,
              color: colors.coral,
              fontFamily: display, fontWeight: 700, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              Week {weekNumber}
            </span>
            <span style={{
              display: "inline-block",
              background: colors.bgElevated,
              color: colors.textMuted,
              fontFamily: display, fontWeight: 600, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              {enrollment.programs?.name}
            </span>
          </div>
          {weekTheme && (
            <>
              <h1 style={{
                fontFamily: display, fontSize: 32, fontWeight: 700,
                letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
              }}>
                {weekTheme.name}: {weekTheme.title}
              </h1>
              <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, fontFamily: body, lineHeight: 1.6 }}>
                {weekTheme.territory}
              </p>
            </>
          )}
          {!weekTheme && (
            <h1 style={{
              fontFamily: display, fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", color: colors.textPrimary, margin: 0,
            }}>
              Weekly Review
            </h1>
          )}
        </div>
      </FadeIn>

      {/* ── Week completion gate ── */}
      {!weekComplete && (
        <FadeIn preset="fade" delay={0.14} triggerOnMount>
          <div style={{
            backgroundColor: colors.bgSurface, borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`, padding: 24,
            textAlign: "center", marginBottom: 32,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              backgroundColor: colors.bgElevated, margin: "0 auto 12px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{
              fontSize: 15, fontWeight: 600, color: colors.textPrimary,
              margin: "0 0 6px 0", fontFamily: display,
            }}>
              Complete all 7 days to unlock your review
            </p>
            <p style={{
              fontSize: 13, color: colors.textMuted, margin: 0, fontFamily: body, lineHeight: 1.5,
            }}>
              {completedSessions.length}/7 days finished. Each day&apos;s exercises must be done or parked before the review sections become available.
            </p>
          </div>
        </FadeIn>
      )}

      {weekComplete && (
      <>
      {/* ── Goal Check-in ── */}
      {activeGoals.length > 0 && (
        <FadeIn preset="slide-up" delay={0.15} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Goal check-in" sectionKey="goals" collapsed={collapsedSections.has("goals")} onToggle={toggleSection} />
            <AnimatePresence initial={false}>
              {!collapsedSections.has("goals") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p style={{ fontSize: 13, color: colors.textMuted, margin: "6px 0 16px 0", fontFamily: body }}>
                    How are you tracking? 1 = not started · 10 = crushing it
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {activeGoals.map((goal) => {
                      const gr = goalRatings[goal.id] || { rating: 5, note: "" };
                      return (
                        <div key={goal.id} style={{
                          backgroundColor: colors.bgSurface,
                          borderRadius: 14,
                          border: `1px solid ${colors.borderDefault}`,
                          padding: 20,
                        }}>
                          <p style={{
                            fontSize: 14, fontWeight: 600, color: colors.textPrimary,
                            margin: "0 0 12px 0", lineHeight: 1.4, fontFamily: body,
                          }}>
                            {goal.goal_text}
                          </p>

                          {/* Goal rating slider */}
                          <div style={{ marginBottom: 10 }}>
                            <GoalSlider
                              value={gr.rating}
                              onChange={(v) => updateGoalRating(goal.id, v)}
                            />
                          </div>

                          {/* Optional note */}
                          <input
                            type="text"
                            value={gr.note}
                            onChange={(e) => updateGoalNote(goal.id, e.target.value)}
                            placeholder="Quick note (optional)"
                            onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                            onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                            style={{
                              width: "100%", padding: "8px 12px", fontSize: 13,
                              fontFamily: body, border: `1px solid ${colors.borderDefault}`,
                              borderRadius: 8, outline: "none", boxSizing: "border-box",
                              backgroundColor: colors.bgInput, color: colors.textPrimary,
                              transition: "border-color 0.2s",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      )}

      {/* ── Weekly Summary (merged insights + summary) ── */}
      <FadeIn preset="fade" delay={0.2} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionHeader title="Weekly Summary" sectionKey="summary" collapsed={collapsedSections.has("summary")} onToggle={toggleSection} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {summaryText && (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSummaryShare(!showSummaryShare)}
                  style={{
                    padding: "6px 16px", fontSize: 12, fontWeight: 600,
                    fontFamily: display, borderRadius: 100, cursor: "pointer",
                    border: `1px solid ${showSummaryShare ? colors.coral : colors.borderDefault}`,
                    backgroundColor: showSummaryShare ? colors.coralWash : "transparent",
                    color: showSummaryShare ? colors.coral : colors.textSecondary,
                  }}
                >
                  Share
                </motion.button>
              )}
              {insights.length === 0 && !summaryText && (
                <PillButton onClick={generateInsights} disabled={loadingInsights} size="sm">
                  {loadingInsights ? "Analyzing..." : "Generate summary"}
                </PillButton>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!collapsedSections.has("summary") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >

          {/* Share email form */}
          <AnimatePresence>
            {showSummaryShare && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden", marginBottom: 14 }}
              >
                <div style={{
                  backgroundColor: colors.bgSurface, borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`, padding: 16,
                  display: "flex", gap: 10, alignItems: "center",
                }}>
                  <input
                    type="email"
                    value={summaryShareEmail}
                    onChange={(e) => setSummaryShareEmail(e.target.value)}
                    placeholder="Email address"
                    style={{
                      flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: body,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
                      backgroundColor: colors.bgInput, color: colors.textPrimary,
                      outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                    onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleShareSummary(summaryText, weekNumber)}
                    disabled={sharingSummary || !summaryShareEmail}
                    style={{
                      padding: "10px 22px", fontSize: 13, fontWeight: 600,
                      fontFamily: display, borderRadius: 100, cursor: "pointer",
                      border: "none", flexShrink: 0,
                      backgroundColor: colors.coral,
                      color: colors.bgDeep,
                      opacity: sharingSummary || !summaryShareEmail ? 0.5 : 1,
                    }}
                  >
                    {sharingSummary ? "Sending..." : summaryShareSuccess ? "Sent ✓" : "Send"}
                  </motion.button>
                </div>
                <p style={{ fontSize: 12, color: colors.textMuted, margin: "8px 0 0 4px", fontFamily: body }}>
                  The summary text below will be sent as-is. Edit it before sharing if you&apos;d like.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {loadingInsights && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 24,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
                Reading your journal entries and exercises from this week...
              </p>
            </div>
          )}

          {/* Editable summary paragraph */}
          {summaryText && (
            <div style={{
              backgroundColor: colors.bgSurface, borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 20, marginBottom: insights.length > 0 ? 14 : 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontSize: 11, fontFamily: display, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "3px 12px", borderRadius: 100,
                  backgroundColor: colors.coralWash, color: colors.coral,
                }}>
                  Week {weekNumber}
                </span>
                {weekTheme && (
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
                    {weekTheme.name}: {weekTheme.title}
                  </span>
                )}
              </div>
              <textarea
                value={summaryText}
                onChange={(e) => { setSummaryText(e.target.value); setSaved(false); }}
                rows={5}
                style={{
                  width: "100%", padding: 14, fontSize: 14, lineHeight: 1.7,
                  fontFamily: body,
                  backgroundColor: colors.bgInput,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 10,
                  color: colors.textPrimary,
                  resize: "vertical", boxSizing: "border-box",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
              />
              <p style={{ fontSize: 11, color: colors.textMuted, margin: "6px 0 0 2px", fontFamily: body }}>
                Edit this summary freely — your changes are saved with the review.
              </p>
            </div>
          )}

          {/* Expandable insight details */}
          {insights.length > 0 && (
            <>
              <button
                onClick={() => setShowInsightDetails(!showInsightDetails)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, fontFamily: display,
                  color: colors.textSecondary, background: "none", border: "none",
                  cursor: "pointer", padding: "4px 0", marginBottom: showInsightDetails ? 10 : 0,
                }}
              >
                <motion.svg
                  width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round"
                  animate={{ rotate: showInsightDetails ? 90 : 0 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </motion.svg>
                {insights.length} insight{insights.length !== 1 ? "s" : ""} — {showInsightDetails ? "hide details" : "show details"}
              </button>
              <AnimatePresence>
                {showInsightDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {insights.map((ins, i) => {
                        const typeStyle = insightTypeStyles[ins.type] || { bg: colors.bgElevated, color: colors.textSecondary, border: colors.borderDefault, icon: null };
                        const isExpanded = expandedInsights.has(i);
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                              backgroundColor: typeStyle.bg,
                              borderRadius: 14,
                              border: `1px solid ${colors.borderDefault}`,
                              borderLeft: `4px solid ${typeStyle.border}`,
                              padding: "16px 16px 16px 14px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                              <span style={{
                                fontSize: 10, fontFamily: display, fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: "0.08em",
                                padding: "3px 10px", borderRadius: 100,
                                backgroundColor: `${typeStyle.color}18`, color: typeStyle.color,
                                display: "inline-flex", alignItems: "center", gap: 5,
                              }}>
                                {typeStyle.icon}
                                {ins.type.replace(/_/g, " ")}
                              </span>
                              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: body }}>
                                {ins.source}
                              </span>
                            </div>
                            <motion.div
                              animate={{ height: isExpanded ? "auto" : 52 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              style={{ overflow: "hidden", position: "relative" }}
                            >
                              <p style={{
                                fontSize: 13, color: colors.textBody, margin: 0,
                                lineHeight: 1.6, fontFamily: body,
                              }}>
                                {ins.insight}
                              </p>
                            </motion.div>
                            {ins.insight.length > 120 && (
                              <button
                                onClick={() => setExpandedInsights((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(i)) next.delete(i); else next.add(i);
                                  return next;
                                })}
                                style={{
                                  fontSize: 12, color: colors.coral, fontFamily: display,
                                  fontWeight: 600, background: "none", border: "none",
                                  cursor: "pointer", padding: "4px 0 0 0",
                                }}
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {!loadingInsights && insights.length === 0 && !summaryText && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 24,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
                Complete a few sessions first, then generate a summary of your week.
              </p>
            </div>
          )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>

      {/* ── Exercises ── */}
      {weekExercises.length > 0 && (
        <FadeIn preset="fade" delay={0.22} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <SectionHeader title="Exercises" sectionKey="exercises" collapsed={collapsedSections.has("exercises")} onToggle={toggleSection}>
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
                {weekExercises.length}
              </span>
            </SectionHeader>
            <AnimatePresence initial={false}>
              {!collapsedSections.has("exercises") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {weekExercises.map((ex) => {
                      const isOpen = expandedExercise === ex.id;
                      const isSharing = sharingExercise === ex.id;
                      const dayNum = sessions.find((s) => s.id === ex.daily_session_id)?.day_number;
                      return (
                        <motion.div
                          key={ex.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            backgroundColor: colors.bgSurface, borderRadius: 14,
                            border: `1px solid ${colors.borderDefault}`,
                            overflow: "hidden",
                          }}
                        >
                          {/* Exercise header — clickable */}
                          <button
                            onClick={() => setExpandedExercise(isOpen ? null : ex.id)}
                            style={{
                              width: "100%", padding: "16px 18px",
                              display: "flex", alignItems: "center", gap: 10,
                              background: "none", border: "none", cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <motion.svg
                              width={14} height={14} viewBox="0 0 24 24" fill="none"
                              stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round"
                              animate={{ rotate: isOpen ? 90 : 0 }}
                            >
                              <path d="M9 18l6-6-6-6" />
                            </motion.svg>
                            <span style={{
                              fontSize: 14, fontWeight: 600, fontFamily: display,
                              color: colors.textPrimary, flex: 1,
                            }}>
                              {ex.framework_name}
                            </span>
                            {ex.modality && (
                              <span style={{
                                fontSize: 10, fontFamily: display, fontWeight: 600,
                                textTransform: "uppercase", letterSpacing: "0.06em",
                                padding: "2px 8px", borderRadius: 100,
                                backgroundColor: colors.plumWash, color: colors.plumLight,
                              }}>
                                {ex.modality}
                              </span>
                            )}
                            {ex.star_rating && (
                              <span style={{ fontSize: 12, color: colors.warning }}>
                                {"★".repeat(ex.star_rating)}
                              </span>
                            )}
                            {dayNum && (
                              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: body }}>
                                Day {dayNum}
                              </span>
                            )}
                          </button>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                              >
                                <div style={{
                                  padding: "0 18px 18px 18px",
                                  borderTop: `1px solid ${colors.borderDefault}`,
                                }}>
                                  {ex.custom_framing && (
                                    <p style={{
                                      fontSize: 13, color: colors.textSecondary, margin: "14px 0 12px 0",
                                      lineHeight: 1.5, fontFamily: body, fontStyle: "italic",
                                      paddingLeft: 12, borderLeft: `3px solid ${colors.coral}`,
                                    }}>
                                      {ex.custom_framing}
                                    </p>
                                  )}
                                  {/* Response Q&A pairs */}
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                                    {Object.entries(ex.responses || {}).map(([q, a], idx) => (
                                      <div key={idx}>
                                        <p style={{
                                          fontSize: 11, fontWeight: 600, color: colors.textMuted,
                                          margin: "0 0 3px 0", fontFamily: display,
                                          textTransform: "uppercase", letterSpacing: "0.04em",
                                        }}>
                                          {q}
                                        </p>
                                        <p style={{
                                          fontSize: 14, color: colors.textBody, margin: 0,
                                          lineHeight: 1.6, fontFamily: body,
                                        }}>
                                          {String(a)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  {ex.feedback && (
                                    <p style={{
                                      fontSize: 13, color: colors.textMuted, margin: "14px 0 0 0",
                                      fontFamily: body, lineHeight: 1.5,
                                    }}>
                                      Feedback: {ex.feedback}
                                    </p>
                                  )}
                                  {/* Share button */}
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.borderDefault}` }}>
                                    <motion.button
                                      whileHover={{ scale: 1.04 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => { setSharingExercise(isSharing ? null : ex.id); setExerciseShareEmail(""); }}
                                      style={{
                                        padding: "6px 16px", fontSize: 12, fontWeight: 600,
                                        fontFamily: display, borderRadius: 100, cursor: "pointer",
                                        border: `1px solid ${isSharing ? colors.coral : colors.borderDefault}`,
                                        backgroundColor: isSharing ? colors.coralWash : "transparent",
                                        color: isSharing ? colors.coral : colors.textSecondary,
                                      }}
                                    >
                                      Share exercise
                                    </motion.button>
                                  </div>
                                  {/* Inline share form */}
                                  <AnimatePresence>
                                    {isSharing && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        style={{ overflow: "hidden" }}
                                      >
                                        <div style={{
                                          display: "flex", gap: 10, alignItems: "center", marginTop: 10,
                                        }}>
                                          <input
                                            type="email"
                                            value={exerciseShareEmail}
                                            onChange={(e) => setExerciseShareEmail(e.target.value)}
                                            placeholder="Email address"
                                            style={{
                                              flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: body,
                                              border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
                                              backgroundColor: colors.bgInput, color: colors.textPrimary,
                                              outline: "none", boxSizing: "border-box",
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                                            onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                                          />
                                          <motion.button
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleShareExercise(ex)}
                                            disabled={sendingExercise || !exerciseShareEmail}
                                            style={{
                                              padding: "10px 22px", fontSize: 13, fontWeight: 600,
                                              fontFamily: display, borderRadius: 100, cursor: "pointer",
                                              border: "none", flexShrink: 0,
                                              backgroundColor: colors.coral,
                                              color: colors.bgDeep,
                                              opacity: sendingExercise || !exerciseShareEmail ? 0.5 : 1,
                                            }}
                                          >
                                            {sendingExercise ? "Sending..." : exerciseShareSuccess ? "Sent ✓" : "Send"}
                                          </motion.button>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>
      )}

      {/* ── Reflection ── */}
      <FadeIn preset="fade" delay={0.25} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <SectionHeader title="Reflection" sectionKey="reflection" collapsed={collapsedSections.has("reflection")} onToggle={toggleSection} />
          <AnimatePresence initial={false}>
            {!collapsedSections.has("reflection") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <p style={{ fontSize: 13, color: colors.textMuted, margin: "6px 0 12px 0", fontFamily: body }}>
                  What surprised you this week? What felt hard? What do you want to carry forward?
                </p>
                <textarea
                  value={reflection}
                  onChange={(e) => { setReflection(e.target.value); setSaved(false); }}
                  rows={5}
                  placeholder="Write freely..."
                  style={{
                    width: "100%", padding: 16, fontSize: 15, lineHeight: 1.7,
                    fontFamily: body,
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: 14,
                    color: colors.textPrimary,
                    resize: "vertical", boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                  onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>

      {/* ── Feedback ── */}
      <FadeIn preset="fade" delay={0.28} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <SectionHeader title="Feedback for the humans behind this" sectionKey="feedback" collapsed={collapsedSections.has("feedback")} onToggle={toggleSection} />
          <AnimatePresence initial={false}>
            {!collapsedSections.has("feedback") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <p style={{ fontSize: 13, color: colors.textMuted, margin: "6px 0 12px 0", fontFamily: body }}>
                  Optional — how did the program and exercises feel this week? What worked, what didn&apos;t, what would you change?
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => { setFeedback(e.target.value); setSaved(false); }}
                  rows={4}
                  placeholder="The exercises felt... The program this week was... I'd like more/less of..."
                  style={{
                    width: "100%", padding: 16, fontSize: 15, lineHeight: 1.7,
                    fontFamily: body,
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: 14,
                    color: colors.textPrimary,
                    resize: "vertical", boxSizing: "border-box",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                  onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </FadeIn>

      {/* ── Save ── */}
      <FadeIn preset="fade" delay={0.32} triggerOnMount>
        <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
          <PillButton
            onClick={handleSave}
            disabled={saving}
            variant={saved ? "success" : "coral"}
            size="lg"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Review"}
          </PillButton>
        </div>
      </FadeIn>

      {/* Past week summaries (below save) */}
      {weekSummaries.length > 0 && (
        <FadeIn preset="fade" delay={0.36} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <h3 style={{
              fontFamily: display, fontSize: 15, fontWeight: 700,
              color: colors.textSecondary, margin: "0 0 12px 0",
              letterSpacing: "-0.01em",
            }}>
              Past weeks
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {weekSummaries.map((ws) => {
                const themes = enrollment?.programs?.weekly_themes || [];
                const wsTheme = themes.find((t: WeekTheme) => t.week === ws.week_number);
                const paragraph = ws.reflection || generateSummaryParagraph(ws.key_insights, ws.week_number, wsTheme);
                return (
                  <div
                    key={ws.week_number}
                    style={{
                      backgroundColor: colors.bgSurface, borderRadius: 14,
                      border: `1px solid ${colors.borderDefault}`,
                      padding: 18,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontFamily: display, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        padding: "3px 12px", borderRadius: 100,
                        backgroundColor: colors.bgElevated, color: colors.textSecondary,
                      }}>
                        Week {ws.week_number}
                      </span>
                      {wsTheme && (
                        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
                          {wsTheme.name}: {wsTheme.title}
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 13, color: colors.textBody, margin: 0,
                      lineHeight: 1.6, fontFamily: body,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden",
                    }}>
                      {paragraph}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}
      </>
      )}

      {/* ── Go deeper — upsells ── */}
      <FadeIn preset="fade" delay={0.4} triggerOnMount>
        <div style={{ marginTop: 36 }}>
          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textMuted, margin: "0 0 14px 0", letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            Go deeper
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}>
            {/* Enneagram upsell */}
            <motion.div
              whileHover={{ y: -6, borderColor: "rgba(176, 141, 173, 0.5)", boxShadow: "0 16px 48px rgba(123, 82, 120, 0.25)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14, padding: 24,
                border: "1px solid rgba(176, 141, 173, 0.3)",
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 120, height: 120, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(176, 141, 173, 0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <span style={{
                alignSelf: "flex-start",
                fontFamily: body, fontSize: 9, fontWeight: 700,
                letterSpacing: 1.5, textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 6,
                backgroundColor: colors.plumWash, color: colors.plumLight,
                marginBottom: 14,
              }}>
                Deepest insight
              </span>
              <p style={{
                fontFamily: display, fontSize: 18, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 8px 0", letterSpacing: "-0.01em",
              }}>
                Add Enneagram
              </p>
              <p style={{
                fontFamily: body, fontSize: 13, color: colors.textSecondary,
                lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
              }}>
                The IEQ9 assessment + 1-hour debrief with a certified coach. Your results refine every exercise and goal.
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: display, fontSize: 15, fontWeight: 600, color: colors.plumLight }}>
                  $275
                </span>
                <PillButton variant="plum" size="sm" onClick={() => router.push(`/${enrollment.programs?.slug || "basecamp"}#pricing`)}>
                  Learn more
                </PillButton>
              </div>
            </motion.div>

            {/* 1:1 Coaching upsell */}
            <motion.div
              whileHover={{ y: -6, borderColor: "rgba(224, 149, 133, 0.35)", boxShadow: "0 16px 48px rgba(224, 149, 133, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14, padding: 24,
                border: `1px solid ${colors.borderDefault}`,
                position: "relative", overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 120, height: 120, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(224, 149, 133, 0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <span style={{
                alignSelf: "flex-start",
                fontFamily: body, fontSize: 9, fontWeight: 700,
                letterSpacing: 1.5, textTransform: "uppercase",
                padding: "5px 12px", borderRadius: 6,
                backgroundColor: colors.coralWash, color: colors.coralLight,
                marginBottom: 14,
              }}>
                Human support
              </span>
              <p style={{
                fontFamily: display, fontSize: 18, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 8px 0", letterSpacing: "-0.01em",
              }}>
                Add 1:1 Coaching
              </p>
              <p style={{
                fontFamily: body, fontSize: 13, color: colors.textSecondary,
                lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
              }}>
                A 3-month partnership with a certified coach who already knows your patterns from the program.
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <PillButton size="sm" onClick={() => router.push("/intake")}>
                  Apply
                </PillButton>
              </div>
            </motion.div>
          </div>
        </div>
      </FadeIn>
    </PageShell>
  );
}
