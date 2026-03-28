"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import FlagButton from "@/components/FlagButton";
import VoiceToText from "@/components/VoiceToText";
import GuidedExerciseFlow from "@/components/GuidedExerciseFlow";
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
          <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
            Loading yesterday&apos;s themes...
          </p>
        </div>
      ) : error ? (
        <div>
          <p style={{ ...textPreset.secondary, color: "#f87171", margin: "0 0 12px 0" }}>
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
                color: "#ffffff", backgroundColor: "transparent",
                border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                cursor: "pointer", fontFamily: display,
              }}
            >
              Skip to journal →
            </motion.button>
          </div>
        </div>
      ) : (
        <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
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
  const [showThoughtConversation, setShowThoughtConversation] = useState(false);
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
  const [followThroughListening, setFollowThroughListening] = useState(false);
  const followThroughRecognitionRef = useRef<any>(null);

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
          <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
            Day 1 — no prior themes.
          </p>
        ) : (
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: space[5],
        }}>
          <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 18px 0" }}>
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
                  ...textPreset.body, color: "#ffffff",
                  margin: i === 0 ? "0 0 12px 0" : "12px 0",
                }}>
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 14px 0" }}>
              {themes.summary}
            </p>
          )}

          {/* Yesterday's committed mini-actions follow-up */}
          {themes.yesterday_committed_actions && themes.yesterday_committed_actions.length > 0 && (
            <div style={{
              padding: "16px 18px",
              backgroundColor: "rgba(224, 149, 133, 0.06)",
              borderRadius: radii.md,
              borderLeft: `3px solid ${colors.coral}`,
              marginBottom: space[6],
            }}>
              <p style={{ ...textPreset.caption, color: colors.coral, margin: "0 0 10px 0" }}>
                Yesterday&apos;s mini-actions
              </p>
              <p style={{ ...textPreset.secondary, color: "#ffffff", margin: "0 0 10px 0" }}>
                You committed to these. How did they go?
              </p>
              {(themes.yesterday_committed_actions || []).map((action, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <p style={{ ...textPreset.secondary, fontWeight: 600, color: "#ffffff", margin: "0 0 4px 0" }}>
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
                  <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                    {p.observation}
                  </p>
                  <p style={{ ...textPreset.secondary, color: "#ffffff", margin: "4px 0 0 0" }}>
                    Seen across {p.days_observed} days • {p.connection}
                  </p>
                </div>
              ))}
            </div>
          )}

          {themes.carry_forward && (
            <p style={{ ...textPreset.body, color: "#ffffff", margin: 0, fontStyle: "italic" }}>
              {themes.carry_forward}
            </p>
          )}
        </div>
      )}
    </div>

    {/* Exercise follow-through from yesterday */}
    {isRevealed("followthrough") && (yesterdayExercise || yesterdaySummaryTakeaways) && (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          padding: "16px 18px",
          backgroundColor: "rgba(224, 149, 133, 0.08)",
          borderRadius: 14,
          border: "1px solid rgba(224, 149, 133, 0.15)",
          marginBottom: space[6],
        }}
      >
        <p style={{
          ...textPreset.caption, color: colors.coral,
          margin: "0 0 8px 0",
        }}>
          Yesterday&apos;s takeaways
        </p>

        {/* Show summary takeaways from Done tab if available */}
        {yesterdaySummaryTakeaways ? (
          <div style={{ marginBottom: 12 }}>
            {yesterdaySummaryTakeaways.questions_to_sit_with.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ ...textPreset.secondary, color: "rgba(255,255,255,0.55)", margin: "0 0 6px 0" }}>
                  Questions to sit with:
                </p>
                {yesterdaySummaryTakeaways.questions_to_sit_with.map((q, i) => (
                  <p key={i} style={{ ...textPreset.body, color: "#ffffff", margin: "4px 0", fontStyle: "italic", paddingLeft: 12 }}>
                    {q}
                  </p>
                ))}
              </div>
            )}
            {yesterdaySummaryTakeaways.challenges.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ ...textPreset.secondary, color: "rgba(255,255,255,0.55)", margin: "0 0 6px 0" }}>
                  Challenges you took on:
                </p>
                {yesterdaySummaryTakeaways.challenges.map((c, i) => (
                  <p key={i} style={{ ...textPreset.body, color: "#ffffff", margin: "4px 0", paddingLeft: 12 }}>
                    &bull; {c}
                  </p>
                ))}
              </div>
            )}
            {yesterdaySummaryTakeaways.committed_actions.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ ...textPreset.secondary, color: "rgba(255,255,255,0.55)", margin: "0 0 6px 0" }}>
                  You committed to:
                </p>
                {yesterdaySummaryTakeaways.committed_actions.map((a, i) => (
                  <p key={i} style={{ ...textPreset.body, color: "#ffffff", margin: "4px 0", paddingLeft: 12 }}>
                    &bull; {a}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : yesterdayExercise ? (
          <p style={{ ...textPreset.body, color: "#ffffff", margin: "0 0 6px 0", fontWeight: 600 }}>
            {yesterdayExercise.name}
          </p>
        ) : null}

        <p style={{ ...textPreset.secondary, color: "#ffffff", margin: "0 0 10px 0" }}>
          What came up from these?
        </p>
        <div style={{ position: "relative" }}>
          <textarea
            value={followThrough}
            onChange={(e) => setFollowThrough(e.target.value)}
            placeholder="Type or tap the mic to speak..."
            style={{
              width: "100%", minHeight: 60, padding: "12px 48px 12px 12px",
              ...textPreset.body,
              borderRadius: radii.md, border: `1px solid ${colors.borderDefault}`,
              backgroundColor: colors.bgInput, color: "#ffffff",
              resize: "none", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => {
              if (followThroughListening) {
                if (followThroughRecognitionRef.current) {
                  followThroughRecognitionRef.current.stop();
                  followThroughRecognitionRef.current = null;
                }
                setFollowThroughListening(false);
                return;
              }
              try {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (!SpeechRecognition) { alert("Voice not supported in this browser"); return; }
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-US";
                recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  setFollowThrough((prev) => prev ? prev + " " + transcript : transcript);
                };
                recognition.onend = () => {
                  setFollowThroughListening(false);
                  followThroughRecognitionRef.current = null;
                };
                followThroughRecognitionRef.current = recognition;
                recognition.start();
                setFollowThroughListening(true);
              } catch { /* ignore */ }
            }}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: "50%",
              backgroundColor: followThroughListening ? "#ef4444" : "transparent",
              border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: followThroughListening ? "0 0 16px rgba(239, 68, 68, 0.5)" : "none",
              transition: "background-color 0.2s, box-shadow 0.2s",
            }}
            title={followThroughListening ? "Stop recording" : "Speak your response"}
          >
            {followThroughListening ? (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#ffffff">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>
        </div>
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
              ...textPreset.caption, color: "rgba(255,255,255,0.5)",
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
                  <p style={{ ...textPreset.body, color: "#ffffff", margin: 0 }}>
                    {sp.expanded || sp.prompt}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowThoughtConversation(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 100,
                backgroundColor: "rgba(196, 148, 58, 0.1)",
                border: "none", cursor: "pointer",
                ...textPreset.secondary, fontWeight: 600, color: colors.coral,
                marginTop: 8,
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              ><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Discuss these with your coach assistant
            </button>
          </div>
        )}

        {/* Free flow — quick thoughts before journaling */}
        <div style={{ marginBottom: space[6] }}>
          <p style={{ ...textPreset.caption, color: colors.plumLight, margin: "0 0 8px 0" }}>
            Anything else on your mind?
          </p>
          <p style={{ ...textPreset.secondary, color: "rgba(255,255,255,0.4)", margin: "0 0 12px 0" }}>
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
              color: "#ffffff", resize: "none", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Journal input — textarea with inline mic button */}
        <div style={{ position: "relative" }}>
          <textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            disabled={journalSaved}
            placeholder="Write freely. What's coming up? What are you noticing?"
            style={{
              width: "100%",
              minHeight: 180,
              padding: "16px 50px 16px 16px",
              ...textPreset.body,
              border: journalSaved
                ? `1px solid ${colors.coral}`
                : `1px solid ${colors.borderDefault}`,
              borderRadius: radii.md,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              color: colors.textPrimary,
              backgroundColor: journalSaved ? "rgba(224, 149, 133, 0.08)" : colors.bgInput,
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onFocus={(e) => { if (!journalSaved) e.target.style.borderColor = colors.coral; }}
            onBlur={(e) => { if (!journalSaved) e.target.style.borderColor = colors.borderDefault; }}
          />
          {!journalSaved && (
            <button
              onClick={() => setJournalMode(journalMode === "voice" ? "type" : "voice")}
              title={journalMode === "voice" ? "Switch to typing" : "Use voice input"}
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                backgroundColor: journalMode === "voice" ? colors.coral : colors.bgElevated,
                color: journalMode === "voice" ? colors.bgDeep : "rgba(255,255,255,0.6)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}
        </div>
        {journalMode === "voice" && !journalSaved && (
          <VoiceToText onTranscript={(text) => setJournalContent((prev) => prev ? prev + " " + text : text)} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <span style={{ ...textPreset.caption, color: "#ffffff" }}>
            {journalContent.length > 0 ? `${journalContent.split(/\s+/).filter(Boolean).length} words` : ""}
          </span>

          {!journalSaved ? (
            <motion.button
              whileHover={journalContent.trim() && !savingJournal ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}}
              whileTap={journalContent.trim() && !savingJournal ? { scale: 0.97 } : {}}
              onClick={saveJournal}
              disabled={!journalContent.trim() || savingJournal}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: !journalContent.trim() || savingJournal ? "#ffffff" : colors.bgDeep,
                backgroundColor: !journalContent.trim() || savingJournal ? colors.bgElevated : colors.coral,
                border: "none", borderRadius: 100,
                cursor: !journalContent.trim() || savingJournal ? "not-allowed" : "pointer",
                fontFamily: display, letterSpacing: "0.01em",
                transition: "background-color 0.2s",
              }}
            >
              {savingJournal ? "Saving..." : "Save & Continue"}
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

    <AnimatePresence>
      {showThoughtConversation && (
        <GuidedExerciseFlow
          exerciseName="Thought Exploration"
          instructions={programDay.seed_prompts.map(sp => sp.prompt).join("\n\n")}
          whyNow="Exploring today's thought prompts in conversation"
          onComplete={(text) => {
            setJournalContent(prev => prev ? prev + "\n\n---\nFrom thought conversation:\n" + text : text);
            setShowThoughtConversation(false);
          }}
          onClose={() => setShowThoughtConversation(false)}
        />
      )}
    </AnimatePresence>

    </div>
    </FadeIn>
  );
}
