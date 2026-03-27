"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import FlagButton from "@/components/FlagButton";
import CrisisBanner from "@/components/CrisisBanner";
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
          <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
            Generating your daily summary...
          </p>
        </div>
      ) : summaryResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: space[6] }}>
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
            <p style={{ ...textPreset.body, color: "#ffffff", margin: `0 0 ${space[6]}px 0` }}>
              {summaryResult.summary}
            </p>

            {summaryResult.today_themes?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: space[6] }}>
                {(summaryResult.today_themes || []).map((t, i) => (
                  <span key={i} style={{
                    ...textPreset.caption,
                    padding: "4px 12px",
                    backgroundColor: "rgba(224, 149, 133, 0.12)", color: colors.coral,
                    borderRadius: radii.full,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {summaryResult.pattern_note && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: colors.bgElevated,
                borderRadius: radii.md,
                borderLeft: `3px solid ${colors.coral}`,
              }}>
                <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                  <span style={{ fontWeight: 700 }}>Pattern forming:</span> {summaryResult.pattern_note}
                </p>
              </div>
            )}
          </motion.div>

          {/* Exercise insights */}
          {summaryResult.exercise_insights?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1 * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: "#ffffff",
                margin: "0 0 12px 0",
              }}>
                Exercise Insights
              </p>
              {(summaryResult.exercise_insights || []).map((ei, i) => (
                <p key={i} style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 10px 0" }}>
                  <span style={{ fontWeight: 600, color: colors.textPrimary }}>{ei.exercise_name}:</span> {ei.insight}
                </p>
              ))}
            </motion.div>
          )}

          {/* Goal progress */}
          {summaryResult.goal_progress?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 2 * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: "#ffffff",
                margin: "0 0 12px 0",
              }}>
                Goal Progress
              </p>
              {(summaryResult.goal_progress || []).map((gp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ ...textPreset.secondary, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                    {gp.goal_text}
                  </p>
                  <p style={{ ...textPreset.body, color: "#ffffff", margin: "3px 0 0 0" }}>
                    {gp.observation}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tomorrow preview */}
          {summaryResult.tomorrow_preview && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 3 * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
            <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 8px 0" }}>
              {summaryResult.tomorrow_preview.territory}
            </p>
            <p style={{ ...textPreset.body, color: "#ffffff", margin: 0, fontStyle: "italic" }}>
              {summaryResult.tomorrow_preview.connection}
            </p>
          </motion.div>
          )}

          {/* Micro-content */}
          {summaryResult.micro_content && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 4 * 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: space[5],
              }}
            >
              <p style={{
                ...textPreset.caption, color: "#ffffff",
                margin: "0 0 10px 0",
              }}>
                Today&apos;s Insight
              </p>
              <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                {summaryResult.micro_content}
              </p>
            </motion.div>
          )}

          {/* Mini-actions */}
          {summaryResult.mini_actions && summaryResult.mini_actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 5 * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
                Pick a Mini-Action for Today
              </p>
              <p style={{ ...textPreset.secondary, color: "#ffffff", margin: `0 0 ${space[6]}px 0` }}>
                Each takes under 5 minutes. Choose one (or more) to carry into the rest of your day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(summaryResult.mini_actions || []).map((action, i) => {
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
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                        backgroundColor: isSelected ? colors.coralWash : colors.bgElevated,
                        textAlign: "left", transition: "all 0.2s",
                      }}
                    >
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                        backgroundColor: isSelected ? colors.coral : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: colors.bgDeep, fontSize: 12, fontWeight: 700,
                      }}>
                        {isSelected ? "\u2713" : ""}
                      </div>
                      <span style={{ ...textPreset.secondary, color: "#ffffff" }}>
                        {action}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Or write your own..."
                  style={{
                    flex: 1, padding: "10px 14px", ...textPreset.secondary,
                    border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                    backgroundColor: colors.bgInput, color: colors.textPrimary,
                    outline: "none",
                  }}
                />
              </div>
              {(selectedActions.size > 0 || customAction.trim()) && (
                <button
                  onClick={async () => {
                    const actions: string[] = [];
                    selectedActions.forEach((i) => {
                      if (summaryResult.mini_actions?.[i]) actions.push(summaryResult.mini_actions[i]);
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
                    marginTop: 12, fontFamily: display, fontSize: 13, fontWeight: 600,
                    padding: "10px 24px", borderRadius: 100,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Commit to {selectedActions.size + (customAction.trim() ? 1 : 0)} action{(selectedActions.size + (customAction.trim() ? 1 : 0)) !== 1 ? "s" : ""}
                </button>
              )}
              {summaryResult.committed_actions && summaryResult.committed_actions.length > 0 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, backgroundColor: colors.bgElevated }}>
                  <p style={{ ...textPreset.caption, color: colors.coral, margin: "0 0 6px 0" }}>
                    Committed
                  </p>
                  {(summaryResult.committed_actions || []).map((a, i) => (
                    <p key={i} style={{ ...textPreset.secondary, color: "#ffffff", margin: "0 0 4px 0" }}>
                      {"\u2713"} {a}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Day rating + feedback */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 6 * 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: space[5],
            }}
          >
            <p style={{
              ...textPreset.caption, color: "#ffffff",
              margin: `0 0 ${space[6]}px 0`,
            }}>
              How did you show up today?
            </p>

            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDayRating(dayRating === star ? null : star)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    border: dayRating && star <= dayRating
                      ? `2px solid ${colors.coral}`
                      : `1px solid ${colors.borderDefault}`,
                    backgroundColor: dayRating && star <= dayRating ? colors.coralWash : colors.bgSurface,
                    color: dayRating && star <= dayRating ? colors.coral : "#ffffff",
                    fontSize: 22,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: display,
                  }}
                >
                  ★
                </motion.button>
              ))}
            </div>

            <textarea
              value={dayFeedback}
              onChange={(e) => setDayFeedback(e.target.value)}
              placeholder="Any feedback on today's session? (optional)"
              style={{
                width: "100%",
                minHeight: 70,
                padding: 14,
                ...textPreset.body,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radii.md,
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                color: colors.textPrimary,
                backgroundColor: colors.bgInput,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
            />
          </motion.div>

          {/* Complete day */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 7 * 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={completeDay}
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
        </div>
      ) : null}
    </FadeIn>
  );
}
