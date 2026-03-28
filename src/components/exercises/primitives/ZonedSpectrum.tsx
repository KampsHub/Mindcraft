"use client";
import React, { useCallback, useRef, useState } from "react";
import { colors, space, radii, text } from "@/lib/theme";

interface SpectrumZone {
  id: string; label: string; fromPercent: number; toPercent: number;
  color: string; guidance: string;
}
interface ZonedSpectrumProps {
  zones: SpectrumZone[]; value: number; onChange?: (value: number) => void;
  leftLabel?: string; rightLabel?: string; title?: string;
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

function findZone(zones: SpectrumZone[], v: number) {
  return zones.find((z) => v >= z.fromPercent && v < z.toPercent)
    ?? zones.find((z) => v === z.toPercent && z.toPercent === 100);
}

export default function ZonedSpectrum({
  zones, value, onChange, leftLabel, rightLabel, title,
}: ZonedSpectrumProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const posFrom = useCallback((e: PointerEvent | React.PointerEvent) => {
    const r = trackRef.current?.getBoundingClientRect();
    return r ? clamp(((e.clientX - r.left) / r.width) * 100) : value;
  }, [value]);

  const onDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    onChange?.(Math.round(posFrom(e)));
  }, [onChange, posFrom]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (dragging) onChange?.(Math.round(posFrom(e)));
  }, [dragging, onChange, posFrom]);

  const onUp = useCallback(() => setDragging(false), []);
  const cur = findZone(zones, value);

  return (
    <div style={{ background: colors.bgDeep, padding: space[5], borderRadius: radii.lg }}>
      {title && (
        <div style={{ ...text.heading, color: colors.textPrimary, marginBottom: space[4] }}>
          {title}
        </div>
      )}
      {/* Zone labels */}
      <div style={{ position: "relative", height: 20, marginBottom: space[1] }}>
        {zones.map((z) => (
          <span key={z.id} style={{
            position: "absolute", left: `${z.fromPercent}%`,
            width: `${z.toPercent - z.fromPercent}%`, textAlign: "center",
            ...text.caption, color: cur?.id === z.id ? z.color : colors.textMuted,
            transition: "color 0.25s", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{z.label}</span>
        ))}
      </div>
      {/* Track */}
      <div ref={trackRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        style={{ position: "relative", height: 18, borderRadius: radii.full,
          overflow: "hidden", cursor: "pointer", display: "flex", touchAction: "none" }}>
        {zones.map((z) => (
          <div key={z.id} style={{
            flex: `0 0 ${z.toPercent - z.fromPercent}%`, background: z.color,
            opacity: cur?.id === z.id ? 1 : 0.45, transition: "opacity 0.25s",
            position: "relative",
          }}>
            {z.fromPercent > 0 && (
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                width: 1, borderLeft: `1px dashed ${colors.bgDeep}` }} />
            )}
          </div>
        ))}
        {/* Thumb */}
        <div style={{
          position: "absolute", left: `${value}%`, top: "50%",
          transform: "translate(-50%, -50%)", width: 22, height: 22,
          borderRadius: radii.full, background: colors.textPrimary,
          border: `2px solid ${cur?.color ?? colors.coral}`,
          boxShadow: cur ? `0 0 8px ${cur.color}` : "0 0 6px rgba(0,0,0,0.4)",
          transition: dragging ? "none" : "left 0.15s, box-shadow 0.25s",
          zIndex: 2, pointerEvents: "none",
        }} />
        {/* Value label */}
        <div style={{
          position: "absolute", left: `${value}%`, top: -22,
          transform: "translateX(-50%)", ...text.caption,
          color: colors.textPrimary, pointerEvents: "none", zIndex: 3,
        }}>{value}</div>
      </div>
      {/* Pole labels */}
      {(leftLabel || rightLabel) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: space[2] }}>
          <span style={{ ...text.caption, color: colors.textMuted }}>{leftLabel}</span>
          <span style={{ ...text.caption, color: colors.textMuted }}>{rightLabel}</span>
        </div>
      )}
      {/* Guidance card */}
      {cur && (
        <div style={{ marginTop: space[4], padding: space[4], background: colors.bgSurface,
          borderRadius: radii.md, borderLeft: `3px solid ${cur.color}`,
          transition: "border-color 0.25s" }}>
          <div style={{ ...text.caption, color: cur.color, marginBottom: space[1] }}>
            {cur.label}
          </div>
          <div style={{ ...text.secondary, color: colors.textSecondary }}>
            {cur.guidance}
          </div>
        </div>
      )}
    </div>
  );
}
