"use client";

import React, { useCallback, useRef, useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface SpectrumSliderProps {
  labels: string[];
  value: number;
  onChange?: (value: number) => void;
  showLabels?: boolean;
  description?: string;
}

/* ── Main Component ── */

export default function SpectrumSlider({
  labels,
  value,
  onChange,
  showLabels = true,
  description,
}: SpectrumSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const positionFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      return clamp(pct);
    },
    [value],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
      const next = positionFromEvent(e.clientX);
      onChange?.(next);
    },
    [onChange, positionFromEvent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const next = positionFromEvent(e.clientX);
      onChange?.(next);
    },
    [dragging, onChange, positionFromEvent],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Determine closest stage
  const stageCount = labels.length;
  const segmentSize = stageCount > 1 ? 100 / (stageCount - 1) : 100;
  const closestIndex =
    stageCount > 1 ? Math.round(value / segmentSize) : 0;
  const closestLabel = labels[Math.min(closestIndex, stageCount - 1)];

  return (
    <div style={{ fontFamily: fonts.body, userSelect: "none" }}>
      {/* Active stage label */}
      <div
        style={{
          textAlign: "center",
          marginBottom: space[3],
          fontFamily: text.heading.fontFamily,
          fontSize: text.heading.fontSize,
          fontWeight: text.heading.fontWeight,
          color: colors.coral,
          letterSpacing: text.heading.letterSpacing,
          transition: "color 0.2s",
        }}
      >
        {closestLabel}
      </div>

      {/* Track area */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          height: 48,
          cursor: "pointer",
          touchAction: "none",
          padding: `${space[3]}px 0`,
        }}
      >
        {/* Track background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 6,
            transform: "translateY(-50%)",
            backgroundColor: colors.bgElevated,
            borderRadius: radii.full,
          }}
        />

        {/* Filled track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${value}%`,
            height: 6,
            transform: "translateY(-50%)",
            background: `linear-gradient(90deg, ${colors.plum}, ${colors.coral})`,
            borderRadius: radii.full,
            transition: dragging ? "none" : "width 0.15s ease-out",
          }}
        />

        {/* Stage markers */}
        {labels.map((_, i) => {
          const pct = stageCount > 1 ? (i / (stageCount - 1)) * 100 : 50;
          const isActive = i === closestIndex;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: `${pct}%`,
                width: isActive ? 14 : 10,
                height: isActive ? 14 : 10,
                borderRadius: radii.full,
                backgroundColor: isActive ? colors.coral : colors.bgSurface,
                border: `2px solid ${isActive ? colors.coral : colors.borderDefault}`,
                transform: "translate(-50%, -50%)",
                transition: "all 0.2s ease",
                zIndex: 1,
              }}
            />
          );
        })}

        {/* Thumb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${value}%`,
            width: 24,
            height: 24,
            borderRadius: radii.full,
            backgroundColor: colors.coral,
            border: `3px solid ${colors.textPrimary}`,
            transform: "translate(-50%, -50%)",
            transition: dragging ? "none" : "left 0.15s ease-out",
            boxShadow: `0 0 ${dragging ? 16 : 10}px rgba(196, 148, 58, ${dragging ? 0.6 : 0.35})`,
            zIndex: 2,
          }}
        />
      </div>

      {/* Stage labels */}
      {showLabels && (
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            marginTop: space[2],
          }}
        >
          {labels.map((label, i) => {
            const isActive = i === closestIndex;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign:
                    i === 0
                      ? "left"
                      : i === stageCount - 1
                        ? "right"
                        : "center",
                  fontFamily: text.caption.fontFamily,
                  fontSize: text.caption.fontSize,
                  fontWeight: isActive ? 700 : text.caption.fontWeight,
                  letterSpacing: text.caption.letterSpacing,
                  color: isActive ? colors.coral : colors.textMuted,
                  transition: "color 0.2s, font-weight 0.2s",
                  lineHeight: text.caption.lineHeight,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {/* Description */}
      {description && (
        <div
          style={{
            marginTop: space[4],
            fontFamily: text.secondary.fontFamily,
            fontSize: text.secondary.fontSize,
            color: colors.textSecondary,
            lineHeight: text.secondary.lineHeight,
            textAlign: "center",
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
