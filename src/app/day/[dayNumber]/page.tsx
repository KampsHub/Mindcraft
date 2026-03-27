"use client";

import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { useDaySession } from "./useDaySession";
import TellTab from "./TellTab";
import DoTab from "./DoTab";
import DoneTab from "./DoneTab";

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

  // ── Loading ──
  if (s.loading) {
    return (
      <PageShell>
        <p style={{ color: "#ffffff", fontFamily: body }}>Loading your session...</p>
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
          <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.6, marginBottom: 24, fontFamily: body }}>
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
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{
              display: "inline-block", background: colors.coralWash, color: colors.coral,
              fontFamily: display, fontWeight: 700, fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              Week {s.programDay.week_number} — {weekNames[s.programDay.week_number - 1] || ""}
            </span>
            <span style={{
              display: "inline-block", background: colors.bgSurface, color: colors.textPrimary,
              fontFamily: display, fontWeight: 700, fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              {s.enrollment.programs?.name}
            </span>
          </div>
          {s.weekPurpose && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 12px 0", fontFamily: body }}>
              {s.weekPurpose}
            </p>
          )}
          <h1 style={{
            fontFamily: display, fontSize: 30, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            Day {s.dayNumber}: {s.programDay.title}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.55, fontFamily: body }}>
            {s.programDay.territory}
          </p>
        </div>
      </FadeIn>

      {/* Tab bar */}
      <FadeIn preset="fade" delay={0.1} triggerOnMount>
        {(() => {
          const TAB_LABELS = [
            { key: 1, label: "Tell" },
            { key: 2, label: "Do" },
            { key: 3, label: "Done" },
          ];
          const tabComplete = (key: number) => {
            if (key === 1) return s.completedSteps.includes(2);
            if (key === 2) return s.completedSteps.includes(3);
            if (key === 3) return !!s.session?.completed_at;
            return false;
          };
          return (
            <div style={{
              display: "flex", gap: 4, padding: 4, borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              marginBottom: 24,
            }}>
              {TAB_LABELS.map((tab) => {
                const isActive = s.activeTab === tab.key;
                const isDisabled = (tab.key === 2 && !s.journalSaved) || (tab.key === 3 && !s.summaryResult && !s.loadingSummary);
                const isComplete = tabComplete(tab.key);
                return (
                  <button
                    key={tab.key}
                    onClick={() => !isDisabled && s.setActiveTab(tab.key)}
                    disabled={isDisabled}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: display,
                      borderRadius: 100,
                      border: "none",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      backgroundColor: isActive ? colors.coral : "transparent",
                      color: isActive ? colors.bgDeep : isDisabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                      transition: "all 0.2s",
                      position: "relative",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </FadeIn>

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
                fontSize: 16, color: "#ffffff", margin: "0 0 24px 0",
                fontFamily: body, lineHeight: 1.6,
              }}>
                {s.dayNumber === 30
                  ? "You made it through the full program. Take a moment to review your journey and see how far you've come."
                  : "Take a moment to review your progress, check in on your goals, and see what insights emerged this week."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(224, 149, 133, 0.4)" }}
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
                    color: "#ffffff", backgroundColor: "transparent",
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
