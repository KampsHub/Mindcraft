"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import FlagButton from "@/components/FlagButton";
import CrisisBanner from "@/components/CrisisBanner";
import { colors, fonts } from "@/lib/theme";
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
          padding: 28, textAlign: "center",
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
          <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
            Generating your daily summary...
          </p>
        </div>
      ) : summaryResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22,
          }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
              <FlagButton outputType="summary" dailySessionId={session?.id} />
            </div>
            <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.7, margin: "0 0 14px 0", fontFamily: body }}>
              {summaryResult.summary}
            </p>

            {summaryResult.today_themes?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {(summaryResult.today_themes || []).map((t, i) => (
                  <span key={i} style={{
                    padding: "4px 12px", fontSize: 12, fontWeight: 600,
                    backgroundColor: "rgba(224, 149, 133, 0.12)", color: colors.coral,
                    borderRadius: 100, fontFamily: display,
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
                borderRadius: 12,
                borderLeft: `3px solid ${colors.coral}`,
              }}>
                <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.55, fontFamily: body }}>
                  <span style={{ fontWeight: 700 }}>Pattern forming:</span> {summaryResult.pattern_note}
                </p>
              </div>
            )}
          </div>

          {/* Exercise insights */}
          {summaryResult.exercise_insights?.length > 0 && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                margin: "0 0 12px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Exercise Insights
              </p>
              {(summaryResult.exercise_insights || []).map((ei, i) => (
                <p key={i} style={{ fontSize: 16, color: "#ffffff", margin: "0 0 10px 0", lineHeight: 1.55, fontFamily: body }}>
                  <span style={{ fontWeight: 600, color: colors.textPrimary }}>{ei.exercise_name}:</span> {ei.insight}
                </p>
              ))}
            </div>
          )}

          {/* Goal progress */}
          {summaryResult.goal_progress?.length > 0 && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                margin: "0 0 12px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Goal Progress
              </p>
              {(summaryResult.goal_progress || []).map((gp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0, fontFamily: body }}>
                    {gp.goal_text}
                  </p>
                  <p style={{ fontSize: 16, color: "#ffffff", margin: "3px 0 0 0", fontFamily: body, lineHeight: 1.5 }}>
                    {gp.observation}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tomorrow preview */}
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22,
            background: `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.bgSurface} 100%)`,
            borderColor: "rgba(123,82,120,0.25)",
          }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: colors.coral,
              margin: "0 0 8px 0", textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: display,
            }}>
              Tomorrow
            </p>
            <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: "0 0 4px 0", fontFamily: display, letterSpacing: "-0.02em" }}>
              Day {dayNumber + 1}: {summaryResult.tomorrow_preview.title}
            </p>
            <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 8px 0", fontFamily: body }}>
              {summaryResult.tomorrow_preview.territory}
            </p>
            <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontStyle: "italic", fontFamily: body, lineHeight: 1.55 }}>
              {summaryResult.tomorrow_preview.connection}
            </p>
          </div>

          {/* Micro-content */}
          {summaryResult.micro_content && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                margin: "0 0 10px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Today&apos;s Insight
              </p>
              <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.65, fontFamily: body }}>
                {summaryResult.micro_content}
              </p>
            </div>
          )}

          {/* Mini-actions */}
          {summaryResult.mini_actions && summaryResult.mini_actions.length > 0 && (
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: colors.coral,
                margin: "0 0 6px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Pick a Mini-Action for Today
              </p>
              <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 14px 0", fontFamily: body, lineHeight: 1.5 }}>
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
                      <span style={{ fontSize: 14, color: "#ffffff", fontFamily: body, lineHeight: 1.45 }}>
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
                    flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: body,
                    border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
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
                  <p style={{ fontSize: 12, fontWeight: 600, color: colors.coral, margin: "0 0 6px 0", fontFamily: display }}>
                    Committed
                  </p>
                  {(summaryResult.committed_actions || []).map((a, i) => (
                    <p key={i} style={{ fontSize: 14, color: "#ffffff", margin: "0 0 4px 0", fontFamily: body }}>
                      {"\u2713"} {a}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Day rating + feedback */}
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22,
          }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: "#ffffff",
              margin: "0 0 14px 0", textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: display,
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
                fontSize: 14,
                lineHeight: 1.55,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: 14,
                resize: "none",
                outline: "none",
                fontFamily: body,
                boxSizing: "border-box",
                color: colors.textPrimary,
                backgroundColor: colors.bgInput,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
            />
          </div>

          {/* Complete day */}
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
        </div>
      ) : null}
    </FadeIn>
  );
}
