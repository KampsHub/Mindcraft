"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

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
  isRequired?: boolean;
  onComplete: (responses: Record<string, string>, rating: number | null) => void;
  isCompleted?: boolean;
  existingResponses?: Record<string, string>;
  existingRating?: number | null;
}

const modalityColors: Record<string, { bg: string; text: string; label: string }> = {
  cognitive: { bg: "rgba(99,102,241,0.12)", text: "#818cf8", label: "Cognitive" },
  somatic: { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", label: "Somatic" },
  relational: { bg: colors.plumWash, text: colors.plumLight, label: "Relational" },
  integrative: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", label: "Integrative" },
  systems: { bg: "rgba(139,92,246,0.12)", text: "#a78bfa", label: "Systems" },
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
  isRequired,
  onComplete,
  isCompleted = false,
  existingResponses,
  existingRating,
}: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(type === "coaching_plan");
  const [response, setResponse] = useState(existingResponses?.main || "");
  const [rating, setRating] = useState<number | null>(existingRating || null);
  const [submitted, setSubmitted] = useState(isCompleted);

  const modalityStyle = modality ? modalityColors[modality] : null;

  function handleSubmit() {
    if (!response.trim()) return;
    setSubmitted(true);
    onComplete({ main: response }, rating);
  }

  return (
    <motion.div
      whileHover={!submitted ? { y: -2, boxShadow: "0 8px 24px rgba(224, 149, 133, 0.1)" } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`,
        padding: 0,
        marginBottom: 12,
        borderColor: submitted
          ? "rgba(34, 197, 94, 0.25)"
          : type === "coaching_plan"
          ? "rgba(224, 149, 133, 0.3)"
          : colors.borderDefault,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div
        onClick={() => !submitted && setExpanded(!expanded)}
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: submitted ? "default" : "pointer",
          backgroundColor: submitted ? "rgba(34,197,94,0.06)" : "transparent",
          transition: "background-color 0.2s",
        }}
      >
        {/* Type & modality badges */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {isRequired && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "3px 10px",
                borderRadius: 100,
                backgroundColor: colors.accentLight,
                color: colors.accent,
                fontFamily: display,
              }}
            >
              Required
            </span>
          )}
          {modalityStyle && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 10px",
                borderRadius: 100,
                backgroundColor: modalityStyle.bg,
                color: modalityStyle.text,
                fontFamily: display,
              }}
            >
              {modalityStyle.label}
            </span>
          )}
        </div>

        {/* Exercise name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0,
              fontFamily: body,
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </p>
          {originator && (
            <p
              style={{
                fontSize: 12,
                color: colors.textMuted,
                margin: "3px 0 0 0",
                fontFamily: body,
              }}
            >
              {originator}
              {sourceWork ? ` — ${sourceWork}` : ""}
            </p>
          )}
        </div>

        {/* Time estimate & expand icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {estimatedMinutes && (
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, fontWeight: 500 }}>
              ~{estimatedMinutes}min
            </span>
          )}
          {submitted ? (
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              backgroundColor: "rgba(34,197,94,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, color: colors.success }}>✓</span>
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: colors.textMuted,
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && !submitted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 22px 20px" }}>
              {/* Why selected (for overflow exercises) */}
              {whySelected && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    marginBottom: 14,
                    borderLeft: `3px solid ${colors.coral}`,
                  }}
                >
                  <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.55, fontFamily: body }}>
                    {whySelected}
                  </p>
                </div>
              )}

              {/* Custom framing */}
              {customFraming && (
                <p
                  style={{
                    fontSize: 14,
                    color: colors.textBody,
                    lineHeight: 1.65,
                    margin: "0 0 14px 0",
                    fontFamily: body,
                  }}
                >
                  {customFraming}
                </p>
              )}

              {/* Instructions */}
              {instructions && (
                <div
                  style={{
                    padding: 16,
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.textBody,
                      margin: 0,
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      fontFamily: body,
                    }}
                  >
                    {instructions}
                  </p>
                </div>
              )}

              {/* Response area */}
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
                  Your response
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Take your time. Write what comes up..."
                  style={{
                    width: "100%",
                    minHeight: 120,
                    padding: 16,
                    fontSize: 15,
                    lineHeight: 1.65,
                    backgroundColor: colors.bgInput,
                    border: `1px solid ${colors.borderDefault}`,
                    color: colors.textPrimary,
                    borderRadius: 12,
                    resize: "vertical",
                    outline: "none",
                    fontFamily: body,
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                  onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                />
              </div>

              {/* Star rating */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.textMuted,
                    marginBottom: 8,
                    fontFamily: display,
                    letterSpacing: "0.04em",
                  }}
                >
                  How helpful was this? (optional)
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(rating === star ? null : star)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        border: `1px solid ${
                          rating && star <= rating ? "rgba(224,149,133,0.35)" : colors.borderDefault
                        }`,
                        backgroundColor:
                          rating && star <= rating ? colors.coralWash : "transparent",
                        color:
                          rating && star <= rating ? colors.coral : colors.textMuted,
                        fontSize: 18,
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
              </div>

              {/* Submit */}
              <motion.button
                whileHover={response.trim() ? { scale: 1.03, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" } : {}}
                whileTap={response.trim() ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!response.trim()}
                style={{
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: response.trim() ? colors.bgDeep : colors.textMuted,
                  backgroundColor: response.trim() ? colors.coral : colors.bgElevated,
                  border: "none",
                  borderRadius: 100,
                  cursor: response.trim() ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                  fontFamily: display,
                  letterSpacing: "0.01em",
                }}
              >
                Complete Exercise
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed state */}
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
          {existingRating && (
            <span style={{ fontSize: 13, color: colors.coral, marginTop: 6, display: "block", fontFamily: display }}>
              {"★".repeat(existingRating)}
              {"☆".repeat(5 - existingRating)}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
