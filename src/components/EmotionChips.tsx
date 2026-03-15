"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface EmotionCategory {
  primary: string;
  icon: string;
  secondary: string[];
}

const EMOTION_CATEGORIES: EmotionCategory[] = [
  {
    primary: "Joy",
    icon: "o",
    secondary: [
      "happy",
      "grateful",
      "content",
      "hopeful",
      "proud",
      "playful",
      "peaceful",
      "excited",
    ],
  },
  {
    primary: "Sadness",
    icon: "o",
    secondary: [
      "lonely",
      "grieving",
      "disappointed",
      "helpless",
      "empty",
      "melancholy",
      "nostalgic",
    ],
  },
  {
    primary: "Anger",
    icon: "o",
    secondary: [
      "frustrated",
      "resentful",
      "irritated",
      "bitter",
      "overwhelmed",
      "defensive",
      "impatient",
    ],
  },
  {
    primary: "Fear",
    icon: "o",
    secondary: [
      "anxious",
      "insecure",
      "worried",
      "panicked",
      "vulnerable",
      "nervous",
      "uncertain",
    ],
  },
  {
    primary: "Surprise",
    icon: "o",
    secondary: [
      "amazed",
      "confused",
      "stunned",
      "curious",
      "moved",
      "disoriented",
    ],
  },
  {
    primary: "Disgust",
    icon: "o",
    secondary: [
      "ashamed",
      "repulsed",
      "contemptuous",
      "embarrassed",
      "judgmental",
    ],
  },
];

// Category accent colors (subtle, on-theme)
const CATEGORY_COLORS: Record<string, string> = {
  Joy: "#6AB282",
  Sadness: "#818cf8",
  Anger: "#D25858",
  Fear: "#D6B65D",
  Surprise: "#B08DAD",
  Disgust: "#99929B",
};

interface EmotionChipsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  showOther?: boolean;
}

export default function EmotionChips({
  selected,
  onChange,
  showOther = true,
}: EmotionChipsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState("");

  function toggleEmotion(emotion: string) {
    if (selected.includes(emotion)) {
      onChange(selected.filter((e) => e !== emotion));
    } else {
      onChange([...selected, emotion]);
    }
  }

  function addOther() {
    const trimmed = otherValue.trim().toLowerCase();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setOtherValue("");
    }
  }

  function handleOtherKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOther();
    }
  }

  return (
    <div>
      {/* Instruction */}
      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          margin: "0 0 14px 0",
          fontFamily: body,
        }}
      >
        Select the emotions that resonate. Tap a category to see more.
      </p>

      {/* Category rows */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {EMOTION_CATEGORIES.map((cat) => {
          const catColor = CATEGORY_COLORS[cat.primary] || colors.coral;
          const isExpanded = expandedCategory === cat.primary;
          const hasSelectedInCategory = cat.secondary.some((e) =>
            selected.includes(e)
          );

          return (
            <div key={cat.primary}>
              {/* Category header button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() =>
                  setExpandedCategory(isExpanded ? null : cat.primary)
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 14px",
                  backgroundColor: isExpanded
                    ? catColor + "12"
                    : "transparent",
                  border: `1px solid ${
                    isExpanded
                      ? catColor + "30"
                      : hasSelectedInCategory
                      ? catColor + "20"
                      : colors.borderSubtle
                  }`,
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: catColor,
                      opacity: 0.7,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isExpanded ? catColor : colors.textSecondary,
                      fontFamily: display,
                    }}
                  >
                    {cat.primary}
                  </span>
                  {hasSelectedInCategory && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 100,
                        backgroundColor: catColor + "20",
                        color: catColor,
                        fontFamily: display,
                      }}
                    >
                      {cat.secondary.filter((e) => selected.includes(e)).length}
                    </span>
                  )}
                </div>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontSize: 10,
                    color: colors.textMuted,
                    display: "inline-block",
                  }}
                >
                  ▾
                </motion.span>
              </motion.button>

              {/* Secondary emotions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        padding: "10px 4px 4px 4px",
                      }}
                    >
                      {cat.secondary.map((emotion) => {
                        const isSelected = selected.includes(emotion);
                        return (
                          <motion.button
                            key={emotion}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            }}
                            onClick={() => toggleEmotion(emotion)}
                            style={{
                              padding: "6px 14px",
                              fontSize: 12,
                              fontWeight: isSelected ? 700 : 500,
                              fontFamily: body,
                              borderRadius: 100,
                              cursor: "pointer",
                              border: `1px solid ${
                                isSelected ? colors.coral : colors.borderDefault
                              }`,
                              backgroundColor: isSelected
                                ? colors.coralWash
                                : "transparent",
                              color: isSelected
                                ? colors.coral
                                : colors.textSecondary,
                              transition: "all 0.15s",
                            }}
                          >
                            {emotion}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Other input */}
      {showOther && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            type="text"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
            onKeyDown={handleOtherKeyDown}
            placeholder="Something else..."
            style={{
              flex: 1,
              padding: "8px 14px",
              fontSize: 13,
              fontFamily: body,
              backgroundColor: colors.bgInput,
              border: `1px solid ${colors.borderDefault}`,
              color: colors.textPrimary,
              borderRadius: 10,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.coral;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.borderDefault;
            }}
          />
          <motion.button
            whileHover={otherValue.trim() ? { scale: 1.05 } : {}}
            whileTap={otherValue.trim() ? { scale: 0.95 } : {}}
            onClick={addOther}
            disabled={!otherValue.trim()}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: display,
              borderRadius: 10,
              cursor: otherValue.trim() ? "pointer" : "not-allowed",
              border: "none",
              backgroundColor: otherValue.trim()
                ? colors.coral
                : colors.bgElevated,
              color: otherValue.trim() ? colors.bgDeep : colors.textMuted,
              transition: "all 0.2s",
            }}
          >
            Add
          </motion.button>
        </div>
      )}

      {/* Selected summary chips */}
      {selected.length > 0 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${colors.borderSubtle}`,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: display,
            }}
          >
            Selected ({selected.length})
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {selected.map((emotion) => (
              <motion.span
                key={emotion}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: body,
                  borderRadius: 100,
                  backgroundColor: colors.coralWash,
                  color: colors.coral,
                  border: `1px solid ${colors.coral}30`,
                }}
              >
                {emotion}
                <button
                  onClick={() => toggleEmotion(emotion)}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.coral,
                    cursor: "pointer",
                    fontSize: 13,
                    padding: "0 0 0 1px",
                    lineHeight: 1,
                    opacity: 0.7,
                    fontWeight: 400,
                  }}
                >
                  x
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
