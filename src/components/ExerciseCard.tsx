"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, text as textScale, radii } from "@/lib/theme";
import MultiPartExerciseCard, { type ExercisePart } from "@/components/MultiPartExerciseCard";
import SpectrumSelector from "@/components/SpectrumSelector";
import BodyMap, { type BodyMarker } from "@/components/BodyMap";
import EmotionChips from "@/components/EmotionChips";
import FlagButton from "@/components/FlagButton";
import VoiceResponseArea from "@/components/VoiceResponseArea";
import GuidedExerciseFlow from "@/components/GuidedExerciseFlow";
import ListenRespondFlow from "@/components/ListenRespondFlow";

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
  onComplete: (responses: Record<string, string>, rating: number | null) => void;
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
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(type === "coaching_plan");
  const [response, setResponse] = useState(existingResponses?.main || "");
  const [rating, setRating] = useState<number | null>(existingRating || null);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [showScience, setShowScience] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
  const [showGuided, setShowGuided] = useState(false);
  const [showListen, setShowListen] = useState(false);
  const [parked, setParked] = useState(false);
  const [showParkInfo, setShowParkInfo] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const readAloud = (text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    // Prefer a calm female voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Google UK English Female"));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => { setSpeaking(false); if (onDone) onDone(); };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const startGuidedMode = () => {
    setGuidedMode(true);
    setExpanded(true);
    // Read the exercise instructions, then auto-start listening
    const textToRead = instructions || customFraming || "";
    if (textToRead) {
      readAloud(textToRead, () => {
        // After reading, auto-start mic
        startListeningForResponse();
      });
    }
  };

  const startListeningForResponse = () => {
    try {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return;
      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) text += event.results[i][0].transcript;
        }
        if (text) setResponse((prev) => prev ? prev + " " + text : text);
      };
      recognition.onend = () => { setListening(false); recognitionRef.current = null; };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    } catch { /* ignore */ }
  };

  // Interactive input state
  const [spectrumValue, setSpectrumValue] = useState<number>(
    existingResponses?.spectrum ? JSON.parse(existingResponses.spectrum).value : 50
  );
  const [bodyMarkers, setBodyMarkers] = useState<BodyMarker[]>(
    existingResponses?.body_map ? JSON.parse(existingResponses.body_map) : []
  );
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(
    existingResponses?.emotions ? JSON.parse(existingResponses.emotions) : []
  );

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

  function handleSubmit() {
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

    onComplete(responses, rating);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
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
      whileHover={!submitted ? { y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.15)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radii.md,
        border: `1px solid ${colors.borderDefault}`,
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
                color: "#ffffff",
                margin: 0,
              }}
            >
              {submitted && (
                <span style={{ color: colors.success, marginRight: 8, fontSize: 16 }}>&#10003;</span>
              )}
              {name}
            </p>
            {estimatedMinutes && (
              <span
                style={{
                  ...textScale.secondary,
                  color: colors.textMuted,
                  fontWeight: 500,
                }}
              >
                &middot; {estimatedMinutes}m
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
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>
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
                      backgroundColor: "rgba(196, 148, 58, 0.1)",
                      border: "none", cursor: "pointer",
                      ...textScale.caption, fontSize: 12, color: colors.coral,
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(196, 148, 58, 0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(196, 148, 58, 0.1)"; }}
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
                          color: "rgba(255,255,255,0.3)",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; setShowParkInfo(true); }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; setShowParkInfo(false); }}
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
                    ...textScale.body, color: "#ffffff", margin: 0,
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
                                color: rating === 5 ? "#4ade80" : "#ffffff",
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
      {showListen && instructions && (
        <ListenRespondFlow
          exerciseName={name}
          instructions={instructions}
          whyNow={whySelected}
          onComplete={(text) => {
            setResponse(text);
            setShowListen(false);
          }}
          onClose={() => setShowListen(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
