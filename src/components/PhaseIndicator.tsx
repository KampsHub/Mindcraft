"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface PhaseIndicatorProps {
  activePhase: number; // 1, 2, or 3
  completedPhases: number[]; // e.g. [1] or [1, 2]
  onPhaseClick: (phase: number) => void;
  disabled?: number[]; // phases that can't be clicked
}

const PHASES = [
  { key: 1, label: "Tell" },
  { key: 2, label: "Do" },
  { key: 3, label: "Done" },
];

export default function PhaseIndicator({ activePhase, completedPhases, onPhaseClick, disabled = [] }: PhaseIndicatorProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px 0 28px 0",
      gap: 0,
    }}>
      {PHASES.map((phase, i) => {
        const isActive = activePhase === phase.key;
        const isCompleted = completedPhases.includes(phase.key);
        const isDisabled = disabled.includes(phase.key);
        const canClick = (isCompleted || isActive) && !isDisabled;

        return (
          <div key={phase.key} style={{ display: "flex", alignItems: "center" }}>
            {/* Dot */}
            <button
              onClick={() => canClick && onPhaseClick(phase.key)}
              disabled={!canClick}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 8, background: "none", border: "none",
                cursor: canClick ? "pointer" : "default",
                padding: "0 4px",
              }}
            >
              <motion.div
                layout
                style={{
                  width: isActive ? 36 : 28,
                  height: isActive ? 36 : 28,
                  borderRadius: "50%",
                  backgroundColor: isCompleted
                    ? colors.coral
                    : isActive
                      ? colors.coral
                      : "transparent",
                  border: isCompleted || isActive
                    ? "none"
                    : `2px solid rgba(255,255,255,${isDisabled ? "0.1" : "0.25"})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted && !isActive ? (
                  <motion.svg
                    width={14} height={14} viewBox="0 0 24 24"
                    fill="none" stroke={colors.bgDeep} strokeWidth={3}
                    strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.svg>
                ) : (
                  <span style={{
                    fontSize: isActive ? 14 : 12, fontWeight: 700,
                    color: isActive ? colors.bgDeep : isDisabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
                    fontFamily: display,
                  }}>
                    {phase.key}
                  </span>
                )}
              </motion.div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isActive
                  ? colors.coral
                  : isCompleted
                    ? "#ffffff"
                    : isDisabled
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.4)",
                fontFamily: display,
                letterSpacing: "0.03em",
              }}>
                {phase.label}
              </span>
            </button>

            {/* Connecting line */}
            {i < PHASES.length - 1 && (
              <div style={{
                width: "clamp(32px, 10vw, 60px)", height: 2, margin: "0 6px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 1,
                position: "relative",
                marginBottom: 24, // offset for label below dots
              }}>
                <motion.div
                  style={{
                    position: "absolute", top: 0, left: 0,
                    height: "100%", borderRadius: 1,
                    backgroundColor: colors.coral,
                  }}
                  initial={{ width: "0%" }}
                  animate={{
                    width: completedPhases.includes(phase.key) ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
