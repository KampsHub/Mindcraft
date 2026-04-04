"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface FlashCard {
  id: string;
  prompt: string;
  answer: string;
  hint?: string;
  category?: string;
}

type Confidence = "got-it" | "partially" | "missed";

interface RetrievalCheckProps {
  cards: FlashCard[];
  onComplete?: (results: { cardId: string; confidence: Confidence }[]) => void;
}

export default function RetrievalCheck({ cards, onComplete }: RetrievalCheckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState<{ cardId: string; confidence: Confidence }[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const card = cards[currentIndex];
  const progress = currentIndex / cards.length;

  const handleReveal = () => {
    if (!userAnswer.trim() && !isFlipped) return;
    setIsFlipped(true);
  };

  const handleAssess = (confidence: Confidence) => {
    const newResults = [...results, { cardId: card.id, confidence }];
    setResults(newResults);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer("");
      setIsFlipped(false);
      setShowHint(false);
    } else {
      setIsComplete(true);
      onComplete?.(newResults);
    }
  };

  if (isComplete) {
    const gotIt = results.filter((r) => r.confidence === "got-it").length;
    const partially = results.filter((r) => r.confidence === "partially").length;
    const missed = results.filter((r) => r.confidence === "missed").length;

    return (
      <div style={{
        backgroundColor: colors.bgDeep, borderRadius: radii.lg, padding: space[6],
        fontFamily: fonts.bodyAlt, textAlign: "center",
      }}>
        <div style={{ ...text.heading, color: colors.textPrimary, marginBottom: space[5] }}>
          Retrieval Complete
        </div>

        <div style={{ display: "flex", gap: space[5], justifyContent: "center", marginBottom: space[6] }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.success, fontFamily: fonts.display }}>{gotIt}</div>
            <div style={{ ...text.caption, color: colors.success }}>Got It</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.warning, fontFamily: fonts.display }}>{partially}</div>
            <div style={{ ...text.caption, color: colors.warning }}>Partially</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: colors.error, fontFamily: fonts.display }}>{missed}</div>
            <div style={{ ...text.caption, color: colors.error }}>Missed</div>
          </div>
        </div>

        {missed > 0 && (
          <div style={{
            backgroundColor: colors.bgSurface, borderRadius: radii.md, padding: space[4],
            borderLeft: `3px solid ${colors.error}`, textAlign: "left",
          }}>
            <div style={{ ...text.caption, color: colors.error, marginBottom: space[2] }}>NEEDS REVIEW</div>
            {results.filter((r) => r.confidence === "missed").map((r) => {
              const c = cards.find((c) => c.id === r.cardId);
              return c ? (
                <div key={r.cardId} style={{ ...text.secondary, color: colors.textSecondary, marginBottom: space[1] }}>
                  • {c.category || c.prompt.substring(0, 50)}
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: colors.bgDeep, borderRadius: radii.lg, padding: space[5],
      fontFamily: fonts.bodyAlt,
    }}>
      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: space[3], marginBottom: space[5] }}>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          backgroundColor: colors.bgElevated, overflow: "hidden",
        }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", backgroundColor: colors.coral, borderRadius: 2 }}
          />
        </div>
        <span style={{ ...text.caption, color: colors.textMuted }}>
          {currentIndex + 1}/{cards.length}
        </span>
      </div>

      {/* Category badge */}
      {card.category && (
        <div style={{
          ...text.caption, color: colors.coral,
          marginBottom: space[3],
        }}>
          {card.category}
        </div>
      )}

      {/* Card */}
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: colors.bgSurface, borderRadius: radii.md,
              padding: space[5], minHeight: 200,
              border: `1px solid ${colors.borderDefault}`,
            }}
          >
            {/* Prompt */}
            <div style={{
              ...text.body, color: colors.textPrimary,
              marginBottom: space[4], lineHeight: 1.7,
            }}>
              {card.prompt}
            </div>

            {/* Hint */}
            {card.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                style={{
                  ...text.caption, color: colors.plumLight,
                  background: "none", border: `1px solid ${colors.plumLight}44`,
                  borderRadius: radii.full, padding: `4px ${space[3]}px`,
                  cursor: "pointer", marginBottom: space[3],
                }}
              >
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            )}
            {showHint && card.hint && (
              <div style={{
                ...text.secondary, color: colors.plumLight,
                fontStyle: "italic", marginBottom: space[3],
                padding: `${space[2]}px ${space[3]}px`,
                backgroundColor: `${colors.plumLight}15`,
                borderRadius: radii.sm,
              }}>
                {card.hint}
              </div>
            )}

            {/* Answer input */}
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your answer before revealing..."
              rows={3}
              style={{
                width: "100%", padding: space[3], ...text.body,
                backgroundColor: colors.bgInput, color: colors.textPrimary,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radii.sm, resize: "vertical",
                outline: "none", boxSizing: "border-box",
              }}
            />

            {/* Reveal button */}
            <button
              onClick={handleReveal}
              disabled={!userAnswer.trim()}
              style={{
                marginTop: space[3], width: "100%",
                padding: `${space[3]}px`, fontWeight: 600,
                fontFamily: fonts.display, fontSize: 14,
                backgroundColor: userAnswer.trim() ? colors.coral : colors.bgElevated,
                color: userAnswer.trim() ? colors.bgDeep : colors.textMuted,
                border: "none", borderRadius: radii.full,
                cursor: userAnswer.trim() ? "pointer" : "not-allowed",
              }}
            >
              Reveal Answer
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: colors.bgSurface, borderRadius: radii.md,
              padding: space[5], minHeight: 200,
              border: `1px solid ${colors.borderDefault}`,
            }}
          >
            {/* Your answer */}
            <div style={{ marginBottom: space[4] }}>
              <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[1] }}>YOUR ANSWER</div>
              <div style={{
                ...text.body, color: colors.textSecondary,
                padding: `${space[2]}px ${space[3]}px`,
                backgroundColor: colors.bgRecessed,
                borderRadius: radii.sm,
              }}>
                {userAnswer}
              </div>
            </div>

            {/* Correct answer */}
            <div style={{ marginBottom: space[5] }}>
              <div style={{ ...text.caption, color: colors.coral, marginBottom: space[1] }}>CORRECT ANSWER</div>
              <div style={{
                ...text.body, color: colors.textPrimary,
                padding: `${space[2]}px ${space[3]}px`,
                backgroundColor: colors.coralWash,
                borderRadius: radii.sm,
                borderLeft: `3px solid ${colors.coral}`,
                lineHeight: 1.7,
              }}>
                {card.answer}
              </div>
            </div>

            {/* Self-assessment */}
            <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[2] }}>HOW DID YOU DO?</div>
            <div style={{ display: "flex", gap: space[2] }}>
              {([
                { key: "got-it" as Confidence, label: "Got It", color: colors.success },
                { key: "partially" as Confidence, label: "Partially", color: colors.warning },
                { key: "missed" as Confidence, label: "Missed", color: colors.error },
              ]).map((opt) => (
                <motion.button
                  key={opt.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAssess(opt.key)}
                  style={{
                    flex: 1, padding: `${space[3]}px`,
                    backgroundColor: `${opt.color}22`,
                    border: `1px solid ${opt.color}`,
                    borderRadius: radii.sm,
                    color: opt.color, fontWeight: 600,
                    fontFamily: fonts.display, fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: space[4] }}>
        {cards.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: radii.full,
              backgroundColor: i < currentIndex
                ? (results[i]?.confidence === "got-it" ? colors.success : results[i]?.confidence === "partially" ? colors.warning : colors.error)
                : i === currentIndex ? colors.coral : colors.bgElevated,
            }}
          />
        ))}
      </div>
    </div>
  );
}
