"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import StaggerContainer, { staggerChildVariants } from "@/components/StaggerContainer";
import FlagButton from "@/components/FlagButton";
import CrisisBanner from "@/components/CrisisBanner";
import { fireDayCompleteConfetti } from "@/lib/confetti";
import { trackEvent } from "@/components/GoogleAnalytics";
import { colors, fonts, space, text as textPreset, radii } from "@/lib/theme";
import type { createClient } from "@/lib/supabase";
import type {
  DailySession,
  Enrollment,
  SummaryResult,
} from "./useDaySession";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface DoneTabProps {
  dayNumber: number;
  session: DailySession | null;
  enrollment: Enrollment;
  supabase: ReturnType<typeof createClient>;

  // Summary
  summaryResult: SummaryResult | null;
  setSummaryResult: React.Dispatch<React.SetStateAction<SummaryResult | null>>;
  loadingSummary: boolean;

  // Day rating
  dayRating: number | null;
  setDayRating: React.Dispatch<React.SetStateAction<number | null>>;
  dayFeedback: string;
  setDayFeedback: React.Dispatch<React.SetStateAction<string>>;

  // Mini-actions
  selectedActions: Set<number>;
  setSelectedActions: React.Dispatch<React.SetStateAction<Set<number>>>;
  customAction: string;
  setCustomAction: React.Dispatch<React.SetStateAction<string>>;

  // Complete
  completeDay: () => Promise<void>;

  // Crisis
  crisisDetectedStep5: boolean;
  crisisDismissedStep5: boolean;
  setCrisisDismissedStep5: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DoneTab({
  dayNumber,
  session,
  enrollment,
  supabase,
  summaryResult,
  setSummaryResult,
  loadingSummary,
  dayRating,
  setDayRating,
  dayFeedback,
  setDayFeedback,
  selectedActions,
  setSelectedActions,
  customAction,
  setCustomAction,
  completeDay,
  crisisDetectedStep5,
  crisisDismissedStep5,
  setCrisisDismissedStep5,
}: DoneTabProps) {
  return (
    <FadeIn preset="fade" triggerOnMount>
      {loadingSummary ? (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5], textAlign: "center",
        }}>
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
          <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
            Generating your daily summary...
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 30, duration: 0.5 }}
            style={{ ...textPreset.secondary, color: colors.textSecondary, margin: "12px 0 0 0" }}
          >
            This is taking longer than usual. Still working — please wait or try refreshing.
          </motion.p>
        </div>
      ) : summaryResult ? (
        <StaggerContainer staggerInterval={0.15} style={{ display: "flex", flexDirection: "column", gap: space[6] }}>
          {/* Crisis Banner -- shown above summary when crisis detected */}
          {crisisDetectedStep5 && !crisisDismissedStep5 && enrollment && (
            <CrisisBanner
              onDismiss={() => setCrisisDismissedStep5(true)}
              enrollmentId={enrollment.id}
              dayNumber={dayNumber}
              source="daily-summary"
            />
          )}
          {/* Summary */}
          <motion.div
            variants={staggerChildVariants}
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: space[5],
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
              <FlagButton outputType="summary" dailySessionId={session?.id} />
            </div>
            <p style={{ ...textPreset.body, color: colors.textPrimary, margin: `0 0 ${space[6]}px 0` }}>
              {summaryResult.summary}
            </p>

            {summaryResult.pattern_note && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: colors.bgElevated,
                borderRadius: radii.md,
                borderLeft: `3px solid ${colors.coral}`,
              }}>
                <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
                  <span style={{ fontWeight: 700 }}>Pattern forming:</span> {summaryResult.pattern_note}
                </p>
              </div>
            )}
          </motion.div>

          {/* Exercise insights */}
          {summaryResult.exercise_insights?.length > 0 && (
            <motion.div
              variants={staggerChildVariants}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: colors.textPrimary,
                margin: "0 0 12px 0",
              }}>
                Exercise Insights
              </p>
              {(summaryResult.exercise_insights || []).map((ei, i) => (
                <p key={i} style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 10px 0" }}>
                  <span style={{ fontWeight: 600, color: colors.textPrimary }}>{ei.exercise_name}:</span> {ei.insight}
                </p>
              ))}
            </motion.div>
          )}

          {/* Goal progress */}
          {summaryResult.goal_progress?.length > 0 && (
            <motion.div
              variants={staggerChildVariants}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: colors.textPrimary,
                margin: "0 0 12px 0",
              }}>
                Goal Progress
              </p>
              {(summaryResult.goal_progress || []).map((gp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ ...textPreset.secondary, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                    {gp.goal_text}
                  </p>
                  <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "3px 0 0 0" }}>
                    {gp.observation}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tomorrow preview */}
          {summaryResult.tomorrow_preview && (
          <motion.div
            variants={staggerChildVariants}
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: space[5],
              background: `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.bgSurface} 100%)`,
              borderColor: "rgba(123,82,120,0.25)",
            }}
          >
            <p style={{
              ...textPreset.caption, color: colors.coral,
              margin: "0 0 8px 0",
            }}>
              Tomorrow
            </p>
            <p style={{ ...textPreset.heading, color: colors.textPrimary, margin: "0 0 4px 0" }}>
              Day {dayNumber + 1}: {summaryResult.tomorrow_preview.title}
            </p>
            <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 8px 0" }}>
              {summaryResult.tomorrow_preview.territory}
            </p>
            <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0, fontStyle: "italic" }}>
              {summaryResult.tomorrow_preview.connection}
            </p>
          </motion.div>
          )}

          {/* Questions to sit with */}
          {summaryResult.questions_to_sit_with && summaryResult.questions_to_sit_with.length > 0 && (
            <motion.div
              variants={staggerChildVariants}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: colors.plumLight,
                margin: "0 0 4px 0",
              }}>
                Questions to sit with
              </p>
              <p style={{ ...textPreset.secondary, color: colors.textSecondary, margin: "0 0 14px 0" }}>
                Take a moment with these before moving on.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: space[3] }}>
                {summaryResult.questions_to_sit_with.map((q, i) => (
                  <p key={i} style={{
                    ...textPreset.body, color: colors.textPrimary, margin: 0,
                    fontStyle: "italic",
                  }}>
                    {q}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Challenges — pick one or more */}
          {((summaryResult.challenges && summaryResult.challenges.length > 0) || (summaryResult.mini_actions && summaryResult.mini_actions.length > 0)) && (
            <motion.div
              variants={staggerChildVariants}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: colors.coral,
                margin: "0 0 6px 0",
              }}>
                Until tomorrow
              </p>
              <p style={{ ...textPreset.secondary, color: colors.textSecondary, margin: `0 0 ${space[4]}px 0` }}>
                Pick one (or more) to carry into the rest of your day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(summaryResult.challenges || summaryResult.mini_actions || []).map((action, i) => {
                  const isSelected = selectedActions.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedActions((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          return next;
                        });
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: space[3],
                        padding: `${space[3]}px ${space[4]}px`, borderRadius: radii.sm, cursor: "pointer",
                        border: `1px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                        backgroundColor: isSelected ? colors.coralWash : colors.bgElevated,
                        textAlign: "left", transition: "all 0.2s",
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: radii.full, flexShrink: 0,
                        border: `2px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                        backgroundColor: isSelected ? colors.coral : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: colors.bgDeep, fontSize: 11, fontWeight: 700,
                      }}>
                        {isSelected ? "\u2713" : ""}
                      </div>
                      <span style={{ ...textPreset.secondary, color: colors.textPrimary }}>
                        {action}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: space[3], display: "flex", gap: space[2] }}>
                <input
                  type="text"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Or add your own..."
                  style={{
                    flex: 1, padding: `${space[3]}px ${space[3]}px`, ...textPreset.secondary,
                    border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                    backgroundColor: colors.bgInput, color: colors.textPrimary,
                    outline: "none",
                  }}
                />
              </div>
              {(selectedActions.size > 0 || customAction.trim()) && (
                <button
                  onClick={async () => {
                    const allActions = summaryResult.challenges || summaryResult.mini_actions || [];
                    const actions: string[] = [];
                    selectedActions.forEach((i) => {
                      if (allActions[i]) actions.push(allActions[i]);
                    });
                    if (customAction.trim()) actions.push(customAction.trim());
                    if (session?.id) {
                      const updatedSummary = { ...summaryResult, committed_actions: actions };
                      await supabase
                        .from("daily_sessions")
                        .update({ step_5_summary: updatedSummary })
                        .eq("id", session.id);
                      setSummaryResult(updatedSummary);
                    }
                  }}
                  style={{
                    marginTop: space[3], ...textPreset.secondary, fontWeight: 600,
                    padding: `${space[3]}px ${space[5]}px`, borderRadius: radii.full,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Commit to {selectedActions.size + (customAction.trim() ? 1 : 0)} action{(selectedActions.size + (customAction.trim() ? 1 : 0)) !== 1 ? "s" : ""}
                </button>
              )}
              {summaryResult.committed_actions && summaryResult.committed_actions.length > 0 && (
                <div style={{ marginTop: space[3], padding: `${space[3]}px ${space[3]}px`, borderRadius: radii.sm, backgroundColor: colors.bgElevated }}>
                  <p style={{ ...textPreset.caption, color: colors.coral, margin: "0 0 6px 0" }}>
                    Committed
                  </p>
                  {summaryResult.committed_actions.map((a, i) => (
                    <p key={i} style={{ ...textPreset.secondary, color: colors.textPrimary, margin: "0 0 4px 0" }}>
                      {"\u2713"} {a}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Complete day */}
          <motion.div variants={staggerChildVariants}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                fireDayCompleteConfetti();
                trackEvent("day_completed", { day_number: dayNumber, program: "parachute" });
                await completeDay();
              }}
              style={{
                width: "100%",
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 700,
                color: colors.bgDeep,
                backgroundColor: colors.coral,
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: display,
                letterSpacing: "-0.01em",
              }}
            >
              Complete Day {dayNumber}
            </motion.button>
          </motion.div>
        </StaggerContainer>
      ) : null}
    </FadeIn>
  );
}
