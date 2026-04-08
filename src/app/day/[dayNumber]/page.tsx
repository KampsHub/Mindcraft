"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import PhaseIndicator from "@/components/PhaseIndicator";
import BreathingCircle from "@/components/BreathingCircle";
import WeeklyProgressPanel from "@/components/WeeklyProgressPanel";
import { colors, fonts, space, text, radii } from "@/lib/theme";
import { useDaySession } from "./useDaySession";
import TellTab from "./TellTab";
import DoTab from "./DoTab";
import DoneTab from "./DoneTab";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

export default function DailyFlowPageWrapper() {
  return (
    <Suspense fallback={null}>
      <DailyFlowPage />
    </Suspense>
  );
}

function DailyFlowPage() {
  const s = useDaySession();
  // Day 30 outcome self-report (4.a #3)
  const [outcomeSaved, setOutcomeSaved] = useState<"achieved" | "partially" | "not_achieved" | null>(null);
  const [outcomeSaving, setOutcomeSaving] = useState(false);

  // Analytics: day_started (fires once per mount), day_1_started (once ever per enrollment),
  // day_mid_abandon on unmount if user left without completing.
  const dayStartedFired = useRef(false);
  const wasCompletedAtMount = useRef<boolean | null>(null);
  useEffect(() => {
    if (s.loading || !s.enrollment || !s.programDay || dayStartedFired.current) return;
    dayStartedFired.current = true;
    const program = s.enrollment.programs?.slug ?? "unknown";
    const dayNumber = s.programDay.day_number;
    wasCompletedAtMount.current = Boolean(s.session?.completed_at);

    trackEvent("day_started", { program, day_number: dayNumber });
    if (dayNumber === 1 && !wasCompletedAtMount.current) {
      try {
        const key = `mc-day-1-started-${s.enrollment.id}`;
        if (typeof window !== "undefined" && !localStorage.getItem(key)) {
          localStorage.setItem(key, new Date().toISOString());
          trackEvent("day_1_started", { program });
        }
      } catch { /* no-op */ }
    }
    return () => {
      // day_mid_abandon: mount saw no completion and unmount still sees none → user left mid-flow
      if (!wasCompletedAtMount.current && !s.session?.completed_at) {
        trackEvent("day_mid_abandon", { program, day_number: dayNumber });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.loading, s.enrollment?.id, s.programDay?.day_number]);

  // ── Loading ──
  if (s.loading) {
    return (
      <PageShell>
        <div style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <BreathingCircle size={104} label="Settling into today…" />
        </div>
      </PageShell>
    );
  }

  if (!s.enrollment || !s.programDay) {
    return (
      <PageShell>
        <FadeIn preset="fade" triggerOnMount>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 10px 0",
          }}>
            Day not available
          </h1>
          <p style={{ fontSize: 16, color: colors.textPrimary, lineHeight: 1.6, marginBottom: 24, fontFamily: body }}>
            This day isn&apos;t available yet. Make sure you have an active program enrollment.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => s.router.push("/dashboard")}
            style={{
              padding: "14px 32px", fontSize: 16, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Back to Dashboard
          </motion.button>
        </FadeIn>
      </PageShell>
    );
  }

  const weekNames = s.weekNames;

  return (
    <PageShell>
      {/* Day header */}
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: space[6] }}>
          <div style={{ display: "flex", gap: space[2], marginBottom: 10 }}>
            <span style={{
              display: "inline-block", background: colors.coralWash, color: colors.coral,
              ...text.caption,
              padding: "5px 14px", borderRadius: radii.full,
            }}>
              Week {s.programDay.week_number} — {weekNames[s.programDay.week_number - 1] || ""}
            </span>
            <span style={{
              display: "inline-block", background: colors.bgSurface, color: colors.textPrimary,
              ...text.caption,
              padding: "5px 14px", borderRadius: radii.full,
            }}>
              {s.enrollment.programs?.name}
            </span>
          </div>
          {s.weekPurpose && (
            <p style={{ ...text.secondary, color: colors.textSecondary, margin: "0 0 12px 0" }}>
              {s.weekPurpose}
            </p>
          )}
          <h1 style={{
            ...text.title, color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            Day {s.dayNumber}: {s.programDay.title}
          </h1>
          <p style={{ ...text.body, color: colors.textPrimary, margin: 0 }}>
            {s.programDay.territory}
          </p>
        </div>
      </FadeIn>

      {/* Program progress panel — Day 7 / 14 / 21 / 30 */}
      {(s.dayNumber % 7 === 0 || s.dayNumber === 30) && s.enrollment && (
        <FadeIn preset="fade" delay={0.05} triggerOnMount>
          <WeeklyProgressPanel
            enrollmentId={s.enrollment.id}
            dayNumber={s.dayNumber}
          />
        </FadeIn>
      )}

      {/* Phase indicator */}
      <FadeIn preset="fade" delay={0.1} triggerOnMount>
        <PhaseIndicator
          activePhase={s.activeTab}
          completedPhases={[
            ...(s.completedSteps.includes(2) ? [1] : []),
            ...(s.completedSteps.includes(3) ? [2] : []),
            ...(s.session?.completed_at ? [3] : []),
          ]}
          onPhaseClick={(phase) => s.setActiveTab(phase)}
          disabled={[
            ...(s.journalSaved ? [] : [2]),
            ...(s.summaryResult || s.loadingSummary ? [] : [3]),
          ]}
        />
      </FadeIn>

      <AnimatePresence mode="wait">
        <motion.div
          key={s.activeTab}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ═══════ TAB 1: Tell ═══════ */}
          {s.activeTab === 1 && (
            <TellTab
              dayNumber={s.dayNumber}
              programDay={s.programDay}
              session={s.session}
              completedSteps={s.completedSteps}
              supabase={s.supabase}
              setSession={s.setSession}
              themes={s.themes}
              setThemes={s.setThemes}
              loadingThemes={s.loadingThemes}
              themesError={s.themesError}
              loadThemes={s.loadThemes}
              journalContent={s.journalContent}
              setJournalContent={s.setJournalContent}
              savingJournal={s.savingJournal}
              journalSaved={s.journalSaved}
              journalMode={s.journalMode}
              setJournalMode={s.setJournalMode}
              saveJournal={s.saveJournal}
              yesterdayExercise={s.yesterdayExercise}
              followThrough={s.followThrough}
              setFollowThrough={s.setFollowThrough}
              yesterdaySummaryTakeaways={s.yesterdaySummaryTakeaways}
              freeFlowText={s.freeFlowText}
              setFreeFlowText={s.setFreeFlowText}
              activeTab={s.activeTab}
            />
          )}

          {/* ═══════ TAB 2: Do ═══════ */}
          {s.activeTab === 2 && (
            <DoTab
              dayNumber={s.dayNumber}
              programDay={s.programDay}
              session={s.session}
              enrollment={s.enrollment}
              supabase={s.supabase}
              processing={s.processing}
              processError={s.processError}
              processJournal={s.processJournal}
              stateAnalysis={s.stateAnalysis}
              setStateAnalysis={s.setStateAnalysis}
              step3Mode={s.step3Mode}
              setStep3Mode={s.setStep3Mode}
              coachingQuestions={s.coachingQuestions}
              questionResponses={s.questionResponses}
              setQuestionResponses={s.setQuestionResponses}
              savingResponses={s.savingResponses}
              responsesSaved={s.responsesSaved}
              saveQuestionResponses={s.saveQuestionResponses}
              patternChallenge={s.patternChallenge}
              setPatternChallenge={s.setPatternChallenge}
              reframe={s.reframe}
              setReframe={s.setReframe}
              sequenceSuggestion={s.sequenceSuggestion}
              overflowExercises={s.overflowExercises}
              setOverflowExercises={s.setOverflowExercises}
              setCoachingQuestions={s.setCoachingQuestions}
              frameworkAnalysis={s.frameworkAnalysis}
              loadingFramework={s.loadingFramework}
              completedExercises={s.completedExercises}
              handleExerciseComplete={s.handleExerciseComplete}
              loadingSummary={s.loadingSummary}
              generateSummary={s.generateSummary}
              crisisDetectedStep3={s.crisisDetectedStep3}
              crisisDismissedStep3={s.crisisDismissedStep3}
              setCrisisDismissedStep3={s.setCrisisDismissedStep3}
            />
          )}

          {/* ═══════ TAB 3: Done ═══════ */}
          {s.activeTab === 3 && (
            <DoneTab
              dayNumber={s.dayNumber}
              session={s.session}
              enrollment={s.enrollment}
              supabase={s.supabase}
              summaryResult={s.summaryResult}
              setSummaryResult={s.setSummaryResult}
              loadingSummary={s.loadingSummary}
              dayRating={s.dayRating}
              setDayRating={s.setDayRating}
              dayFeedback={s.dayFeedback}
              setDayFeedback={s.setDayFeedback}
              selectedActions={s.selectedActions}
              setSelectedActions={s.setSelectedActions}
              customAction={s.customAction}
              setCustomAction={s.setCustomAction}
              completeDay={s.completeDay}
              crisisDetectedStep5={s.crisisDetectedStep5}
              crisisDismissedStep5={s.crisisDismissedStep5}
              setCrisisDismissedStep5={s.setCrisisDismissedStep5}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Insights prompt modal */}
      <AnimatePresence>
        {s.showReviewPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                maxWidth: 420, width: "100%", padding: 32, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {s.dayNumber === 30 ? "🎉" : "📋"}
              </div>
              <h2 style={{
                fontFamily: display, fontSize: 22, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 8px 0",
              }}>
                {s.dayNumber === 30 ? "Program Complete!" : `Week ${Math.ceil(s.dayNumber / 7)} Complete`}
              </h2>
              <p style={{
                fontSize: 16, color: colors.textPrimary, margin: "0 0 24px 0",
                fontFamily: body, lineHeight: 1.6,
              }}>
                {s.dayNumber === 30
                  ? "You made it through the full program. Take a moment to review your journey and see how far you've come."
                  : "Take a moment to review your progress, check in on your goals, and see what insights emerged this week."}
              </p>

              {/* Day 30 outcome self-report (4.a #3) */}
              {s.dayNumber === 30 && (
                <div style={{ marginBottom: 20, textAlign: "left" }}>
                  <p style={{
                    fontFamily: display, fontSize: 13, fontWeight: 700,
                    color: colors.textPrimary, margin: "0 0 10px 0",
                    textAlign: "center",
                  }}>
                    Did this program deliver what you originally wanted?
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {([
                      { value: "achieved", label: "Yes — it delivered" },
                      { value: "partially", label: "Partially — in some ways" },
                      { value: "not_achieved", label: "No — it didn't" },
                    ] as const).map((opt) => {
                      const selected = outcomeSaved === opt.value;
                      return (
                        <button
                          key={opt.value}
                          disabled={outcomeSaving || !!outcomeSaved}
                          onClick={async () => {
                            if (!s.enrollment) return;
                            setOutcomeSaving(true);
                            try {
                              await s.supabase
                                .from("program_enrollments")
                                .update({
                                  program_outcome_self_reported: opt.value,
                                  program_outcome_reported_at: new Date().toISOString(),
                                })
                                .eq("id", s.enrollment.id);
                              setOutcomeSaved(opt.value);
                              trackEvent("program_outcome_reported", {
                                outcome: opt.value,
                                program: s.enrollment.programs?.slug ?? "unknown",
                              });
                            } catch {
                              // silent — user can retry
                            } finally {
                              setOutcomeSaving(false);
                            }
                          }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 100,
                            border: `1.5px solid ${selected ? colors.coral : colors.borderDefault}`,
                            backgroundColor: selected ? colors.coralWash : "transparent",
                            color: colors.textPrimary,
                            fontFamily: body,
                            fontSize: 14,
                            cursor: outcomeSaved ? "default" : "pointer",
                            textAlign: "center",
                            transition: "all 0.18s",
                            opacity: outcomeSaved && !selected ? 0.5 : 1,
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(196, 148, 58, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => s.router.push("/weekly-review")}
                  style={{
                    width: "100%", padding: "14px 24px", fontSize: 16, fontWeight: 700,
                    color: colors.bgDeep, backgroundColor: colors.coral,
                    border: "none", borderRadius: 100, cursor: "pointer",
                    fontFamily: display,
                  }}
                >
                  Insights
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => s.router.push("/dashboard")}
                  style={{
                    width: "100%", padding: "12px 24px", fontSize: 14, fontWeight: 600,
                    color: colors.textPrimary, backgroundColor: "transparent",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: 100, cursor: "pointer", fontFamily: display,
                  }}
                >
                  Skip for now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
