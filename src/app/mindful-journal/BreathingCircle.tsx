"use client";

import { useState, useEffect, useRef } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const PHASES = [
  { label: "Breathe in", duration: 4000 },
  { label: "Hold", duration: 4000 },
  { label: "Breathe out", duration: 4000 },
  { label: "Hold", duration: 4000 },
];

export default function BreathingCircle() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    const phase = PHASES[phaseIndex];
    startRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / phase.duration, 1);
      setProgress(p);

      if (p >= 1) {
        const nextPhase = (phaseIndex + 1) % PHASES.length;
        setPhaseIndex(nextPhase);
        if (nextPhase === 0) setCycleCount((c) => c + 1);
        startRef.current = Date.now();
        setProgress(0);
      }
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, phaseIndex]);

  function handleToggle() {
    if (active) {
      setActive(false);
      setPhaseIndex(0);
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setCycleCount(0);
      setActive(true);
    }
  }

  // Circle size: expands on inhale (phase 0), stays expanded on hold (phase 1),
  // contracts on exhale (phase 2), stays contracted on hold (phase 3)
  let scale = 0.6; // base (contracted)
  if (phaseIndex === 0) scale = 0.6 + 0.4 * progress; // expanding
  else if (phaseIndex === 1) scale = 1.0; // fully expanded
  else if (phaseIndex === 2) scale = 1.0 - 0.4 * progress; // contracting
  else scale = 0.6; // contracted hold

  return (
    <div style={{
      backgroundColor: colors.bgRecessed,
      borderRadius: radii.lg,
      border: `1px solid ${colors.borderSubtle}`,
      padding: `${space[6]}px ${space[5]}px`,
      textAlign: "center",
    }}>
      <p style={{
        fontFamily: display, fontSize: 14, fontWeight: 600,
        color: colors.textPrimary, margin: `0 0 ${space[2]}px 0`,
      }}>
        Box Breathing
      </p>
      <p style={{
        fontFamily: body, fontSize: 12, color: colors.textMuted,
        margin: `0 0 ${space[5]}px 0`,
      }}>
        4 seconds in · 4 hold · 4 out · 4 hold
      </p>

      {/* Circle */}
      <div style={{
        width: 160, height: 160, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {/* Outer ring (static) */}
        <div style={{
          position: "absolute", width: 160, height: 160,
          borderRadius: "50%",
          border: `2px solid ${colors.borderSubtle}`,
        }} />

        {/* Breathing circle */}
        <div style={{
          width: 140, height: 140,
          borderRadius: "50%",
          backgroundColor: active ? `${colors.plum}33` : colors.bgSurface,
          border: `2px solid ${active ? colors.plumLight : colors.borderDefault}`,
          transform: `scale(${active ? scale : 0.6})`,
          transition: active ? "none" : "transform 0.3s",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          {active ? (
            <>
              <p style={{
                fontFamily: display, fontSize: 14, fontWeight: 600,
                color: colors.textPrimary, margin: 0,
              }}>
                {PHASES[phaseIndex].label}
              </p>
              <p style={{
                fontFamily: body, fontSize: 11, color: colors.textMuted,
                margin: "4px 0 0 0",
              }}>
                Cycle {cycleCount + 1}
              </p>
            </>
          ) : (
            <p style={{
              fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0,
            }}>
              Tap to start
            </p>
          )}
        </div>
      </div>

      {/* Control button */}
      <button
        onClick={handleToggle}
        style={{
          marginTop: space[4],
          padding: "8px 24px",
          fontSize: 13, fontWeight: 600, fontFamily: display,
          borderRadius: radii.full,
          border: active ? `1px solid ${colors.borderDefault}` : "none",
          backgroundColor: active ? "transparent" : colors.coral,
          color: active ? colors.textSecondary : colors.bgDeep,
          cursor: "pointer",
        }}
      >
        {active ? "Stop" : "Start breathing"}
      </button>
    </div>
  );
}
