"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import { colors, fonts } from "@/lib/theme";
import AnimatedStat from "@/components/AnimatedStat";
import ProgramSwitcher from "@/components/ProgramSwitcher";
import EnneagramUpload from "@/components/EnneagramUpload";
import EnneagramInsights from "@/components/EnneagramInsights";
import type { EnneagramAnalysis, EnneagramDoc } from "@/components/EnneagramUpload";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Types ── */
interface Goal {
  id: string;
  enrollment_id: string;
  goal_text: string;
  why_generated: string;
  status: string;
  order_index: number;
}

interface WeekTheme {
  week: number;
  name: string;
  title: string;
  territory: string;
}

interface DailySession {
  id: string;
  day_number: number;
  completed_at: string | null;
}

interface Enrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  goals_approved: boolean;
  programs: { name: string; slug: string; weekly_themes: WeekTheme[] };
}

interface WeekRating {
  week_number: number;
  goal_ratings: Record<string, { rating: number; note: string }>;
}

export default function GoalsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <GoalsPage />
    </Suspense>
  );
}

function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeGoalIds, setActiveGoalIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<User | null>(null);
  const [weekRatings, setWeekRatings] = useState<WeekRating[]>([]);
  const [sessions, setSessions] = useState<DailySession[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [journalEntryCount, setJournalEntryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [enneagramData, setEnneagramData] = useState<EnneagramAnalysis | null>(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekTheme, setWeekTheme] = useState<WeekTheme | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentParam = searchParams.get("enrollment");

  function handleSwitchEnrollment(enrollmentId: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("enrollment", enrollmentId);
    window.location.href = `/goals?${params.toString()}`;
  }

  const loadData = useCallback(async (userId: string) => {
    let selectedEnrollment;
    if (enrollmentParam) {
      const { data } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("id", enrollmentParam)
        .eq("client_id", userId)
        .single();
      selectedEnrollment = data;
    } else {
      const { data: enrollments } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("client_id", userId)
        .in("status", ["awaiting_goals", "onboarding", "active", "pre_start", "completed", "paused"])
        .order("created_at", { ascending: false })
        .limit(1);
      selectedEnrollment = enrollments?.[0];
    }

    if (selectedEnrollment) {
      setEnrollment(selectedEnrollment);

      // Calculate current week & fetch week stats
      const currentWeek = Math.ceil(selectedEnrollment.current_day / 7);
      const reviewWeek = selectedEnrollment.current_day % 7 === 0
        ? Math.floor(selectedEnrollment.current_day / 7)
        : Math.max(1, currentWeek - 1);
      setWeekNumber(reviewWeek);

      const themes = selectedEnrollment.programs?.weekly_themes || [];
      const theme = themes.find((t: WeekTheme) => t.week === reviewWeek);
      if (theme) setWeekTheme(theme);

      const startDay = (reviewWeek - 1) * 7 + 1;
      const endDay = reviewWeek * 7;

      const { data: weekSessions } = await supabase
        .from("daily_sessions")
        .select("id, day_number, completed_at")
        .eq("enrollment_id", selectedEnrollment.id)
        .gte("day_number", startDay)
        .lte("day_number", endDay)
        .order("day_number", { ascending: true });
      if (weekSessions) setSessions(weekSessions);

      const sessionIds = weekSessions?.map((s: DailySession) => s.id) || [];
      if (sessionIds.length > 0) {
        const { count: exCount } = await supabase
          .from("exercise_completions")
          .select("id", { count: "exact", head: true })
          .in("daily_session_id", sessionIds);
        if (exCount !== null) setExerciseCount(exCount);
      }

      const completedDates = weekSessions
        ?.filter((s: DailySession) => s.completed_at)
        .map((s: DailySession) => s.completed_at!.split("T")[0]) || [];
      if (completedDates.length > 0) {
        const minDate = completedDates[0];
        const maxDate = completedDates[completedDates.length - 1];
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
      }

      const { data: goalData } = await supabase
        .from("client_goals")
        .select("*")
        .eq("enrollment_id", selectedEnrollment.id)
        .order("order_index");

      if (goalData) {
        setGoals(goalData);
        const active = new Set<string>();
        goalData.forEach((g: Goal) => {
          if (g.status === "active") active.add(g.id);
        });
        setActiveGoalIds(active);
      }

      // Fetch weekly goal ratings
      const { data: reviews } = await supabase
        .from("weekly_reviews")
        .select("week_number, goal_ratings")
        .eq("enrollment_id", selectedEnrollment.id)
        .order("week_number");
      if (reviews) {
        setWeekRatings(reviews.filter((r: WeekRating) => r.goal_ratings));
      }

      // Fetch enneagram data
      const { data: enneagram } = await supabase
        .from("client_assessments")
        .select("data")
        .eq("client_id", userId)
        .eq("type", "enneagram")
        .maybeSingle();
      if (enneagram?.data) {
        setEnneagramData(enneagram.data as EnneagramAnalysis);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await loadData(user.id);
      }
    }
    init();
  }, [supabase, loadData]);

  async function handleGenerate() {
    if (!enrollment) return;
    setGenerating(true);
    try {
      // Generate client profile first (growth edges, development map, context)
      // This feeds into goal generation for richer, more personalized goals
      try {
        await fetch("/api/generate-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId: enrollment.id }),
        });
      } catch (profileErr) {
        // Profile generation is supplementary — don't block goal generation
        console.warn("Profile generation failed (non-blocking):", profileErr);
      }

      const res = await fetch("/api/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to generate goals. Please try again.");
        setGenerating(false);
        return;
      }
      setErrorMsg(null);
      const data = await res.json();
      setGoals(data.goals);
      if (user) await loadData(user.id);
    } catch (err) {
      console.error("Goal generation failed:", err);
      setErrorMsg("Goal generation failed. Please try again or contact support.");
    }
    setGenerating(false);
  }

  function toggleGoalActive(goalId: string) {
    setActiveGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        if (next.size >= 3) {
          return prev;
        }
        next.add(goalId);
      }
      return next;
    });
  }

  async function handleApprove() {
    if (!enrollment || activeGoalIds.size === 0) return;
    setApproving(true);
    for (const goal of goals) {
      const newStatus = activeGoalIds.has(goal.id) ? "active" : "proposed";
      await supabase
        .from("client_goals")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", goal.id);
    }
    await supabase
      .from("program_enrollments")
      .update({ goals_approved: true, status: "active", current_day: Math.max(enrollment.current_day, 4) })
      .eq("id", enrollment.id);
    setApproving(false);
    router.push("/dashboard");
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <PageShell blobVariant="goals" showBgImage programSlug={enrollment?.programs?.slug}>
        <p style={{ color: "#ffffff", fontFamily: body }}>Loading goals...</p>
      </PageShell>
    );
  }

  /* ── No enrollment ── */
  if (!enrollment) {
    return (
      <PageShell blobVariant="goals" showBgImage>
        <FadeIn preset="fade" triggerOnMount>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 12px 0",
          }}>
            No active program
          </h1>
          <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.6, marginBottom: 24, fontFamily: body }}>
            You need to start a program first. Your goals are generated after completing Days 1-3.
          </p>
          <PillButton onClick={() => router.push("/#programs")} size="lg">
            Start a Program
          </PillButton>
        </FadeIn>
      </PageShell>
    );
  }

  /* ── Generate goals ── */
  if (goals.length === 0) {
    return (
      <PageShell blobVariant="goals" showBgImage programSlug={enrollment?.programs?.slug}>
        <ProgramSwitcher currentEnrollmentId={enrollment.id} onSwitch={handleSwitchEnrollment} />
        <FadeIn preset="fade" triggerOnMount>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span style={{
              display: "inline-block", background: colors.coralWash, color: colors.coral,
              fontFamily: display, fontWeight: 700, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              Week {Math.ceil(enrollment.current_day / 7)}
            </span>
            <span style={{
              display: "inline-block", background: colors.bgSurface, color: colors.textPrimary,
              fontFamily: display, fontWeight: 700, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              {enrollment.programs?.name}
            </span>
          </div>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 10px 0",
          }}>
            {enrollment.current_day < 4 ? "Goals unlock after Day 3" : "Generate your goals"}
          </h1>
          <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.6, marginBottom: 32, fontFamily: body }}>
            {enrollment.current_day < 4
              ? `You're on Day ${enrollment.current_day}. Complete your first three days — the exercises double as intake — and your coaching intelligence will generate 6 personalized goals.`
              : "Based on your intake and what surfaced in Days 1-3, your coaching intelligence will generate 6 personalized goals. You choose which 2-3 to work on first."}
          </p>
          {enrollment.current_day < 4 ? (
            <PillButton
              onClick={() => router.push(`/day/${enrollment.current_day}?enrollment=${enrollment.id}`)}
              size="lg"
            >
              Continue Day {enrollment.current_day}
            </PillButton>
          ) : (
            <PillButton
              onClick={handleGenerate}
              disabled={generating}
              size="lg"
            >
              {generating ? "Generating goals..." : "Generate My Goals"}
            </PillButton>
          )}
          <AnimatePresence>
            {generating && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: "#ffffff", fontSize: 13, marginTop: 14, fontFamily: body }}
              >
                Within the program arc, including your intake and journal entries to create goal suggestions. This takes ca. 15 seconds.
              </motion.p>
            )}
            {errorMsg && !generating && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: "#f87171", fontSize: 13, marginTop: 14, fontFamily: body }}
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </FadeIn>
      </PageShell>
    );
  }

  /* ── Goals list ── */
  const alreadyApproved = enrollment.goals_approved;
  const displayGoals = alreadyApproved
    ? goals.filter((g) => g.status === "active")
    : goals;

  return (
    <PageShell blobVariant="goals" showBgImage programSlug={enrollment?.programs?.slug}>
      {/* Program Switcher */}
      <ProgramSwitcher currentEnrollmentId={enrollment.id} onSwitch={handleSwitchEnrollment} />

      <FadeIn preset="fade" triggerOnMount>
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <span style={{
            display: "inline-block", background: colors.coralWash, color: colors.coral,
            fontFamily: display, fontWeight: 700, fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "5px 14px", borderRadius: 100,
          }}>
            Week {Math.ceil(enrollment.current_day / 7)}
          </span>
          <span style={{
            display: "inline-block", background: colors.bgSurface, color: colors.textPrimary,
            fontFamily: display, fontWeight: 700, fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "5px 14px", borderRadius: 100,
          }}>
            {enrollment.programs?.name}
          </span>
        </div>
        <h1 style={{
          fontFamily: display, fontSize: 32, fontWeight: 700,
          letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
        }}>
          {alreadyApproved ? "Your goals" : "Choose your goals"}
        </h1>
        {!alreadyApproved && (
          <p style={{ fontSize: 15, color: "#ffffff", lineHeight: 1.6, marginBottom: 28, fontFamily: body }}>
            Select 2-3 goals to work on first. The rest can be activated at any weekly check-in.
          </p>
        )}
        {alreadyApproved && (
          <p style={{ fontSize: 14, color: "#ffffff", marginBottom: 28, fontFamily: body }}>
            {displayGoals.length} active goal{displayGoals.length !== 1 ? "s" : ""}. Adjustments happen at weekly review.
          </p>
        )}
      </FadeIn>

      {/* ── Program Progress — Horizontal Steps ── */}
      {enrollment.programs?.weekly_themes?.length > 0 && (
        <FadeIn preset="fade" delay={0.08} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: display, fontSize: 18, fontWeight: 700,
              color: colors.textPrimary, margin: "0 0 14px 0", letterSpacing: "-0.02em",
            }}>
              Program progress
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, position: "relative" }}>
              {(enrollment.programs?.weekly_themes || []).map((wt: WeekTheme, idx: number) => {
                const weekStartDay = (wt.week - 1) * 7 + 1;
                const weekEndDay = wt.week * 7;
                const isCompleted = enrollment.current_day > weekEndDay;
                const isCurrent = enrollment.current_day >= weekStartDay && enrollment.current_day <= weekEndDay;
                const isViewWeek = wt.week === weekNumber;
                const themes = enrollment.programs?.weekly_themes || [];
                return (
                  <motion.div
                    key={wt.week}
                    whileHover={!isViewWeek ? { y: -2 } : {}}
                    onClick={() => {
                      if (wt.week !== weekNumber) {
                        setWeekNumber(wt.week);
                        setWeekTheme(wt);
                        const sd = (wt.week - 1) * 7 + 1;
                        const ed = wt.week * 7;
                        supabase
                          .from("daily_sessions")
                          .select("id, day_number, completed_at")
                          .eq("enrollment_id", enrollment.id)
                          .gte("day_number", sd)
                          .lte("day_number", ed)
                          .order("day_number", { ascending: true })
                          .then(({ data: ws }) => {
                            if (ws) setSessions(ws);
                            const sIds = ws?.map((s: DailySession) => s.id) || [];
                            if (sIds.length > 0) {
                              supabase
                                .from("exercise_completions")
                                .select("id", { count: "exact", head: true })
                                .in("daily_session_id", sIds)
                                .then(({ count }) => {
                                  if (count !== null) setExerciseCount(count);
                                });
                            } else {
                              setExerciseCount(0);
                            }
                          });
                      }
                    }}
                    style={{
                      backgroundColor: colors.bgSurface,
                      borderRadius: 12,
                      border: isViewWeek
                        ? `1.5px solid rgba(224, 149, 133, 0.4)`
                        : `1px solid ${colors.borderDefault}`,
                      padding: "14px 10px",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      textAlign: "center", gap: 8,
                      cursor: isViewWeek ? "default" : "pointer",
                      transition: "border-color 0.2s, transform 0.2s",
                      background: isViewWeek
                        ? `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.coralWash} 100%)`
                        : colors.bgSurface,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: (isCompleted || isCurrent) ? colors.coral : colors.bgElevated,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: (isCompleted || isCurrent) ? colors.bgDeep : colors.textMuted,
                      fontSize: 12, fontWeight: 700, fontFamily: display,
                    }}>
                      {isCompleted ? (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                        </svg>
                      ) : wt.week}
                    </div>
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                      margin: 0, fontFamily: display, textTransform: "uppercase",
                      letterSpacing: "0.04em", lineHeight: 1.2,
                    }}>
                      {wt.name}
                    </p>
                    <p style={{
                      fontSize: 11, color: colors.textMuted, margin: 0,
                      fontFamily: body, lineHeight: 1.3,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                      overflow: "hidden", minHeight: 28,
                    }}>
                      {wt.title}
                    </p>
                    <span style={{
                      fontSize: 9, fontWeight: 700, fontFamily: display,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      padding: "2px 8px", borderRadius: 100,
                      backgroundColor: (isCompleted || isCurrent) ? colors.coralWash : colors.bgElevated,
                      color: (isCompleted || isCurrent) ? colors.coral : colors.textMuted,
                    }}>
                      {isCompleted ? "Done" : isCurrent ? "Current" : "Upcoming"}
                    </span>
                    {idx < themes.length - 1 && (
                      <div style={{
                        position: "absolute",
                        top: "50%", transform: "translateY(-50%)",
                        left: `${((idx + 1) / themes.length) * 100}%`,
                        marginLeft: -5,
                        color: colors.textMuted, fontSize: 10, zIndex: 2, pointerEvents: "none",
                      }}>
                        ›
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Week Stats ── */}
      <FadeIn preset="fade" delay={0.1} triggerOnMount>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 32 }}>
          <AnimatedStat
            value={sessions.filter((s) => s.completed_at).length}
            max={7}
            label="sessions"
            format="/7"
            accentColor={colors.coral}
          />
          <AnimatedStat
            value={exerciseCount}
            max={Math.max(exerciseCount, 7)}
            label="exercises"
            accentColor={colors.coral}
          />
          <AnimatedStat
            value={journalEntryCount}
            max={Math.max(journalEntryCount, 7)}
            label="journal entries"
            accentColor={colors.warning}
          />
        </div>
      </FadeIn>

      {/* ── Enneagram Section ── */}
      <FadeIn preset="fade" delay={0.12} triggerOnMount>
        <div style={{ marginBottom: 24 }}>
          {enneagramData ? (
            <EnneagramInsights data={enneagramData} />
          ) : user ? (
            <EnneagramUpload
              clientId={user.id}
              onAnalysisComplete={(data) => setEnneagramData(data)}
            />
          ) : null}
        </div>
      </FadeIn>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {displayGoals.map((goal, i) => {
          const isActive = activeGoalIds.has(goal.id);
          return (
            <FadeIn key={goal.id} preset="slide-up" delay={i * 0.06} triggerOnMount>
              <motion.div
                onClick={() => !alreadyApproved && toggleGoalActive(goal.id)}
                whileHover={!alreadyApproved ? { y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.15)" } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  padding: 22,
                  cursor: alreadyApproved ? "default" : "pointer",
                  borderColor: isActive ? "rgba(224, 149, 133, 0.35)" : colors.borderDefault,
                  background: isActive
                    ? `linear-gradient(135deg, ${colors.bgSurface} 0%, rgba(224, 149, 133, 0.08) 100%)`
                    : colors.bgSurface,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Selector circle */}
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    border: isActive
                      ? `2px solid ${colors.coral}`
                      : `2px solid ${colors.borderDefault}`,
                    backgroundColor: isActive ? colors.coral : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.bgDeep, fontSize: 14, fontWeight: 700, fontFamily: display,
                    transition: "all 0.2s",
                  }}>
                    {isActive ? "✓" : ""}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 15, fontWeight: 600, color: colors.textPrimary,
                      margin: "0 0 6px 0", lineHeight: 1.45, fontFamily: body,
                    }}>
                      {goal.goal_text}
                    </p>
                    <p style={{
                      fontSize: 13, color: colors.textMuted,
                      margin: 0, lineHeight: 1.55, fontFamily: body,
                    }}>
                      {goal.why_generated}
                    </p>
                    {/* Weekly self-ratings */}
                    {alreadyApproved && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                        {[1, 2, 3, 4].map((wk) => {
                          const review = weekRatings.find((r) => r.week_number === wk);
                          const rating = review?.goal_ratings?.[goal.id]?.rating;
                          const hasRating = rating !== undefined;
                          const ratingColor = hasRating
                            ? rating >= 8 ? colors.coral
                            : rating >= 5 ? colors.coral
                            : "#fbbf24"
                            : colors.bgElevated;
                          return (
                            <div key={wk} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <span style={{
                                fontSize: 10, color: colors.textMuted, fontFamily: display, fontWeight: 600,
                              }}>
                                W{wk}
                              </span>
                              <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                backgroundColor: hasRating ? `${ratingColor}20` : colors.bgElevated,
                                border: `1.5px solid ${hasRating ? ratingColor : colors.borderDefault}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700, fontFamily: display,
                                color: hasRating ? ratingColor : colors.textMuted,
                              }}>
                                {hasRating ? rating : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>

      {!alreadyApproved && (
        <FadeIn preset="fade" delay={0.4} triggerOnMount>
          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <PillButton
              onClick={handleApprove}
              disabled={approving || activeGoalIds.size === 0}
              size="lg"
            >
              {approving
                ? "Saving..."
                : `Approve ${activeGoalIds.size} Goal${activeGoalIds.size !== 1 ? "s" : ""}`}
            </PillButton>
            <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: display, fontWeight: 500 }}>
              {activeGoalIds.size}/3 selected
            </span>
          </div>
        </FadeIn>
      )}

      {/* Exercise download */}
      {alreadyApproved && (
        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${colors.borderDefault}` }}>
            <button
              onClick={() => {
                const url = `/api/exercises/download?enrollmentId=${enrollment.id}`;
                const a = document.createElement("a");
                a.href = url;
                a.download = "mindcraft-exercise-guide.md";
                a.click();
              }}
              style={{
                fontFamily: display, fontSize: 13, fontWeight: 600,
                padding: "10px 24px", borderRadius: 100,
                backgroundColor: colors.bgElevated, color: "#ffffff",
                border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
              }}
            >
              Download Exercise Guide
            </button>
          </div>
        </FadeIn>
      )}

    </PageShell>
  );
}
