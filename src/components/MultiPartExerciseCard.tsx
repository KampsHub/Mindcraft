"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface ExercisePart {
  label: string;
  prompt: string;
  placeholder?: string;
}

interface MultiPartExerciseCardProps {
  parts: ExercisePart[];
  onComplete: (responses: Record<string, string>) => void;
  existingResponses?: Record<string, string>;
  accentColor?: string;
  accentBg?: string;
}

export default function MultiPartExerciseCard({
  parts,
  onComplete,
  existingResponses,
  accentColor = colors.coral,
  accentBg = colors.coralWash,
}: MultiPartExerciseCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    parts.forEach((_, i) => {
      init[`part_${i + 1}`] = existingResponses?.[`part_${i + 1}`] || "";
    });
    return init;
  });
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const currentKey = `part_${currentStep + 1}`;
  const currentValue = responses[currentKey] || "";
  const isLastStep = currentStep === parts.length - 1;
  const allFilled = parts.every((_, i) => responses[`part_${i + 1}`]?.trim());

  function handleNext() {
    if (isLastStep) {
      setShowSummary(true);
    } else {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  function handleSubmit() {
    if (allFilled) {
      onComplete(responses);
    }
  }

  function handleStepClick(index: number) {
    if (showSummary) {
      setShowSummary(false);
    }
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div>
      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {parts.map((_, i) => {
          const isActive = !showSummary && i === currentStep;
          const isCompleted = responses[`part_${i + 1}`]?.trim() !== "";
          return (
            <motion.button
              key={i}
              onClick={() => handleStepClick(i)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                backgroundColor: isActive
                  ? accentColor
                  : isCompleted
                  ? accentColor + "80"
                  : colors.bgElevated,
                scale: isActive ? 1.3 : 1,
                boxShadow: isActive ? `0 0 10px ${accentColor}40` : "none",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
          );
        })}
        {/* Summary dot */}
        <motion.div
          animate={{
            backgroundColor: showSummary ? accentColor : colors.bgElevated,
            scale: showSummary ? 1.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            width: 10,
            height: 10,
            borderRadius: 3,
            marginLeft: 4,
          }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {!showSummary ? (
          <motion.div
            key={`step-${currentStep}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "3px 10px",
                  borderRadius: 100,
                  backgroundColor: accentBg,
                  color: accentColor,
                  fontFamily: display,
                }}
              >
                Part {currentStep + 1} of {parts.length}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.textSecondary,
                  fontFamily: display,
                }}
              >
                {parts[currentStep].label}
              </span>
            </div>

            {/* Prompt */}
            <p
              style={{
                fontSize: 14,
                color: colors.textBody,
                lineHeight: 1.7,
                margin: "0 0 14px 0",
                fontFamily: body,
              }}
            >
              {parts[currentStep].prompt}
            </p>

            {/* Textarea */}
            <textarea
              value={currentValue}
              onChange={(e) =>
                setResponses((prev) => ({
                  ...prev,
                  [currentKey]: e.target.value,
                }))
              }
              placeholder={
                parts[currentStep].placeholder ||
                "Take your time. Write what comes up..."
              }
              style={{
                width: "100%",
                minHeight: 110,
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
              onFocus={(e) => {
                e.target.style.borderColor = accentColor;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.borderDefault;
              }}
            />

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <motion.button
                whileHover={currentStep > 0 ? { scale: 1.04 } : {}}
                whileTap={currentStep > 0 ? { scale: 0.97 } : {}}
                onClick={handleBack}
                disabled={currentStep === 0}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: display,
                  borderRadius: 100,
                  cursor: currentStep === 0 ? "not-allowed" : "pointer",
                  border: `1px solid ${colors.borderDefault}`,
                  backgroundColor: "transparent",
                  color:
                    currentStep === 0
                      ? colors.textMuted + "50"
                      : colors.textSecondary,
                  transition: "all 0.2s",
                }}
              >
                Back
              </motion.button>

              <motion.button
                whileHover={
                  currentValue.trim()
                    ? {
                        scale: 1.04,
                        boxShadow: `0 6px 20px ${accentColor}30`,
                      }
                    : {}
                }
                whileTap={currentValue.trim() ? { scale: 0.97 } : {}}
                onClick={handleNext}
                disabled={!currentValue.trim()}
                style={{
                  padding: "10px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: display,
                  borderRadius: 100,
                  cursor: currentValue.trim() ? "pointer" : "not-allowed",
                  border: "none",
                  backgroundColor: currentValue.trim()
                    ? accentColor
                    : colors.bgElevated,
                  color: currentValue.trim()
                    ? colors.bgDeep
                    : colors.textMuted,
                  transition: "all 0.2s",
                }}
              >
                {isLastStep ? "Review" : "Next"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: accentColor,
                margin: "0 0 14px 0",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontFamily: display,
              }}
            >
              Review your responses
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {parts.map((part, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleStepClick(i)}
                  style={{
                    padding: "14px 16px",
                    backgroundColor: colors.bgRecessed,
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `1px solid transparent`,
                    transition: "border-color 0.2s",
                  }}
                  whileHover={{
                    borderColor: accentColor + "40",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: colors.textMuted,
                      margin: "0 0 6px 0",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontFamily: display,
                    }}
                  >
                    Part {i + 1}: {part.label}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.textBody,
                      margin: 0,
                      lineHeight: 1.55,
                      fontFamily: body,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {responses[`part_${i + 1}`]}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Submit + back */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: display,
                  borderRadius: 100,
                  cursor: "pointer",
                  border: `1px solid ${colors.borderDefault}`,
                  backgroundColor: "transparent",
                  color: colors.textSecondary,
                  transition: "all 0.2s",
                }}
              >
                Edit
              </motion.button>

              <motion.button
                whileHover={
                  allFilled
                    ? {
                        scale: 1.04,
                        boxShadow: `0 6px 20px ${accentColor}30`,
                      }
                    : {}
                }
                whileTap={allFilled ? { scale: 0.97 } : {}}
                onClick={handleSubmit}
                disabled={!allFilled}
                style={{
                  padding: "12px 28px",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: display,
                  borderRadius: 100,
                  cursor: allFilled ? "pointer" : "not-allowed",
                  border: "none",
                  backgroundColor: allFilled ? accentColor : colors.bgElevated,
                  color: allFilled ? colors.bgDeep : colors.textMuted,
                  transition: "all 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                Submit All Parts
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
