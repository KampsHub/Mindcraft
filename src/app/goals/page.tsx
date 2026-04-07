"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import { colors, fonts, radii } from "@/lib/theme";
import AnimatedStat from "@/components/AnimatedStat";
import ProgramSwitcher from "@/components/ProgramSwitcher";
import CloseEarlyCard from "@/components/CloseEarlyCard";
import EnneagramUpload from "@/components/EnneagramUpload";
import EnneagramInsights from "@/components/EnneagramInsights";
import type { EnneagramAnalysis, EnneagramDoc } from "@/components/EnneagramUpload";
import { trackEvent } from "@/components/GoogleAnalytics";

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
  const [totalCompletedSessions, setTotalCompletedSessions] = useState(0);
  const [allSessions, setAllSessions] = useState<DailySession[]>([]);
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

      // Also fetch ALL sessions for total counts + calendar
      const { data: totalSessions } = await supabase
        .from("daily_sessions")
        .select("id, day_number, completed_at")
        .eq("enrollment_id", selectedEnrollment.id)
        .order("day_number", { ascending: true });
      setAllSessions(totalSessions || []);
      setTotalCompletedSessions(totalSessions?.filter((s: { completed_at: string | null }) => s.completed_at).length || 0);

      // Count ALL exercises across the entire program
      const { data: allSessions } = await supabase
        .from("daily_sessions")
        .select("id")
        .eq("enrollment_id", selectedEnrollment.id);
      const allSessionIds = allSessions?.map((s: { id: string }) => s.id) || [];
      if (allSessionIds.length > 0) {
        const { count: exCount } = await supabase
          .from("exercise_completions")
          .select("id", { count: "exact", head: true })
          .in("daily_session_id", allSessionIds);
        if (exCount !== null) setExerciseCount(exCount);
      }

      // Count journal entries: daily session journals + mindful journal entries
      const dailyJournalCount = allSessions?.length || 0;
      const { count: mindfulCount } = await supabase
        .from("entries")
        .select("id", { count: "exact", head: true })
        .eq("client_id", userId)
        .eq("metadata->>source", "mindful_journal");
      setJournalEntryCount(dailyJournalCount + (mindfulCount || 0));

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
      trackEvent("goal_created", {
        program: enrollment?.programs?.slug ?? "unknown",
        goal_count: Array.isArray(data.goals) ? data.goals.length : 0,
      });
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
    trackEvent("goals_approved", {
      program: enrollment.programs?.slug ?? "unknown",
      goal_count: goals.length,
    });
    setApproving(false);
    router.push("/dashboard");
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <PageShell blobVariant="goals" showBgImage programSlug={enrollment?.programs?.slug}>
        <p style={{ color: colors.textPrimary, fontFamily: body }}>Loading goals...</p>
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
          <p style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 1.6, marginBottom: 24, fontFamily: body }}>
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
          <p style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 1.6, marginBottom: 32, fontFamily: body }}>
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
              <p
                style={{ color: colors.textPrimary, fontSize: 13, marginTop: 14, fontFamily: body }}
              >
                Processing your entries, goals, and position in the program arc to move further. This takes about 15 seconds.
              </p>
            )}
            {errorMsg && !generating && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: colors.error, fontSize: 13, marginTop: 14, fontFamily: body }}
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
          <p style={{ fontSize: 15, color: colors.textPrimary, lineHeight: 1.6, marginBottom: 28, fontFamily: body }}>
            Select 2-3 goals to work on first. The rest can be activated at any weekly check-in.
          </p>
        )}
        {alreadyApproved && (
          <p style={{ fontSize: 14, color: colors.textPrimary, marginBottom: 28, fontFamily: body }}>
            {displayGoals.length} active goal{displayGoals.length !== 1 ? "s" : ""}. Adjustments happen at weekly review.
          </p>
        )}
      </FadeIn>

      {/* Old "Program progress" section removed — replaced by the integrated 5-row layout below */}

      {/* ── Close early CTA (always visible under the progress grid) ── */}
      {enrollment?.id && (
        <FadeIn preset="fade" delay={0.12} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <CloseEarlyCard enrollmentId={enrollment.id} variant="full" />
          </div>
        </FadeIn>
      )}

      {/* ── Week Stats ── */}
      <FadeIn preset="fade" delay={0.1} triggerOnMount>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 32 }}>
          <AnimatedStat
            value={totalCompletedSessions}
            max={30}
            label="sessions"
            format="/30"
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

      {/* ── 30-Day journey, week-by-week (replaces both the old calendar and program-progress) ── */}
      {allSessions.length > 0 && enrollment && enrollment.programs?.weekly_themes?.length > 0 && (
        <FadeIn preset="fade" delay={0.12} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: display, fontSize: 14, fontWeight: 700,
              color: colors.textMuted, margin: "0 0 12px 0", letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Your 30 days
            </h2>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}>
              {(() => {
                // Build the 5-row layout: 4 weekly themes (capped at day 28) + Integration Phase (29-30)
                type Row = {
                  key: string;
                  label: string;        // "Week 1 · UNRAVEL" or "Integration Phase"
                  title: string;        // theme title or "The wind-down"
                  weekStart: number;
                  weekEnd: number;
                };

                const themes = enrollment.programs?.weekly_themes || [];
                const rows: Row[] = themes.map((wt: WeekTheme) => {
                  const start = (wt.week - 1) * 7 + 1;
                  // Cap week 4 at day 28 instead of 30 — days 29-30 belong to the integration phase
                  const end = wt.week === 4 ? 28 : wt.week * 7;
                  return {
                    key: `week-${wt.week}`,
                    label: `Week ${wt.week} · ${wt.name}`,
                    title: wt.title,
                    weekStart: start,
                    weekEnd: end,
                  };
                });

                // Append the synthetic 5th row
                rows.push({
                  key: "integration",
                  label: "Integration Phase",
                  title: "Wind-down. Reflect on what shifted, what to carry forward.",
                  weekStart: 29,
                  weekEnd: 30,
                });

                return rows.map((row) => {
                  const weekDays = Array.from(
                    { length: row.weekEnd - row.weekStart + 1 },
                    (_, i) => row.weekStart + i
                  );

                  const isWeekCurrent =
                    enrollment.current_day >= row.weekStart && enrollment.current_day <= row.weekEnd;
                  const isWeekDone = enrollment.current_day > row.weekEnd;
                  const isIntegration = row.key === "integration";

                  return (
                    <div
                      key={row.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(120px, 160px) 1fr",
                        gap: 14,
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: 10,
                        backgroundColor: isWeekCurrent
                          ? `${colors.coral}10`
                          : "transparent",
                        border: isWeekCurrent
                          ? `1px solid ${colors.coral}30`
                          : isIntegration
                            ? `1px dashed ${colors.borderSubtle}`
                            : `1px solid transparent`,
                      }}
                    >
                      {/* Week label (left) */}
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontFamily: display,
                          fontSize: 9,
                          fontWeight: 700,
                          color: isWeekCurrent ? colors.coral : colors.textMuted,
                          margin: 0,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          lineHeight: 1.2,
                        }}>
                          {row.label}
                        </p>
                        <p style={{
                          fontFamily: body,
                          fontSize: 11,
                          color: isWeekCurrent ? colors.textPrimary : colors.textSecondary,
                          margin: "2px 0 0 0",
                          lineHeight: 1.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}>
                          {row.title}
                        </p>
                      </div>

                      {/* Day dots (right) */}
                      <div style={{
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}>
                        {weekDays.map((dayNum) => {
                          const session = allSessions.find(s => s.day_number === dayNum);
                          const isCompleted = session?.completed_at != null;
                          const isStarted = !!session && !isCompleted;
                          const isCurrent = dayNum === enrollment.current_day;
                          const isFuture = dayNum > enrollment.current_day;

                          return (
                            <div
                              key={dayNum}
                              title={`Day ${dayNum}${isCompleted ? " · done" : isCurrent ? " · today" : isFuture ? " · upcoming" : ""}`}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 9,
                                fontFamily: display,
                                fontWeight: isCurrent ? 700 : 500,
                                color: isCompleted
                                  ? colors.bgDeep
                                  : isCurrent
                                    ? colors.coral
                                    : isFuture
                                      ? colors.textMuted
                                      : colors.textSecondary,
                                backgroundColor: isCompleted
                                  ? colors.coral
                                  : isCurrent
                                    ? `${colors.coral}20`
                                    : isStarted
                                      ? `${colors.coral}10`
                                      : `${colors.bgElevated}80`,
                                border: isCurrent ? `1.5px solid ${colors.coral}` : "1px solid transparent",
                                opacity: isFuture ? 0.45 : 1,
                                flexShrink: 0,
                              }}
                            >
                              {dayNum}
                            </div>
                          );
                        })}

                        {/* Status badge at end of row */}
                        {(isWeekCurrent || isWeekDone) && (
                          <span style={{
                            marginLeft: 6,
                            fontSize: 8,
                            fontWeight: 700,
                            fontFamily: display,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            padding: "2px 6px",
                            borderRadius: 100,
                            backgroundColor: isWeekCurrent ? colors.coralWash : `${colors.coral}30`,
                            color: colors.coral,
                          }}>
                            {isWeekDone ? "Done" : "Now"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Enneagram Section ── */}
      <FadeIn preset="fade" delay={0.12} triggerOnMount>
        <div style={{ marginBottom: 24 }}>
          {enneagramData ? (
            <>
              <EnneagramInsights data={enneagramData} />
              {goals.length > 0 && !alreadyApproved && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!enrollment) return;
                    setGenerating(true);
                    setErrorMsg(null);
                    try {
                      const res = await fetch("/api/generate-goals", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ enrollmentId: enrollment.id, regenerate: true }),
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        setErrorMsg(err.error || "Failed to regenerate goals.");
                      } else {
                        const data = await res.json();
                        setGoals(data.goals);
                        setActiveGoalIds(new Set());
                      }
                    } catch {
                      setErrorMsg("Regeneration failed. Please try again.");
                    }
                    setGenerating(false);
                  }}
                  disabled={generating}
                  style={{
                    marginTop: 12,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.coral,
                    backgroundColor: "transparent",
                    border: `1px solid ${colors.coral}`,
                    borderRadius: 100,
                    cursor: generating ? "wait" : "pointer",
                    fontFamily: display,
                    opacity: generating ? 0.5 : 1,
                  }}
                >
                  {generating ? "Regenerating..." : "Regenerate Goals with Enneagram"}
                </motion.button>
              )}
            </>
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
                whileHover={!alreadyApproved ? { y: -2 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  borderRadius: radii.lg,
                  border: isActive
                    ? `2px solid ${colors.coral}`
                    : `1px solid ${colors.borderSubtle}`,
                  padding: "20px 22px",
                  cursor: alreadyApproved ? "default" : "pointer",
                  backgroundColor: isActive ? colors.bgSurface : colors.bgRecessed,
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  {/* Selector / status indicator */}
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    border: isActive
                      ? `2px solid ${colors.coral}`
                      : `1.5px solid ${colors.borderDefault}`,
                    backgroundColor: isActive ? colors.coral : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke={colors.bgDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 16, fontWeight: 600, color: colors.textPrimary,
                      margin: "0 0 8px 0", lineHeight: 1.4, fontFamily: body,
                    }}>
                      {goal.goal_text}
                    </p>
                    <p style={{
                      fontSize: 14, color: colors.textSecondary,
                      margin: 0, lineHeight: 1.6, fontFamily: body,
                    }}>
                      {goal.why_generated}
                    </p>
                    {/* Weekly self-ratings + status controls */}
                    {alreadyApproved && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                        {[1, 2, 3, 4].map((wk) => {
                          const review = weekRatings.find((r) => r.week_number === wk);
                          const rating = review?.goal_ratings?.[goal.id]?.rating;
                          const hasRating = rating !== undefined;
                          const ratingColor = hasRating
                            ? rating >= 8 ? colors.coral
                            : rating >= 5 ? colors.coral
                            : colors.warning
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
                        {/* Goal status controls */}
                        {goal.status === "active" && (
                          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await supabase.from("client_goals").update({ status: "completed" }).eq("id", goal.id);
                                setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, status: "completed" } : g));
                              }}
                              style={{
                                padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                color: colors.success, backgroundColor: `${colors.success}15`,
                                border: `1px solid ${colors.success}40`, borderRadius: 100,
                                cursor: "pointer", fontFamily: display,
                              }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await supabase.from("client_goals").update({ status: "paused" }).eq("id", goal.id);
                                setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, status: "paused" } : g));
                              }}
                              style={{
                                padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                color: colors.textMuted, backgroundColor: colors.bgElevated,
                                border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                                cursor: "pointer", fontFamily: display,
                              }}
                            >
                              Pause
                            </button>
                          </div>
                        )}
                        {goal.status === "paused" && (
                          <div style={{ marginLeft: "auto" }}>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await supabase.from("client_goals").update({ status: "active" }).eq("id", goal.id);
                                setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, status: "active" } : g));
                              }}
                              style={{
                                padding: "4px 10px", fontSize: 11, fontWeight: 600,
                                color: colors.coral, backgroundColor: colors.coralWash,
                                border: `1px solid ${colors.coral}40`, borderRadius: 100,
                                cursor: "pointer", fontFamily: display,
                              }}
                            >
                              Resume
                            </button>
                          </div>
                        )}
                        {goal.status === "completed" && (
                          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: colors.success, fontFamily: display }}>
                            Completed
                          </span>
                        )}
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
                backgroundColor: colors.bgElevated, color: colors.textPrimary,
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
