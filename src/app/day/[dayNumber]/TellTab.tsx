"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { trackEvent } from "@/components/GoogleAnalytics";
import FlagButton from "@/components/FlagButton";
// VoiceToText / GuidedExerciseFlow imports removed — no audio surfaces in day flow.
import { colors, fonts, space, text as textPreset, radii } from "@/lib/theme";
import { useProgressiveReveal } from "@/hooks/useProgressiveReveal";
import type { createClient } from "@/lib/supabase";
import type {
  ProgramDay,
  DailySession,
  ThemesResult,
} from "./useDaySession";

const display = fonts.display;
const body = fonts.bodyAlt;

// ── ThemesAutoLoader (local to TellTab) ──

function ThemesAutoLoader({ loading, error, isActive, onLoad, onSkip }: {
  loading: boolean; error: string | null; isActive: boolean;
  onLoad: () => void; onSkip: () => void;
}) {
  useEffect(() => {
    if (isActive && !loading && !error) {
      onLoad();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div style={{
      backgroundColor: colors.bgSurface, borderRadius: 14,
      border: `1px solid ${colors.borderDefault}`, padding: space[5],
    }}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            style={{
              width: 20, height: 20, borderRadius: "50%",
              border: `2px solid ${colors.borderDefault}`, borderTopColor: colors.coral,
            }}
          />
          <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
            Loading yesterday&apos;s themes...
          </p>
        </div>
      ) : error ? (
        <div>
          <p style={{ ...textPreset.secondary, color: colors.error, margin: "0 0 12px 0" }}>
            {error}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLoad}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 600,
                color: colors.bgDeep, backgroundColor: colors.coral,
                border: "none", borderRadius: 100, cursor: "pointer",
                fontFamily: display,
              }}
            >
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSkip}
              style={{
                padding: "10px 20px", fontSize: 14, fontWeight: 600,
                color: colors.textPrimary, backgroundColor: "transparent",
                border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                cursor: "pointer", fontFamily: display,
              }}
            >
              Skip to journal →
            </motion.button>
          </div>
        </div>
      ) : (
        <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
          Loading...
        </p>
      )}
    </div>
  );
}

// ── Props ──

export interface TellTabProps {
  dayNumber: number;
  programDay: ProgramDay;
  session: DailySession | null;
  completedSteps: number[];
  supabase: ReturnType<typeof createClient>;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;

  // Themes
  themes: ThemesResult | null;
  setThemes: React.Dispatch<React.SetStateAction<ThemesResult | null>>;
  loadingThemes: boolean;
  themesError: string | null;
  loadThemes: () => Promise<void>;

  // Journal
  journalContent: string;
  setJournalContent: React.Dispatch<React.SetStateAction<string>>;
  savingJournal: boolean;
  journalSaved: boolean;
  journalMode: "type" | "voice";
  setJournalMode: React.Dispatch<React.SetStateAction<"type" | "voice">>;
  saveJournal: () => Promise<void>;

  // Exercise follow-through
  yesterdayExercise: { name: string; id: string; whyNow: string; instruction: string; userResponse: string } | null;
  followThrough: string;
  setFollowThrough: React.Dispatch<React.SetStateAction<string>>;

  // Yesterday's summary takeaways
  yesterdaySummaryTakeaways: {
    questions_to_sit_with: string[];
    challenges: string[];
    committed_actions: string[];
  } | null;

  // Free flow
  freeFlowText: string;
  setFreeFlowText: React.Dispatch<React.SetStateAction<string>>;

  // Active tab (for ThemesAutoLoader)
  activeTab: number;
}

export default function TellTab({
  dayNumber,
  programDay,
  session,
  completedSteps,
  supabase,
  setSession,
  themes,
  setThemes,
  loadingThemes,
  themesError,
  loadThemes,
  journalContent,
  setJournalContent,
  savingJournal,
  journalSaved,
  journalMode,
  setJournalMode,
  saveJournal,
  yesterdayExercise,
  followThrough,
  setFollowThrough,
  yesterdaySummaryTakeaways,
  freeFlowText,
  setFreeFlowText,
  activeTab,
}: TellTabProps) {
  // Analytics: fire journal_entry_started on first keystroke (once per day)
  const journalStartedFired = useRef(false);
  useEffect(() => {
    if (!journalStartedFired.current && journalContent.trim().length > 0 && !journalSaved) {
      journalStartedFired.current = true;
      trackEvent("journal_entry_started", { day_number: dayNumber });
    }
  }, [journalContent, journalSaved, dayNumber]);

  // Wrap saveJournal to fire journal_entry_saved + journal_entry_short (quality signal)
  const handleSaveJournalTracked = async () => {
    const wordCount = journalContent.trim().split(/\s+/).filter(Boolean).length;
    trackEvent("journal_entry_saved", { day_number: dayNumber, word_count: wordCount });
    if (wordCount > 0 && wordCount < 30) {
      trackEvent("journal_entry_short", { day_number: dayNumber, word_count: wordCount });
    }
    await saveJournal();
    // journal_processed fires once the parent's processJournal flow finishes.
    // We surface it from here by watching the session.step_3_analysis side-effect below.
  };

  // Fire journal_processed when the analysis payload populates (indicates API returned).
  const journalProcessedFired = useRef(false);
  useEffect(() => {
    const analysis = session?.step_3_analysis;
    if (!journalProcessedFired.current && analysis && Object.keys(analysis).length > 0) {
      journalProcessedFired.current = true;
      trackEvent("journal_processed", { day_number: dayNumber });
    }
  }, [session?.step_3_analysis, dayNumber]);

  // showThoughtConversation removed — no walk-through/audio modal.
  const [expandedPrompts, setExpandedPrompts] = useState<Array<{ prompt: string; expanded?: string; purpose: string; context?: string }>>(
    programDay?.seed_prompts || []
  );

  // Expand terse seed prompts on first load (cache-once via Haiku)
  useEffect(() => {
    if (!programDay?.seed_prompts?.length) return;
    const prompts = programDay.seed_prompts as Array<{ prompt: string; expanded?: string; purpose: string; context?: string }>;
    setExpandedPrompts(prompts);

    // If any prompt lacks an expanded field, trigger expansion
    const needsExpansion = prompts.some((sp) => !sp.expanded);
    if (!needsExpansion) return;

    fetch("/api/expand-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        programDayId: programDay.id,
        seedPrompts: prompts,
        territory: programDay.territory,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.expanded) setExpandedPrompts(data.expanded);
      })
      .catch((err) => console.warn("Prompt expansion failed:", err));
  }, [programDay]);
  // followThrough voice recording state removed — text-only input.

  // Progressive reveal: auto-reveal based on existing data
  const initialRevealed = useMemo(() => {
    const keys: string[] = [];
    if (themes) keys.push("themes");
    if (yesterdayExercise || yesterdaySummaryTakeaways) keys.push("followthrough");
    // Journal is always revealed as the core action
    keys.push("journal");
    return keys;
  }, [themes, yesterdayExercise, yesterdaySummaryTakeaways]);

  const { isRevealed, revealNext } = useProgressiveReveal(initialRevealed);

  // When themes finish loading, reveal follow-through
  useEffect(() => {
    if (themes) {
      revealNext("themes");
      revealNext("followthrough");
    }
  }, [themes, revealNext]);

  // When follow-through is answered or skipped, reveal journal
  useEffect(() => {
    if ((!yesterdayExercise && !yesterdaySummaryTakeaways) || followThrough.trim().length > 0) {
      revealNext("journal");
    }
  }, [yesterdayExercise, yesterdaySummaryTakeaways, followThrough, revealNext]);

  return (
    <FadeIn preset="fade" triggerOnMount>
    <div style={{ display: "flex", flexDirection: "column", gap: space[6] }}>

    {/* Yesterday's Themes / Welcome context */}
    <div>
      {dayNumber === 1 ? (
        completedSteps.includes(1) ? (
          <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
            Day 1 — no prior themes.
          </p>
        ) : (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5],
        }}>
          <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 18px 0" }}>
            Welcome to Day 1 of your program. There are no themes to review yet — today is where it begins.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setThemes({ themes: [], summary: "Day 1 — no prior themes.", patterns: [], carry_forward: "" });
              if (session) {
                supabase.from("daily_sessions")
                  .update({ completed_steps: [...(session.completed_steps || []), 1] })
                  .eq("id", session.id)
                  .then(() => {
                    setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
                  });
              }
            }}
            style={{
              padding: "12px 28px", fontSize: 14, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Begin Day 1
          </motion.button>
        </div>
        )
      ) : !themes ? (
        <ThemesAutoLoader
          loading={loadingThemes}
          error={themesError}
          isActive={activeTab === 1}
          onLoad={loadThemes}
          onSkip={() => {
            setThemes({ themes: [], summary: "Skipped — no themes loaded.", patterns: [], carry_forward: "" });
            if (session) {
              supabase.from("daily_sessions")
                .update({ completed_steps: [...(session.completed_steps || []), 1] })
                .eq("id", session.id)
                .then(() => {
                  setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
                });
            }
          }}
        />
      ) : (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5],
        }}>
          {/* Thread — primary content (narrative prose) */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
            <FlagButton outputType="themes" dailySessionId={session?.id} />
          </div>
          {themes.thread ? (
            <div style={{ marginBottom: 18 }}>
              {themes.thread.split("\n\n").map((para, i) => (
                <p key={i} style={{
                  ...textPreset.body, color: colors.textPrimary,
                  margin: i === 0 ? "0 0 12px 0" : "12px 0",
                }}>
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 14px 0" }}>
              {themes.summary}
            </p>
          )}

          {/* Yesterday's committed mini-actions follow-up */}
          {themes.yesterday_committed_actions && themes.yesterday_committed_actions.length > 0 && (
            <div style={{
              padding: "16px 18px",
              backgroundColor: "rgba(196, 148, 58, 0.06)",
              borderRadius: radii.md,
              borderLeft: `3px solid ${colors.coral}`,
              marginBottom: space[6],
            }}>
              <p style={{ ...textPreset.caption, color: colors.coral, margin: "0 0 10px 0" }}>
                Yesterday&apos;s mini-actions
              </p>
              <p style={{ ...textPreset.secondary, color: colors.textPrimary, margin: "0 0 10px 0" }}>
                You committed to these. How did they go?
              </p>
              {(themes.yesterday_committed_actions || []).map((action, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ ...textPreset.secondary, fontWeight: 600, color: colors.textPrimary, margin: "0 0 4px 0" }}>
                    {action}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Theme tags — removed from display (data kept for AI) */}

          {/* Patterns (collapsed below themes) */}
          {themes.patterns?.length > 0 && (
            <div style={{ marginBottom: space[6] }}>
              {(themes.patterns || []).map((p, i) => (
                <div key={i} style={{
                  padding: "12px 16px",
                  backgroundColor: colors.bgElevated,
                  borderRadius: radii.md,
                  borderLeft: `3px solid ${colors.coral}`,
                  marginBottom: 8,
                }}>
                  <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
                    {p.observation}
                  </p>
                  <p style={{ ...textPreset.secondary, color: colors.textPrimary, margin: "4px 0 0 0" }}>
                    Seen across {p.days_observed} days • {p.connection}
                  </p>
                </div>
              ))}
            </div>
          )}

          {themes.carry_forward && (
            <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
              {themes.carry_forward}
            </p>
          )}
        </div>
      )}
    </div>

    {/* ─────── YESTERDAY BOX ───────
        Restructured per testing feedback:
        - One box with yesterday's pattern/exercise + mini-action checkboxes
        - Removed: "questions to sit with", "challenges", "what came up", takeaways labels
    */}
    {isRevealed("followthrough") && (yesterdayExercise || yesterdaySummaryTakeaways) && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          padding: "20px 22px",
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          marginBottom: space[6],
        }}
      >
        <p style={{
          ...textPreset.caption, color: colors.coral,
          margin: "0 0 10px 0",
        }}>
          Yesterday
        </p>

        {/* Pattern: the exercise / framework they worked with */}
        {yesterdayExercise && (
          <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 14px 0" }}>
            <strong>{yesterdayExercise.name}</strong>
          </p>
        )}

        {/* Mini-action checklist — "did you actually do this?" */}
        {yesterdaySummaryTakeaways && yesterdaySummaryTakeaways.committed_actions.length > 0 && (() => {
          // Persist mini-action completion as JSON in followThrough.
          let parsed: Record<string, boolean> = {};
          try { parsed = JSON.parse(followThrough || "{}"); } catch { /* keep empty */ }
          const toggle = (idx: number) => {
            const next = { ...parsed, [idx]: !parsed[idx] };
            setFollowThrough(JSON.stringify(next));
          };
          return (
            <div>
              <p style={{ ...textPreset.secondary, color: colors.textPrimary, margin: "0 0 8px 0" }}>
                You committed to these. Did they happen?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {yesterdaySummaryTakeaways.committed_actions.map((action, i) => {
                  const done = !!parsed[i];
                  return (
                    <button
                      key={i}
                      onClick={() => toggle(i)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        textAlign: "left", cursor: "pointer",
                        padding: "10px 12px",
                        borderRadius: radii.md,
                        border: `1px solid ${done ? colors.coral : colors.borderDefault}`,
                        backgroundColor: done ? "rgba(196, 148, 58, 0.08)" : "transparent",
                        transition: "all 0.18s",
                      }}
                    >
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: 6,
                        border: `1.5px solid ${done ? colors.coral : colors.borderDefault}`,
                        backgroundColor: done ? colors.coral : "transparent",
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        {done && (
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span style={{
                        ...textPreset.body, color: colors.textPrimary,
                        textDecoration: done ? "line-through" : "none",
                        opacity: done ? 0.75 : 1,
                      }}>
                        {action}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </motion.div>
    )}

    {/* ── Journal Section (within Tab 1) ── */}
    {isRevealed("journal") && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5],
        }}
      >
        {/* Thought inspiration — compact prompts */}
        {programDay.seed_prompts && programDay.seed_prompts.length > 0 && (
          <div style={{ marginBottom: space[6] }}>
            <p style={{
              ...textPreset.caption, color: colors.textSecondary,
              margin: "0 0 8px 0",
            }}>
              Thought Inspiration
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: space[3] }}>
              {expandedPrompts.map((sp, i) => (
                <div key={i} style={{
                  padding: `${space[3]}px ${space[4]}px`,
                  backgroundColor: colors.bgElevated,
                  borderRadius: radii.md,
                }}>
                  <p style={{ ...textPreset.body, color: colors.textPrimary, margin: 0 }}>
                    {sp.expanded || sp.prompt}
                  </p>
                </div>
              ))}
            </div>
            {/* "Walk through these in writing" button removed per testing feedback —
                no audio/voice/walk-through CTA. Users journal directly below. */}
          </div>
        )}

        {/* Free flow — quick thoughts before journaling */}
        <div style={{ marginBottom: space[6] }}>
          <p style={{ ...textPreset.caption, color: colors.plumLight, margin: "0 0 8px 0" }}>
            Anything else on your mind?
          </p>
          <p style={{ ...textPreset.secondary, color: colors.textSecondary, margin: "0 0 12px 0" }}>
            A sentence or two — whatever came up from the questions above.
          </p>
          <textarea
            value={freeFlowText}
            onChange={(e) => setFreeFlowText(e.target.value)}
            placeholder="What's on your mind..."
            rows={3}
            style={{
              width: "100%", padding: "14px 16px",
              ...textPreset.body,
              backgroundColor: colors.bgInput,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radii.md,
              color: colors.textPrimary, resize: "none", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Journal input — text only (audio/voice input removed per testing feedback) */}
        <textarea
          value={journalContent}
          onChange={(e) => setJournalContent(e.target.value)}
          disabled={journalSaved}
          placeholder="Write freely. What's coming up? What are you noticing?"
          style={{
            width: "100%",
            minHeight: 180,
            padding: "16px",
            ...textPreset.body,
            border: journalSaved
              ? `1px solid ${colors.coral}`
              : `1px solid ${colors.borderDefault}`,
            borderRadius: radii.md,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            color: colors.textPrimary,
            backgroundColor: journalSaved ? "rgba(196, 148, 58, 0.08)" : colors.bgInput,
            transition: "border-color 0.2s, background-color 0.2s",
          }}
          onFocus={(e) => { if (!journalSaved) e.target.style.borderColor = colors.coral; }}
          onBlur={(e) => { if (!journalSaved) e.target.style.borderColor = colors.borderDefault; }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <span style={{ ...textPreset.caption, color: colors.textPrimary }}>
            {journalContent.length > 0 ? `${journalContent.split(/\s+/).filter(Boolean).length} words` : ""}
          </span>

          {!journalSaved ? (
            <motion.button
              whileHover={journalContent.trim() && !savingJournal ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}}
              whileTap={journalContent.trim() && !savingJournal ? { scale: 0.97 } : {}}
              onClick={handleSaveJournalTracked}
              disabled={!journalContent.trim() || savingJournal}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: !journalContent.trim() || savingJournal ? colors.textPrimary : colors.bgDeep,
                backgroundColor: !journalContent.trim() || savingJournal ? colors.bgElevated : colors.coral,
                border: "none", borderRadius: 100,
                cursor: !journalContent.trim() || savingJournal ? "not-allowed" : "pointer",
                fontFamily: display, letterSpacing: "0.01em",
                transition: "background-color 0.2s",
              }}
            >
              {savingJournal ? "Reading…" : "Watcha think?"}
            </motion.button>
          ) : (
            <span style={{
              fontSize: 14, color: colors.coral, fontWeight: 600,
              fontFamily: display, display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: "50%",
                backgroundColor: colors.coral,
                color: colors.bgDeep,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 12,
              }}>✓</span>
              Journal saved
            </span>
          )}
        </div>
      </motion.div>
    )}

    {/* GuidedExerciseFlow / "thought conversation" modal removed —
        no audio/voice/walk-through surface in the day flow. */}

    </div>
    </FadeIn>
  );
}
