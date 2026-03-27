"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface ExerciseStep {
  instruction: string;
  duration?: number; // seconds for breathing step
  type?: "breathe" | "text";
}

interface GuidedExerciseCardProps {
  title: string;
  icon: React.ReactNode;
  steps: ExerciseStep[];
}

function BreathingCircle() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0 16px" }}>
      <div style={{ position: "relative", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1.4, 1],
            opacity: [0.15, 0.3, 0.3, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            times: [0, 0.33, 0.58, 1],
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.coral}30 0%, transparent 70%)`,
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1.5, 1],
            opacity: [0.25, 0.5, 0.5, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            times: [0, 0.33, 0.58, 1],
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: `1px solid ${colors.coral}25`,
          }}
        />
        {/* Core orb */}
        <motion.div
          animate={{
            scale: [1, 1.6, 1.6, 1],
            opacity: [0.7, 1, 1, 0.7],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            times: [0, 0.33, 0.58, 1],
            ease: "easeInOut",
          }}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${colors.coralLight}, ${colors.coral} 50%, ${colors.coral} 100%)`,
            boxShadow: `0 0 40px ${colors.coral}35, inset 0 -4px 12px ${colors.coral}40`,
          }}
        />
      </div>
      {/* Instruction text */}
      <motion.p
        animate={{
          opacity: [1, 1, 0.4, 0.4, 1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, times: [0, 0.3, 0.33, 0.55, 0.58, 1] }}
        style={{
          fontSize: 13, color: colors.textMuted, fontFamily: display,
          fontWeight: 500, margin: 0, letterSpacing: "0.06em",
        }}
      >
        <motion.span
          animate={{ opacity: [1, 1, 0, 0, 0, 1] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.30, 0.32, 0.56, 0.58, 1] }}
        >
          breathe in...
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
          transition={{ duration: 12, repeat: Infinity, times: [0, 0.32, 0.34, 0.56, 0.58, 1] }}
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
        >
          hold...
        </motion.span>
      </motion.p>
    </div>
  );
}

export default function GuidedExerciseCard({ title, icon, steps }: GuidedExerciseCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  function handleStart() {
    setIsActive(true);
    setCurrentStep(0);
    setIsDone(false);
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsDone(true);
      setIsActive(false);
    }
  }

  function handleReset() {
    setIsActive(false);
    setCurrentStep(0);
    setIsDone(false);
  }

  const step = steps[currentStep];

  return (
    <motion.div
      layout
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${isDone ? colors.coral : colors.borderDefault}`,
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      {/* Header — always visible */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          cursor: !isActive ? "pointer" : "default",
        }}
        onClick={!isActive && !isDone ? handleStart : undefined}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon}
          <p style={{
            fontFamily: display, fontSize: 14, fontWeight: 700,
            color: colors.textPrimary, margin: 0,
          }}>
            {title}
          </p>
        </div>

        {!isActive && !isDone && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); handleStart(); }}
            style={{
              padding: "6px 18px", fontSize: 12, fontWeight: 600,
              fontFamily: display, borderRadius: 100, cursor: "pointer",
              border: `1px solid ${colors.borderDefault}`,
              backgroundColor: "transparent", color: colors.textSecondary,
            }}
          >
            Start
          </motion.button>
        )}

        {isDone && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinecap="round">
              <motion.path
                d="M20 6L9 17l-5-5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: display, color: colors.coral }}>
              Done
            </span>
            <button
              onClick={handleReset}
              style={{
                fontSize: 11, color: colors.textMuted, fontFamily: body,
                background: "none", border: "none", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              again
            </button>
          </div>
        )}
      </div>

      {/* Steps — active */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 20px 20px",
              borderTop: `1px solid ${colors.borderDefault}`,
              paddingTop: 16,
            }}>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor: i <= currentStep ? colors.coral : colors.bgElevated,
                      scale: i === currentStep ? 1.3 : 1,
                      boxShadow: i === currentStep ? `0 0 8px ${colors.coral}40` : "none",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      backgroundColor: i <= currentStep ? colors.coral : colors.bgElevated,
                    }}
                  />
                ))}
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {step?.type === "breathe" && <BreathingCircle />}
                  <p style={{
                    fontSize: 14, color: colors.textBody, lineHeight: 1.7,
                    margin: 0, fontFamily: body,
                  }}>
                    {step?.instruction}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Next / Finish button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                style={{
                  marginTop: 16, padding: "10px 28px",
                  fontSize: 13, fontWeight: 600, fontFamily: display,
                  borderRadius: 100, cursor: "pointer", border: "none",
                  backgroundColor: colors.coral, color: colors.bgDeep,
                }}
              >
                {currentStep < steps.length - 1 ? "Next" : "Finish"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
