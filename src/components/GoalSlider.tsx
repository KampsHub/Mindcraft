"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface GoalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function GoalSlider({
  value,
  onChange,
  min = 1,
  max = 10,
}: GoalSliderProps) {
  const motionValue = useMotionValue(value);
  const displayNumber = useTransform(motionValue, (v) => Math.round(v));
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = displayNumber.on("change", (v) => {
      if (numberRef.current) numberRef.current.textContent = String(v);
    });
    return unsubscribe;
  }, [displayNumber]);

  // Calculate fill percentage for gradient
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ position: "relative", paddingTop: 32 }}>
      {/* Floating number */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: `${fillPercent}%`,
          transform: "translateX(-50%)",
        }}
        animate={{ left: `${fillPercent}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.span
          ref={numberRef}
          style={{
            fontFamily: display,
            fontSize: 20,
            fontWeight: 800,
            color: colors.coral,
            display: "block",
            textAlign: "center",
            minWidth: 28,
          }}
        >
          {value}
        </motion.span>
      </motion.div>

      {/* Range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="goal-slider"
        style={{
          width: "100%",
          height: 8,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none",
          borderRadius: 4,
          cursor: "pointer",
          background: `linear-gradient(90deg, ${colors.coral} 0%, ${colors.coral} ${fillPercent}%, ${colors.bgElevated} ${fillPercent}%)`,
        }}
      />

      {/* Scale labels */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
      }}>
        <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: display }}>
          {min}
        </span>
        <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: display }}>
          {max}
        </span>
      </div>
    </div>
  );
}
