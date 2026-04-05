"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, text as textScale, radii } from "@/lib/theme";
import MultiPartExerciseCard, { type ExercisePart } from "@/components/MultiPartExerciseCard";
import SpectrumSelector from "@/components/SpectrumSelector";
import BodyMap, { type BodyMarker } from "@/components/BodyMap";
import EmotionChips from "@/components/EmotionChips";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FlagButton from "@/components/FlagButton";
import VoiceResponseArea from "@/components/VoiceResponseArea";
import GuidedExerciseFlow from "@/components/GuidedExerciseFlow";

const display = fonts.display;
const body = fonts.bodyAlt;

export type ExerciseInputType = "text" | "multi-part" | "spectrum" | "body-map" | "emotions";

interface SpectrumConfig {
  leftLabel: string;
  rightLabel: string;
  min?: number;
  max?: number;
}

interface ExerciseCardProps {
  name: string;
  type: "coaching_plan" | "overflow" | "framework_analysis";
  modality?: string;
  originator?: string;
  sourceWork?: string;
  customFraming?: string;
  instructions?: string;
  estimatedMinutes?: number;
  whySelected?: string;
  whyThisWorks?: string;
  isRequired?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onComplete: (responses: Record<string, string>, rating: number | null) => any;
  isCompleted?: boolean;
  existingResponses?: Record<string, string>;
  existingRating?: number | null;
  /** Interactive input type — defaults to "text" (original textarea) */
  inputType?: ExerciseInputType;
  /** Config for multi-part exercises */
  parts?: ExercisePart[];
  /** Config for spectrum selector */
  spectrumConfig?: SpectrumConfig;
  /** Daily session ID for flagging */
  dailySessionId?: string;
  /** Called when user parks the exercise for later */
  onPark?: () => void;
  /** Whether the exercise is currently parked */
  isParked?: boolean;
  /** Called when user skips the exercise */
  onSkip?: () => void;
  /** Current day number — used for skill progression badge */
  dayNumber?: number;
}

const progressionStages = [
  { label: "Awareness", color: "#818cf8", range: [1, 7] },    // Week 1: awareness & noticing
  { label: "Practice", color: "#60a5fa", range: [8, 14] },    // Week 2: trying tools
  { label: "Application", color: "#34d399", range: [15, 21] }, // Week 3: applying to real situations
  { label: "Integration", color: "#fbbf24", range: [22, 30] }, // Week 4: making it yours
] as const;

function getProgressionStage(dayNumber: number) {
  return progressionStages.find((s) => dayNumber >= s.range[0] && dayNumber <= s.range[1]) || null;
}

const modalityConfig: Record<string, { label: string }> = {
  cognitive: { label: "Cognitive" },
  somatic: { label: "Somatic" },
  relational: { label: "Relational" },
  integrative: { label: "Integrative" },
  systems: { label: "Systems" },
};

export default function ExerciseCard({
  name,
  type,
  modality,
  originator,
  sourceWork,
  customFraming,
  instructions,
  estimatedMinutes,
  whySelected,
  whyThisWorks,
  isRequired,
  onComplete,
  isCompleted = false,
  existingResponses,
  existingRating,
  inputType = "text",
  parts,
  spectrumConfig,
  dailySessionId,
  onPark,
  isParked = false,
  onSkip,
  dayNumber,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(type === "coaching_plan");
  const [response, setResponse] = useState(existingResponses?.main || "");
  const [rating, setRating] = useState<number | null>(existingRating || null);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [showScience, setShowScience] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [parked, setParked] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [showParkInfo, setShowParkInfo] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  // Insight state
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [starRating, setStarRating] = useState<number | null>(existingRating || null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [insightSaved, setInsightSaved] = useState(false);
  const [insightEditing, setInsightEditing] = useState(false);
  const [completionId, setCompletionId] = useState<string | null>(null);
  // Interactive input state
  const [spectrumValue, setSpectrumValue] = useState<number>(() => {
    try { return existingResponses?.spectrum ? JSON.parse(existingResponses.spectrum).value : 50; }
    catch { return 50; }
  });
  const [bodyMarkers, setBodyMarkers] = useState<BodyMarker[]>(() => {
    try { return existingResponses?.body_map ? JSON.parse(existingResponses.body_map) : []; }
    catch { return []; }
  });
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(() => {
    try { return existingResponses?.emotions ? JSON.parse(existingResponses.emotions) : []; }
    catch { return []; }
  });

  const mod = modality ? modalityConfig[modality] : null;

  // For multi-part, submission is handled by MultiPartExerciseCard itself
  function handleMultiPartComplete(partResponses: Record<string, string>) {
    setSubmitted(true);
    onComplete(partResponses, rating);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  // Determine if the form has enough data to submit
  function hasInteractiveData(): boolean {
    switch (inputType) {
      case "spectrum":
        return true; // spectrum always has a value
      case "body-map":
        return bodyMarkers.length > 0;
      case "emotions":
        return selectedEmotions.length > 0;
      default:
        return false;
    }
  }

  const canSubmit = response.trim() !== "" || hasInteractiveData();

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);

    const responses: Record<string, string> = { main: response };

    if (inputType === "spectrum" && spectrumConfig) {
      responses.spectrum = JSON.stringify({
        value: spectrumValue,
        left: spectrumConfig.leftLabel,
        right: spectrumConfig.rightLabel,
      });
    }
    if (inputType === "body-map") {
      responses.body_map = JSON.stringify(bodyMarkers);
    }
    if (inputType === "emotions") {
      responses.emotions = JSON.stringify(selectedEmotions);
    }

    const result = onComplete(responses, rating);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);

    // Generate insight
    const cId = result instanceof Promise ? await result : undefined;
    if (cId) {
      setCompletionId(cId);
      setInsightLoading(true);
      try {
        const res = await fetch("/api/exercises/process-insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseCompletionId: cId,
            frameworkName: name,
            responses,
            customFraming,
          }),
        });
        const data = await res.json();
        if (data.insight) {
          setInsight(data.insight);
          setInsightEditing(true);
        }
      } catch {
        // Insight generation is non-blocking — exercise still saved
      } finally {
        setInsightLoading(false);
      }
    }
  }

  return (
    <>
    <AnimatePresence>
      {showSaved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            padding: "10px 20px", borderRadius: 100, zIndex: 300,
            backgroundColor: "#6AB282", color: "#18181C",
            fontSize: 13, fontWeight: 600, fontFamily: "'Sora', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          Exercise saved ✓
        </motion.div>
      )}
    </AnimatePresence>
    <motion.div
      ref={(el) => {
        if (el && submitted && !isCompleted && !el.dataset.glowed) {
          el.dataset.glowed = "1";
          import("motion").then(({ animate }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (animate as any)(el, {
              boxShadow: ["0 0 0 rgba(196,148,58,0)", "0 0 20px rgba(196,148,58,0.3)", "0 0 0 rgba(196,148,58,0)"],
            }, { duration: 1, easing: "ease-in-out" });
          });
        }
      }}
      whileHover={!submitted ? { y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.15)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radii.md,
        border: `1px solid ${submitted && !isCompleted ? colors.coral : colors.borderDefault}`,
        padding: 0,
        marginBottom: space[3],
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.3s",
        position: "relative",
      }}
    >
      {/* ── Header ── */}
      <div
        onClick={() => !submitted && setExpanded(!expanded)}
        style={{
          padding: `${space[4]}px ${space[5]}px`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: submitted ? "default" : "pointer",
          transition: "background-color 0.2s",
        }}
      >
        {/* Title + time suffix */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <p
              style={{
                ...textScale.heading,
                color: colors.textPrimary,
                margin: 0,
              }}
            >
              {submitted && (
                <span
                  ref={(el) => {
                    if (el && !isCompleted && !el.dataset.animated) {
                      el.dataset.animated = "1";
                      import("motion").then(({ animate }) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (animate as any)(el, { scale: [0.5, 1.2, 1], opacity: [0, 1] }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
                      });
                    }
                  }}
                  style={{ marginRight: 8, display: "inline-block" }}
                >
                  <AnimatedCheckmark size={16} animate={!isCompleted} />
                </span>
              )}
              {name}
            </p>
            {estimatedMinutes && (
              <span
                style={{
                  ...textScale.caption,
                  color: colors.textMuted,
                  fontWeight: 600,
                  backgroundColor: colors.bgElevated,
                  padding: "2px 8px",
                  borderRadius: radii.full,
                  whiteSpace: "nowrap",
                  position: "absolute" as const,
                  top: space[4],
                  right: space[5],
                }}
              >
                ~{estimatedMinutes}m
              </span>
            )}
          </div>
          {/* Modality label + originator as small text below title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
            {originator && (
              <p
                style={{
                  ...textScale.secondary,
                  fontSize: 12,
                  color: colors.textMuted,
                  margin: 0,
                }}
              >
                {originator}
                {sourceWork ? ` — ${sourceWork}` : ""}
              </p>
            )}
            {mod && (
              <span
                style={{
                  ...textScale.caption,
                  color: colors.textMuted,
                  opacity: 0.8,
                }}
              >
                {mod.label}
              </span>
            )}
            {dayNumber && (() => {
              const stage = getProgressionStage(dayNumber);
              if (!stage) return null;
              return (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: stage.color,
                    backgroundColor: `${stage.color}18`,
                    padding: "2px 8px",
                    borderRadius: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {stage.label}
                </span>
              );
            })()}
          </div>
        </div>

        {/* Expand chevron */}
        {!submitted && (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              fontSize: 12,
              color: colors.textMuted,
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            &#9662;
          </motion.span>
        )}
      </div>

      {/* ── Expanded content ── */}
      <AnimatePresence>
        {expanded && !submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: `0 ${space[5]}px ${space[5]}px ${space[5]}px` }}>
              {/* ── Intro: flowing text, no box ── */}
              {whySelected && (
                <p style={{
                  ...textScale.secondary, color: "rgba(255,255,255,0.5)", margin: `0 0 ${space[3]}px 0`,
                  fontStyle: "italic",
                }}>
                  {whySelected}
                  {whyThisWorks && (
                    <span style={{ color: colors.textMuted }}>
                      {" \u00B7 "}{whyThisWorks}
                    </span>
                  )}
                </p>
              )}
              {!whySelected && whyThisWorks && (
                <p style={{
                  ...textScale.secondary, fontSize: 12, color: "rgba(255,255,255,0.35)", margin: `0 0 ${space[3]}px 0`,
                }}>
                  {whyThisWorks}
                </p>
              )}

              {/* ── Mode chips: inline pills ── */}
              {instructions && !submitted && (
                <div style={{
                  display: "flex", gap: 6, marginBottom: space[3], flexWrap: "wrap",
                }}>
                  <button
                    onClick={() => setShowGuided(true)}
                    aria-label="Start guided conversation"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: `6px ${space[3]}px`, borderRadius: radii.full,
                      backgroundColor: colors.coralWash,
                      border: "none", cursor: "pointer",
                      ...textScale.caption, fontSize: 12, color: colors.coral,
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(196, 148, 58, 0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.coralWash; }}
                  >
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    ><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Talk through it
                  </button>
                  {onPark && !parked && !isParked && (
                    <div style={{ position: "relative", display: "inline-flex", marginLeft: "auto" }}>
                      <button
                        onClick={() => { setParked(true); onPark(); }}
                        aria-label="Park exercise for later"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: space[1],
                          padding: `6px ${space[3]}px`, borderRadius: radii.full,
                          backgroundColor: "transparent", border: "none",
                          cursor: "pointer", ...textScale.caption, fontSize: 12, fontWeight: 500,
                          color: colors.textMuted,
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; setShowParkInfo(true); }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = colors.textMuted; setShowParkInfo(false); }}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        ><circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="12" y2="12" /></svg>
                        Park
                      </button>
                      {showParkInfo && (
                        <div style={{
                          position: "absolute", bottom: "calc(100% + 6px)", right: 0,
                          padding: `6px 10px`, borderRadius: radii.sm,
                          backgroundColor: colors.bgElevated,
                          ...textScale.caption, color: "rgba(255,255,255,0.55)",
                          maxWidth: 200, zIndex: 10, whiteSpace: "nowrap",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        }}>
                          Save for later, keep going
                        </div>
                      )}
                    </div>
                  )}
                  {onSkip && !skipped && !parked && !isParked && !submitted && (
                    <button
                      onClick={() => { setSkipped(true); onSkip(); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: space[1],
                        padding: `6px ${space[3]}px`, borderRadius: radii.full,
                        backgroundColor: "transparent", border: "none",
                        cursor: "pointer", ...textScale.caption, fontSize: 12, fontWeight: 500,
                        color: colors.textMuted, transition: "color 0.15s",
                      }}
                    >
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                      ><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      Skip
                    </button>
                  )}
                  {skipped && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: space[1],
                      padding: `6px ${space[3]}px`, marginLeft: "auto",
                      ...textScale.caption, fontSize: 12, fontWeight: 500, color: colors.textMuted,
                    }}>
                      Skipped
                    </span>
                  )}
                  {(parked || isParked) && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: space[1],
                      padding: `6px ${space[3]}px`, marginLeft: "auto",
                      ...textScale.caption, fontSize: 12, fontWeight: 500, color: colors.success,
                    }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                      ><polyline points="20 6 9 17 4 12" /></svg>
                      Parked
                    </span>
                  )}
                </div>
              )}

              {/* Instructions — clean, no background box */}
              {instructions && (
                <div id={`instructions-${name}`} style={{ marginBottom: space[4] }}>
                  <p style={{
                    ...textScale.body, color: colors.textPrimary, margin: 0,
                    lineHeight: 1.8, whiteSpace: "pre-wrap",
                  }}>
                    {instructions}
                  </p>
                </div>
              )}

              {/* ── Multi-part mode: delegate entirely ── */}
              {inputType === "multi-part" && parts && parts.length > 0 ? (
                <MultiPartExerciseCard
                  parts={parts}
                  onComplete={handleMultiPartComplete}
                  existingResponses={existingResponses}
                  accentColor={colors.coral}
                  accentBg={colors.coralWash}
                />
              ) : (
                <>
                  {/* ── Interactive input (before voice area) ── */}
                  {inputType === "spectrum" && spectrumConfig && (
                    <div style={{ marginBottom: space[5] }}>
                      <label
                        style={{
                          display: "block",
                          ...textScale.caption,
                          color: colors.textMuted,
                          marginBottom: space[2],
                        }}
                      >
                        Where are you on this spectrum?
                      </label>
                      <SpectrumSelector
                        leftLabel={spectrumConfig.leftLabel}
                        rightLabel={spectrumConfig.rightLabel}
                        value={spectrumValue}
                        onChange={setSpectrumValue}
                        min={spectrumConfig.min}
                        max={spectrumConfig.max}
                      />
                    </div>
                  )}

                  {inputType === "body-map" && (
                    <div style={{ marginBottom: space[5] }}>
                      <label
                        style={{
                          display: "block",
                          ...textScale.caption,
                          color: colors.textMuted,
                          marginBottom: space[2],
                        }}
                      >
                        Body scan
                      </label>
                      <BodyMap markers={bodyMarkers} onChange={setBodyMarkers} />
                    </div>
                  )}

                  {inputType === "emotions" && (
                    <div style={{ marginBottom: space[5] }}>
                      <label
                        style={{
                          display: "block",
                          ...textScale.caption,
                          color: colors.textMuted,
                          marginBottom: space[2],
                        }}
                      >
                        What are you feeling?
                      </label>
                      <EmotionChips selected={selectedEmotions} onChange={setSelectedEmotions} />
                    </div>
                  )}

                  {/* ── Response area ── */}
                  <div style={{ marginBottom: space[4] }}>
                    <VoiceResponseArea
                      value={response}
                      onChange={setResponse}
                      disabled={submitted}
                    />
                  </div>

                  {/* Rating question + submit row */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: space[3] }}>
                    <div>
                      {response.trim().length > 0 && (
                        <>
                          <p style={{
                            ...textScale.secondary, color: "rgba(255,255,255,0.5)", margin: `${space[3]}px 0 ${space[2]}px 0`,
                          }}>
                            Was this exercise useful?
                          </p>
                          <div style={{ display: "flex", gap: space[2] }}>
                            <button
                              onClick={() => setRating(rating === 5 ? null : 5)}
                              style={{
                                padding: `${space[2]}px ${space[5]}px`, borderRadius: radii.full, fontSize: 13,
                                fontWeight: 600, fontFamily: display,
                                backgroundColor: rating === 5 ? "rgba(74, 222, 128, 0.15)" : colors.bgElevated,
                                color: rating === 5 ? "#4ade80" : colors.textPrimary,
                                border: rating === 5 ? "1px solid rgba(74, 222, 128, 0.3)" : `1px solid ${colors.borderDefault}`,
                                cursor: "pointer",
                              }}
                            >
                              Yes, useful
                            </button>
                            <button
                              onClick={() => setRating(rating === 2 ? null : 2)}
                              style={{
                                padding: `${space[2]}px ${space[5]}px`, borderRadius: radii.full, fontSize: 13,
                                fontWeight: 600, fontFamily: display,
                                backgroundColor: rating === 2 ? "rgba(255, 255, 255, 0.08)" : colors.bgElevated,
                                color: "rgba(255, 255, 255, 0.6)",
                                border: `1px solid ${colors.borderDefault}`,
                                cursor: "pointer",
                              }}
                            >
                              Not for me
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Submit — small pill button */}
                    <motion.button
                      whileHover={canSubmit ? { scale: 1.03 } : {}}
                      whileTap={canSubmit ? { scale: 0.97 } : {}}
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: `0 ${space[5]}px`,
                        height: 40,
                        fontSize: 14,
                        fontWeight: 600,
                        color: canSubmit ? colors.bgDeep : colors.textMuted,
                        backgroundColor: canSubmit ? colors.coral : colors.bgElevated,
                        border: "none",
                        borderRadius: radii.full,
                        cursor: canSubmit ? "pointer" : "not-allowed",
                        transition: "background-color 0.2s",
                        fontFamily: display,
                        letterSpacing: "0.01em",
                      }}
                    >
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Done
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Completed state ── */}
      {submitted && existingResponses?.main && (
        <div style={{ padding: `0 ${space[5]}px ${space[4]}px ${space[5]}px` }}>
          <p
            style={{
              ...textScale.secondary,
              color: colors.textSecondary,
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              fontFamily: body,
            }}
          >
            {existingResponses.main}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: space[2] }}>
            <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
              {existingRating ? (
                <span style={{
                  ...textScale.caption, fontSize: 12,
                  color: existingRating >= 4 ? "#4ade80" : "rgba(255, 255, 255, 0.5)",
                }}>
                  {existingRating >= 4 ? "Landed" : "Didn\u2019t land"}
                </span>
              ) : null}
              <button
                onClick={() => { setSubmitted(false); setExpanded(true); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  ...textScale.caption, fontSize: 12, color: colors.textMuted,
                  padding: 0, textDecoration: "underline",
                }}
              >
                Edit
              </button>
            </div>
            <FlagButton
              outputType="exercise"
              frameworkName={name}
              dailySessionId={dailySessionId}
            />
          </div>
        </div>
      )}

      {/* ── Process Insight ── */}
      {submitted && (insightLoading || insight) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ padding: `0 ${space[5]}px ${space[4]}px ${space[5]}px` }}
        >
          <div style={{
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${colors.success}`,
            padding: `${space[3]}px ${space[4]}px`,
          }}>
            <p style={{
              fontFamily: display, fontSize: 10, fontWeight: 700,
              color: colors.success, letterSpacing: "0.08em",
              margin: "0 0 6px 0", textTransform: "uppercase" as const,
            }}>
              {insightLoading ? "Generating insight..." : "Your insight"}
            </p>

            {insightLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: space[2] }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{ width: 14, height: 14, border: `2px solid ${colors.success}`, borderTopColor: "transparent", borderRadius: "50%" }}
                />
                <span style={{ fontFamily: body, fontSize: 13, color: colors.textMuted }}>Processing your responses...</span>
              </div>
            ) : insightEditing ? (
              <div>
                <textarea
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  style={{
                    width: "100%", minHeight: 60, padding: space[3],
                    fontSize: 14, fontFamily: body, lineHeight: 1.6,
                    backgroundColor: colors.bgInput, color: colors.textPrimary,
                    border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                    outline: "none", resize: "vertical", boxSizing: "border-box" as const,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: space[2], marginTop: space[2] }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      if (!completionId) return;
                      await fetch("/api/exercises/process-insight", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ exerciseCompletionId: completionId, insight }),
                      });
                      setInsightEditing(false);
                      setInsightSaved(true);
                      setTimeout(() => setInsightSaved(false), 2000);
                    }}
                    style={{
                      padding: `${space[2]}px ${space[4]}px`,
                      fontSize: 13, fontWeight: 600, fontFamily: display,
                      backgroundColor: colors.success, color: colors.bgDeep,
                      border: "none", borderRadius: radii.full, cursor: "pointer",
                    }}
                  >
                    {insightSaved ? "Saved ✓" : "Save insight"}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p style={{ fontFamily: body, fontSize: 14, color: colors.textPrimary, margin: 0, lineHeight: 1.6, flex: 1 }}>
                  {insight}
                </p>
                <button
                  onClick={() => setInsightEditing(true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, color: colors.textMuted, padding: 0, textDecoration: "underline",
                    fontFamily: body, marginLeft: space[3], flexShrink: 0,
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
      {/* ── Star Rating + Feedback ── */}
      {submitted && !starRating && (
        <div style={{
          padding: `${space[3]}px ${space[5]}px ${space[4]}px`,
          borderTop: `1px solid ${colors.borderSubtle}`,
        }}>
          <p style={{ ...textScale.caption, color: colors.textMuted, margin: `0 0 ${space[2]}px 0` }}>
            How was this exercise?
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={async () => {
                  setStarRating(star);
                  // Save rating to exercise completion
                  if (completionId) {
                    try {
                      const supabase = (await import("@/lib/supabase")).createClient();
                      await supabase.from("exercise_completions").update({ star_rating: star }).eq("id", completionId);
                    } catch { /* non-blocking */ }
                  }
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 22, padding: "2px 4px",
                  color: colors.coral, opacity: 0.3,
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.3"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}
      {submitted && starRating !== null && starRating <= 3 && !feedbackSaved && (
        <div style={{
          padding: `0 ${space[5]}px ${space[4]}px`,
        }}>
          <p style={{ ...textScale.secondary, color: colors.textSecondary, margin: `0 0 ${space[2]}px 0` }}>
            What would make this exercise better?
          </p>
          <div style={{ display: "flex", gap: space[2] }}>
            <input
              type="text"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              style={{
                flex: 1, padding: `${space[2]}px ${space[3]}px`,
                ...textScale.secondary,
                backgroundColor: colors.bgInput, color: colors.textPrimary,
                border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                outline: "none",
              }}
            />
            <button
              onClick={async () => {
                setFeedbackSaved(true);
                if (completionId && feedbackText.trim()) {
                  try {
                    const supabase = (await import("@/lib/supabase")).createClient();
                    await supabase.from("exercise_completions").update({ feedback: feedbackText.trim() }).eq("id", completionId);
                  } catch { /* non-blocking */ }
                }
              }}
              style={{
                padding: `${space[2]}px ${space[3]}px`,
                ...textScale.caption, fontWeight: 600,
                backgroundColor: colors.coral, color: colors.bgDeep,
                border: "none", borderRadius: radii.sm, cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      {feedbackSaved && (
        <p style={{ ...textScale.caption, color: colors.success, padding: `0 ${space[5]}px ${space[3]}px`, margin: 0 }}>
          Thank you for your feedback ✓
        </p>
      )}
    </motion.div>

    <AnimatePresence>
      {showGuided && instructions && (
        <GuidedExerciseFlow
          exerciseName={name}
          instructions={instructions}
          whyNow={whySelected}
          onComplete={(text) => {
            setResponse(text);
            setShowGuided(false);
          }}
          onClose={() => setShowGuided(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
