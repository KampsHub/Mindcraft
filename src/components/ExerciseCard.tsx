"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import MultiPartExerciseCard, { type ExercisePart } from "@/components/MultiPartExerciseCard";
import SpectrumSelector from "@/components/SpectrumSelector";
import BodyMap, { type BodyMarker } from "@/components/BodyMap";
import EmotionChips from "@/components/EmotionChips";
import FlagButton from "@/components/FlagButton";
import VoiceResponseArea from "@/components/VoiceResponseArea";

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
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(type === "coaching_plan");
  const [response, setResponse] = useState(existingResponses?.main || "");
  const [rating, setRating] = useState<number | null>(existingRating || null);
  const [submitted, setSubmitted] = useState(isCompleted);
  const [showScience, setShowScience] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [guidedMode, setGuidedMode] = useState(false);
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
  }

  return (
    <motion.div
      whileHover={!submitted ? { y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.15)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 16,
        border: `1px solid ${colors.borderDefault}`,
        padding: 0,
        marginBottom: 14,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.3s",
        position: "relative",
      }}
    >
      {/* ── Header ── */}
      <div
        onClick={() => !submitted && setExpanded(!expanded)}
        style={{
          padding: "16px 20px",
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
                fontSize: 18,
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                fontFamily: display,
                letterSpacing: "-0.01em",
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
                  fontSize: 14,
                  color: colors.textMuted,
                  fontFamily: display,
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
                  fontSize: 12,
                  color: colors.textMuted,
                  margin: 0,
                  fontFamily: body,
                }}
              >
                {originator}
                {sourceWork ? ` — ${sourceWork}` : ""}
              </p>
            )}
            {mod && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.textMuted,
                  fontFamily: display,
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
            <div style={{ padding: "0 20px 24px 20px" }}>
              {/* Why now — compact one-liner */}
              {whySelected && (
                <p style={{
                  fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 14px 0",
                  lineHeight: 1.5, fontFamily: body, fontStyle: "italic",
                }}>
                  {whySelected}
                </p>
              )}

              {/* Instructions — always visible, the main content */}
              {instructions && (
                <div style={{
                  padding: "16px 18px", backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: 12, marginBottom: 14,
                }}>
                  <p style={{
                    fontSize: 15, color: "#ffffff", margin: 0,
                    lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: body,
                  }}>
                    {instructions}
                  </p>
                </div>
              )}

              {/* How this helps — collapsed accordion */}
              {whyThisWorks && (
                <div style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => setShowScience(!showScience)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "none", border: "none", cursor: "pointer",
                      padding: "4px 0", fontFamily: display, fontSize: 11,
                      fontWeight: 600, color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}
                  >
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                      style={{ transform: showScience ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    Why this works
                  </button>
                  {showScience && (
                    <p style={{
                      fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "8px 0 0 16px",
                      lineHeight: 1.55, fontFamily: body,
                    }}>
                      {whyThisWorks}
                    </p>
                  )}
                </div>
              )}

              {/* Divider before response area */}
              <div style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 18 }} />

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
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMuted,
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: display,
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
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMuted,
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: display,
                        }}
                      >
                        Body scan
                      </label>
                      <BodyMap markers={bodyMarkers} onChange={setBodyMarkers} />
                    </div>
                  )}

                  {inputType === "emotions" && (
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: colors.textMuted,
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontFamily: display,
                        }}
                      >
                        What are you feeling?
                      </label>
                      <EmotionChips selected={selectedEmotions} onChange={setSelectedEmotions} />
                    </div>
                  )}

                  {/* ── Voice-first response area ── */}
                  <div style={{ marginBottom: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.textMuted,
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontFamily: display,
                      }}
                    >
                      {inputType !== "text" ? "Add any notes" : "Your response"}
                    </label>
                    <VoiceResponseArea
                      value={response}
                      onChange={setResponse}
                      disabled={submitted}
                    />
                  </div>

                  {/* Rating question + submit row */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div>
                      {response.trim().length > 0 && (
                        <>
                          <p style={{
                            fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "12px 0 8px 0",
                            fontFamily: body,
                          }}>
                            Was this exercise useful?
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => setRating(rating === 5 ? null : 5)}
                              style={{
                                padding: "8px 20px", borderRadius: 100, fontSize: 13,
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
                                padding: "8px 20px", borderRadius: 100, fontSize: 13,
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
                        padding: "0 20px",
                        height: 40,
                        fontSize: 14,
                        fontWeight: 600,
                        color: canSubmit ? colors.bgDeep : colors.textMuted,
                        backgroundColor: canSubmit ? colors.coral : colors.bgElevated,
                        border: "none",
                        borderRadius: 100,
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
        <div style={{ padding: "0 20px 18px 20px" }}>
          <p
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              margin: 0,
              lineHeight: 1.55,
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            {existingRating ? (
              <span style={{
                fontSize: 12, fontWeight: 600, fontFamily: display,
                color: existingRating >= 4 ? "#4ade80" : "rgba(255, 255, 255, 0.5)",
              }}>
                {existingRating >= 4 ? "Landed" : "Didn\u2019t land"}
              </span>
            ) : <div />}
            <FlagButton
              outputType="exercise"
              frameworkName={name}
              dailySessionId={dailySessionId}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
