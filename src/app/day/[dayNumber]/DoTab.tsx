"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import ExerciseCard from "@/components/ExerciseCard";
import FlagButton from "@/components/FlagButton";
import CrisisBanner from "@/components/CrisisBanner";
import ChatCoach from "@/components/ChatCoach";
import ViewModeToggle from "@/components/ViewModeToggle";
import { colors, fonts, space, text as textPreset, radii } from "@/lib/theme";
import { useProgressiveReveal } from "@/hooks/useProgressiveReveal";
import type { createClient } from "@/lib/supabase";
import type {
  ProgramDay,
  DailySession,
  Enrollment,
  StateAnalysis,
  OverflowExercise,
  FrameworkAnalysis,
} from "./useDaySession";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface DoTabProps {
  dayNumber: number;
  programDay: ProgramDay;
  session: DailySession | null;
  enrollment: Enrollment;
  supabase: ReturnType<typeof createClient>;

  // Processing
  processing: boolean;
  processError: string | null;
  processJournal: () => Promise<void>;

  // State analysis
  stateAnalysis: StateAnalysis | null;
  setStateAnalysis: React.Dispatch<React.SetStateAction<StateAnalysis | null>>;

  // View mode
  step3Mode: "form" | "chat";
  setStep3Mode: React.Dispatch<React.SetStateAction<"form" | "chat">>;

  // Coaching questions
  coachingQuestions: string[];
  questionResponses: Record<number, string>;
  setQuestionResponses: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  savingResponses: boolean;
  responsesSaved: boolean;
  saveQuestionResponses: () => Promise<void>;

  // Pattern challenge
  patternChallenge: { pattern: string; challenge: string; counter_move: string } | null;
  setPatternChallenge: React.Dispatch<React.SetStateAction<{ pattern: string; challenge: string; counter_move: string } | null>>;

  // Reframe / sequence
  reframe: { old_thought: string; new_thought: string; source_quote: string } | null;
  setReframe: React.Dispatch<React.SetStateAction<{ old_thought: string; new_thought: string; source_quote: string } | null>>;
  sequenceSuggestion: string | null;

  // Exercises
  overflowExercises: OverflowExercise[];
  setOverflowExercises: React.Dispatch<React.SetStateAction<OverflowExercise[]>>;
  setCoachingQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  frameworkAnalysis: FrameworkAnalysis | null;
  loadingFramework: boolean;
  completedExercises: Set<string>;
  handleExerciseComplete: (
    name: string,
    type: "coaching_plan" | "overflow" | "framework_analysis",
    modality: string | undefined,
    responses: Record<string, string>,
    rating: number | null,
    customFraming?: string,
    frameworkId?: string,
  ) => Promise<void>;

  // Summary
  loadingSummary: boolean;
  generateSummary: () => Promise<void>;

  // Crisis
  crisisDetectedStep3: boolean;
  crisisDismissedStep3: boolean;
  setCrisisDismissedStep3: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DoTab({
  dayNumber,
  programDay,
  session,
  enrollment,
  supabase,
  processing,
  processError,
  processJournal,
  stateAnalysis,
  setStateAnalysis,
  step3Mode,
  setStep3Mode,
  coachingQuestions,
  questionResponses,
  setQuestionResponses,
  savingResponses,
  responsesSaved,
  saveQuestionResponses,
  patternChallenge,
  setPatternChallenge,
  reframe,
  setReframe,
  sequenceSuggestion,
  overflowExercises,
  setOverflowExercises,
  setCoachingQuestions,
  frameworkAnalysis,
  loadingFramework,
  completedExercises,
  handleExerciseComplete,
  loadingSummary,
  generateSummary,
  crisisDetectedStep3,
  crisisDismissedStep3,
  setCrisisDismissedStep3,
}: DoTabProps) {
  // Progressive reveal: sections appear as data becomes available
  const initialRevealed = useMemo(() => {
    const keys: string[] = [];
    if (stateAnalysis) {
      keys.push("reading");
      keys.push("exercises");
    }
    if (completedExercises.size > 0) keys.push("continue");
    return keys;
  }, [stateAnalysis, completedExercises]);

  const { isRevealed, revealNext } = useProgressiveReveal(initialRevealed);

  // Reading auto-reveals when stateAnalysis exists
  useEffect(() => {
    if (stateAnalysis) {
      revealNext("reading");
    }
  }, [stateAnalysis, revealNext]);

  // Exercises reveal 2 seconds after reading appears
  useEffect(() => {
    if (isRevealed("reading") && stateAnalysis) {
      const timer = setTimeout(() => revealNext("exercises"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRevealed, stateAnalysis, revealNext]);

  // Continue CTA reveals when at least one exercise is completed
  useEffect(() => {
    if (completedExercises.size > 0) {
      revealNext("continue");
    }
  }, [completedExercises, revealNext]);

  return (
    <FadeIn preset="fade" triggerOnMount>
    <div>
      {processing ? (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5], textAlign: "center",
        }}>
          {/* Progress bar */}
          <div style={{
            width: "100%", height: 4, borderRadius: 2,
            backgroundColor: colors.bgElevated, marginBottom: space[5],
            overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "85%" }}
              transition={{ duration: 12, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: 2,
                backgroundColor: colors.coral,
              }}
            />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `3px solid ${colors.borderDefault}`,
              borderTopColor: colors.coral,
              margin: "0 auto 18px auto",
            }}
          />
          <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
            Processing your entry and selecting exercises that match what came up and where you are in the program.
          </p>
        </div>
      ) : stateAnalysis ? (
        <div>
          {/* View mode toggle — Read vs Chat */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: space[6] }}>
            <ViewModeToggle mode={step3Mode} onChange={setStep3Mode} />
          </div>

          {step3Mode === "chat" ? (
            <ChatCoach
              initialMessage={
                stateAnalysis?.reading
                  ? `${stateAnalysis.reading}${stateAnalysis.reading.endsWith("?") ? "" : "\n\nWhat feels most true about this to you?"}`
                  : "I've read your journal. What would you like to explore together?"
              }
              onSend={async (message, history) => {
                const conversationContext = history
                  .slice(-6)
                  .map((m) => `${m.role === "user" ? "User" : "Coach Assistant"}: ${m.content}`)
                  .join("\n\n");
                const fullEntry = `## Conversation so far\n${conversationContext}\n\n## Latest message\n${message}`;

                const res = await fetch("/api/reflect", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ entry: fullEntry, stream: false }),
                });
                const data = await res.json();
                const response = data.reflection || data.error || "Let me think about that...";

                if (session) {
                  const chatLog = [
                    ...(history || []).map((m) => ({ role: m.role, content: m.content, ts: m.timestamp })),
                    { role: "user", content: message, ts: new Date() },
                    { role: "coach", content: response, ts: new Date() },
                  ];
                  supabase
                    .from("daily_sessions")
                    .update({ step_3_chat: chatLog })
                    .eq("id", session.id)
                    .then(() => {});
                }

                return response;
              }}
              placeholder="Ask your coach assistant anything..."
              showComplete={true}
              completeLabel="Continue to exercises →"
              onComplete={() => setStep3Mode("form")}
            />
          ) : (
          <>
          {/* Crisis Banner -- shown above analysis when urgency is high */}
          {crisisDetectedStep3 && !crisisDismissedStep3 && enrollment && (
            <CrisisBanner
              onDismiss={() => setCrisisDismissedStep3(true)}
              enrollmentId={enrollment.id}
              dayNumber={dayNumber}
              source="process-journal"
            />
          )}
        <div style={{
          ...(crisisDetectedStep3 && !crisisDismissedStep3
            ? { filter: "blur(3px)", opacity: 0.5, pointerEvents: "none" as const, transition: "filter 0.4s, opacity 0.4s" }
            : { filter: "none", opacity: 1, transition: "filter 0.4s, opacity 0.4s" }),
          display: "flex", flexDirection: "column", gap: space[6],
        }}>

          {/* ── Card 1: Reading ── */}
          {isRevealed("reading") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14, padding: space[5],
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: space[6] }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  backgroundColor: colors.coralWash,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <p style={{
                  ...textPreset.caption, color: colors.coral,
                  margin: 0,
                }}>
                  What I noticed
                </p>
              </div>
              <FlagButton outputType="reflection" dailySessionId={session?.id} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stateAnalysis.reading ? (
                stateAnalysis.reading.split("\n\n").map((para, i) => (
                  <p key={i} style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                    {para}
                  </p>
                ))
              ) : (
                <>
                  {stateAnalysis.emotional_state && (
                    <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                      {stateAnalysis.emotional_state}
                    </p>
                  )}
                  {stateAnalysis.cognitive_patterns && (
                    <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                      {stateAnalysis.cognitive_patterns}
                    </p>
                  )}
                  {stateAnalysis.somatic_signals && (
                    <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                      {stateAnalysis.somatic_signals}
                    </p>
                  )}
                </>
              )}
            </div>
            {stateAnalysis.goal_connections?.length > 0 && (
              <div style={{
                padding: "10px 14px", marginTop: 16,
                backgroundColor: "rgba(224, 149, 133, 0.12)",
                borderRadius: 10,
              }}>
                <p style={{ ...textPreset.secondary, color: colors.coral, margin: 0, fontWeight: 500 }}>
                  <span style={{ fontWeight: 700 }}>Goal connections:</span> {stateAnalysis.goal_connections.join(" • ")}
                </p>
              </div>
            )}
          </motion.div>
          )}

          {/* ── Card 2: Coaching Questions ── */}
          {isRevealed("reading") && coachingQuestions.length > 0 && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14, padding: space[5],
              borderLeft: `3px solid ${colors.coral}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: space[6] }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  backgroundColor: "rgba(224, 149, 133, 0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p style={{ ...textPreset.caption, color: colors.coral, margin: 0 }}>
                  Questions to sit with
                </p>
              </div>
              {coachingQuestions.map((q, i) => (
                <div key={i} style={{ marginBottom: i < coachingQuestions.length - 1 ? 20 : 0 }}>
                  <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 10px 0", fontStyle: "italic" }}>
                    {q}
                  </p>
                  <textarea
                    value={questionResponses[i] || ""}
                    onChange={(e) => setQuestionResponses((prev) => ({ ...prev, [i]: e.target.value }))}
                    placeholder="Your thoughts..."
                    rows={2}
                    disabled={responsesSaved}
                    style={{
                      width: "100%", padding: "12px 16px", ...textPreset.body,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: radii.md,
                      backgroundColor: colors.bgRecessed, color: "#ffffff",
                      resize: "vertical", minHeight: 70, boxSizing: "border-box",
                      outline: "none", opacity: responsesSaved ? 0.6 : 1,
                    }}
                  />
                </div>
              ))}
              {!responsesSaved ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={saveQuestionResponses}
                  disabled={savingResponses || Object.values(questionResponses).every((r) => !r.trim())}
                  style={{
                    marginTop: 16, padding: "10px 24px", fontSize: 14, fontWeight: 600,
                    color: colors.bgDeep, backgroundColor: colors.coral,
                    border: "none", borderRadius: 100, cursor: "pointer",
                    fontFamily: display, letterSpacing: "0.01em",
                    opacity: savingResponses || Object.values(questionResponses).every((r) => !r.trim()) ? 0.5 : 1,
                  }}
                >
                  {savingResponses ? "Saving..." : "Save Responses"}
                </motion.button>
              ) : (
                <p style={{ marginTop: 12, fontSize: 14, color: colors.coral, fontWeight: 600, fontFamily: display }}>
                  ✓ Responses saved
                </p>
              )}
            </div>
          )}

          {/* ── Pattern Challenge ── */}
          {isRevealed("reading") && patternChallenge && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14, padding: space[5],
              borderLeft: `3px solid ${colors.warning}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: space[6] }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  backgroundColor: "rgba(251, 191, 36, 0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <p style={{ ...textPreset.caption, color: colors.warning, margin: 0 }}>
                  Pattern challenge
                </p>
              </div>
              <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 8px 0" }}>
                {patternChallenge.pattern}
              </p>
              <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 4px 0", fontWeight: 600 }}>
                {patternChallenge.challenge}
              </p>
              <p style={{ ...textPreset.body, color: "#ffffff", margin: 0, fontStyle: "italic" }}>
                Counter-move: {patternChallenge.counter_move}
              </p>
            </div>
          )}

          {/* Sequence suggestion */}
          {isRevealed("reading") && sequenceSuggestion && (
            <p style={{ ...textPreset.secondary, color: "#ffffff", margin: `0 0 ${space[6]}px 0`, fontStyle: "italic" }}>
              {sequenceSuggestion}
            </p>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (window.confirm("This will clear your current analysis and regenerate exercises. Continue?")) {
                  setStateAnalysis(null);
                  setOverflowExercises([]);
                  setCoachingQuestions([]);
                  setReframe(null);
                  setPatternChallenge(null);
                  processJournal();
                }
              }}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 600,
                color: "#ffffff", backgroundColor: "transparent",
                border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                cursor: "pointer", fontFamily: display,
              }}
            >
              Reprocess
            </motion.button>
          </div>
        </div>
        </>
        )}

        {/* ── Exercises (merged from Practice tab) ── */}
        {isRevealed("exercises") && stateAnalysis && !processing && step3Mode === "form" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            marginTop: space[6],
            ...(crisisDetectedStep3 && !crisisDismissedStep3
              ? { filter: "blur(3px)", opacity: 0.5, pointerEvents: "none" as const, transition: "filter 0.4s, opacity 0.4s" }
              : { filter: "none", opacity: 1, transition: "filter 0.4s, opacity 0.4s" }),
          }}
        >
        {/* Coaching Plan Exercises (Required) */}
        {programDay.coaching_exercises && programDay.coaching_exercises.length > 0 && (
          <div style={{ marginBottom: space[6] }}>
            <p style={{
              ...textPreset.caption, color: "#ffffff",
              margin: "0 0 12px 0",
            }}>
              {dayNumber <= 3 ? "Today's Exercise" : "From Your Coaching Plan"}
            </p>
            {programDay.coaching_exercises.map((ex, i) => (
              <ExerciseCard
                key={`cp-${i}`}
                name={ex.name}
                type="coaching_plan"
                customFraming={ex.custom_framing}
                instructions={ex.custom_framing}
                whySelected={ex.why_now}
                whyThisWorks={ex.why_this_works}
                estimatedMinutes={ex.duration_min}
                isRequired={true}
                isCompleted={completedExercises.has(ex.name)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(ex.name, "coaching_plan", undefined, responses, rating, ex.custom_framing)
                }
                onPark={() => {
                  // Coaching exercises appear in the dashboard "Parked" tab automatically
                  // when they have no exercise_completion record for a completed day.
                  // No database write needed — the visual park state is handled by ExerciseCard.
                }}
              />
            ))}
          </div>
        )}

        {/* Overflow Exercises (from journal analysis) */}
        {overflowExercises.length > 0 && (
          <div style={{ marginBottom: space[6] }}>
            <p style={{
              ...textPreset.caption, color: "#ffffff",
              margin: "0 0 12px 0",
            }}>
              {dayNumber <= 3 ? "Based on What You Wrote" : "Matched to Your Journal"}
            </p>
            {overflowExercises.map((ex, i) => (
              <ExerciseCard
                key={`of-${i}`}
                name={ex.framework_name}
                type="overflow"
                modality={ex.modality}
                originator={ex.originator}
                sourceWork={ex.source_work}
                customFraming={ex.custom_framing}
                instructions={ex.instruction || ex.custom_framing}
                whySelected={ex.why_now || ex.why_selected}
                whyThisWorks={ex.why_this_works}
                estimatedMinutes={ex.estimated_minutes}
                isCompleted={completedExercises.has(ex.framework_name)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(
                    ex.framework_name, "overflow", ex.modality,
                    responses, rating, ex.custom_framing, ex.framework_id
                  )
                }
                onPark={() => {
                  // Overflow exercises are ephemeral (generated per-session), so parking
                  // is purely visual — collapses the card and shows "Parked" indicator.
                  // The user can revisit coaching-plan exercises from the dashboard Parked tab.
                }}
              />
            ))}
          </div>
        )}

        {/* Framework Analysis */}
        {loadingFramework ? (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: space[5], textAlign: "center",
          }}>
            <p style={{ ...textPreset.secondary, color: "#ffffff" }}>Loading framework analysis...</p>
          </div>
        ) : frameworkAnalysis ? (
          <div style={{ marginBottom: space[6] }}>
            <p style={{
              ...textPreset.caption, color: "#ffffff",
              margin: "0 0 12px 0",
            }}>
              Framework Analysis
            </p>
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: space[5],
              borderLeft: `3px solid ${colors.coral}`,
            }}>
              <h3 style={{
                ...textPreset.heading, color: colors.textPrimary, margin: "0 0 4px 0",
              }}>
                {frameworkAnalysis.framework_name}
              </h3>
              <p style={{ ...textPreset.secondary, color: "#ffffff", margin: "0 0 16px 0" }}>
                {frameworkAnalysis.originator} — {frameworkAnalysis.source_work}
              </p>

              <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 16px 0" }}>
                {frameworkAnalysis.explanation}
              </p>

              <div style={{
                padding: "14px 18px",
                backgroundColor: colors.bgElevated,
                borderRadius: radii.md,
                marginBottom: 16,
              }}>
                <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                  {frameworkAnalysis.application}
                </p>
              </div>

              <p style={{
                ...textPreset.secondary, color: colors.coral, fontWeight: 600,
                fontStyle: "italic", margin: "0 0 16px 0",
              }}>
                {frameworkAnalysis.reflection_prompt}
              </p>

              <ExerciseCard
                name={`Reflect: ${frameworkAnalysis.framework_name}`}
                type="framework_analysis"
                instructions="Write what comes up as you sit with this framework and the reflection question above."
                isCompleted={completedExercises.has(`Reflect: ${frameworkAnalysis.framework_name}`)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(
                    `Reflect: ${frameworkAnalysis.framework_name}`,
                    "framework_analysis", undefined,
                    responses, rating, undefined, frameworkAnalysis.framework_id
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {/* Continue to Summary */}
        {isRevealed("continue") && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              whileHover={!loadingSummary ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}}
              whileTap={!loadingSummary ? { scale: 0.97 } : {}}
              onClick={generateSummary}
              disabled={loadingSummary}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: loadingSummary ? "#ffffff" : colors.bgDeep,
                backgroundColor: loadingSummary ? colors.bgElevated : colors.coral,
                border: "none", borderRadius: 100,
                cursor: loadingSummary ? "not-allowed" : "pointer",
                fontFamily: display, letterSpacing: "0.01em",
                marginTop: 6,
              }}
            >
              {loadingSummary ? "Generating summary..." : "Complete Exercises & Continue"}
            </motion.button>
          </motion.div>
        )}
        </motion.div>
        )}
        </div>
      ) : (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5], textAlign: "center",
        }}>
          <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 18px 0" }}>
            Your journal is ready to be processed. Your coaching assistant will read what you wrote and select exercises matched to what surfaced.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={processJournal}
            style={{
              padding: "12px 28px", fontSize: 14, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Process My Journal
          </motion.button>
          {processError && (
            <p style={{ ...textPreset.secondary, color: "#f87171", margin: "14px 0 0 0" }}>
              {processError}
            </p>
          )}
        </div>
      )}
    </div>
    </FadeIn>
  );
}
