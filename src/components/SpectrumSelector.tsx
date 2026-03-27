"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface SpectrumSelectorProps {
  leftLabel: string;
  rightLabel: string;
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function SpectrumSelector({
  leftLabel,
  rightLabel,
  value: controlledValue,
  onChange,
  min = 0,
  max = 100,
}: SpectrumSelectorProps) {
  const [internalValue, setInternalValue] = useState(
    controlledValue ?? Math.round((max - min) / 2)
  );
  const value = controlledValue ?? internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const motionValue = useMotionValue(value);
  const displayValue = useTransform(motionValue, (v) => Math.round(v));
  const numberRef = useRef<HTMLSpanElement>(null);

  // Keep motion value in sync
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    const controls = animate(motionValue, value, {
      type: "spring",
      stiffness: 300,
      damping: 30,
    });
    prevValue.current = value;
    // Cleanup not needed for a sync update; it auto-completes
    void controls;
  }

  // Subscribe to displayValue changes
  displayValue.on("change", (v) => {
    if (numberRef.current) numberRef.current.textContent = String(v);
  });

  const fillPercent = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const newValue = Math.round(min + percent * (max - min));
      setInternalValue(newValue);
      onChange(newValue);
    },
    [min, max, onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Labels row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.coral,
            fontFamily: display,
            letterSpacing: "0.01em",
          }}
        >
          {leftLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: colors.coral,
            fontFamily: display,
            letterSpacing: "0.01em",
          }}
        >
          {rightLabel}
        </span>
      </div>

      {/* Track area */}
      <div style={{ position: "relative", paddingTop: 36 }}>
        {/* Floating marker */}
        <motion.div
          animate={{ left: `${fillPercent}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "absolute",
            top: 0,
            left: `${fillPercent}%`,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <motion.div
            animate={{
              boxShadow: isDragging.current
                ? `0 0 16px ${colors.coral}50`
                : `0 0 8px ${colors.coral}25`,
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.bgSurface,
              border: `2px solid ${colors.coral}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.span
              ref={numberRef}
              style={{
                fontFamily: display,
                fontSize: 14,
                fontWeight: 800,
                color: colors.coral,
              }}
            >
              {value}
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Interactive track */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            position: "relative",
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.bgElevated,
            cursor: "pointer",
            touchAction: "none",
            overflow: "hidden",
          }}
        >
          {/* Gradient fill */}
          <motion.div
            animate={{ width: `${fillPercent}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              borderRadius: 6,
              background: `linear-gradient(90deg, ${colors.coral}, ${colors.coral})`,
            }}
          />
        </div>

        {/* Tick marks */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            padding: "0 2px",
          }}
        >
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              style={{
                width: 1,
                height: 6,
                backgroundColor: colors.borderDefault,
                opacity: 0.5,
              }}
            />
          ))}
        </div>

        {/* Min/Max labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: colors.textMuted,
              fontFamily: display,
            }}
          >
            {min}
          </span>
          <span
            style={{
              fontSize: 10,
              color: colors.textMuted,
              fontFamily: display,
            }}
          >
            {max}
          </span>
        </div>
      </div>
    </div>
  );
}
