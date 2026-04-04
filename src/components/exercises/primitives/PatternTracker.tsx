"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { animate } from "motion";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface PatternTrackerEntry {
  day: number;
  patternId: string;
  intensity: number;
}

interface PatternTrackerProps {
  patterns: { id: string; label: string; color?: string }[];
  days?: number;
  entries: PatternTrackerEntry[];
  onChange?: (entries: PatternTrackerEntry[]) => void;
  currentDay?: number;
}

const CELL_SIZE = 44;
const INTENSITIES = 6; // 0-5
const INTENSITY_COLORS = [
  colors.bgRecessed,
  "rgba(196, 148, 58, 0.15)",
  "rgba(196, 148, 58, 0.3)",
  "rgba(196, 148, 58, 0.5)",
  "rgba(196, 148, 58, 0.7)",
  colors.coral,
];

function getEntry(entries: PatternTrackerEntry[], patternId: string, day: number): number {
  return entries.find((e) => e.patternId === patternId && e.day === day)?.intensity ?? 0;
}

function trendArrow(entries: PatternTrackerEntry[], patternId: string, days: number): { arrow: string; color: string } {
  const vals = Array.from({ length: days }, (_, i) => getEntry(entries, patternId, i + 1));
  const filled = vals.filter((v) => v > 0);
  if (filled.length < 2) return { arrow: "—", color: colors.textMuted };
  const firstHalf = filled.slice(0, Math.ceil(filled.length / 2));
  const secondHalf = filled.slice(Math.ceil(filled.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (avg2 > avg1 + 0.5) return { arrow: "↑", color: colors.error };
  if (avg2 < avg1 - 0.5) return { arrow: "↓", color: colors.success };
  return { arrow: "→", color: colors.textMuted };
}

function Sparkline({ entries, patternId, days, color }: { entries: PatternTrackerEntry[]; patternId: string; days: number; color: string }) {
  const vals = Array.from({ length: days }, (_, i) => getEntry(entries, patternId, i + 1));
  const max = 5;
  const w = 60;
  const h = 20;
  const points = vals.map((v, i) => `${(i / (days - 1)) * w},${h - (v / max) * h}`).join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {vals.map((v, i) =>
        v > 0 ? (
          <circle
            key={i}
            cx={(i / (days - 1)) * w}
            cy={h - (v / max) * h}
            r={2}
            fill={color}
          />
        ) : null,
      )}
    </svg>
  );
}

export default function PatternTracker({
  patterns,
  days = 7,
  entries,
  onChange,
  currentDay = 1,
}: PatternTrackerProps) {
  const currentColRef = useRef<HTMLTableHeaderCellElement>(null);

  // Pulse animation on current day column
  useEffect(() => {
    if (currentColRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (animate as any)(
        currentColRef.current,
        { borderColor: [colors.borderSubtle, colors.coral, colors.borderSubtle] },
        { duration: 2, repeat: 2, easing: "ease-in-out" },
      );
    }
  }, [currentDay]);

  const toggle = useCallback(
    (patternId: string, day: number) => {
      if (!onChange) return;
      const current = getEntry(entries, patternId, day);
      const next = (current + 1) % INTENSITIES;
      const updated = entries.filter((e) => !(e.patternId === patternId && e.day === day));
      if (next > 0) updated.push({ day, patternId, intensity: next });
      onChange(updated);
    },
    [entries, onChange],
  );

  return (
    <div style={{ backgroundColor: colors.bgDeep, borderRadius: radii.lg, padding: space[5], fontFamily: fonts.bodyAlt }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: space[3], marginBottom: space[4] }}>
        <div style={{
          width: 8, height: 8, borderRadius: radii.full,
          backgroundColor: colors.coral,
        }} />
        <span style={{ ...text.caption, color: colors.coral }}>
          DAY {currentDay} CHECK-IN
        </span>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "auto" }}>
          <thead>
            <tr>
              <th style={{ width: 140, textAlign: "left", ...text.secondary, color: colors.textMuted, paddingBottom: space[2] }}>
                Pattern
              </th>
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                <th
                  key={day}
                  ref={day === currentDay ? currentColRef : undefined}
                  style={{
                    width: CELL_SIZE,
                    textAlign: "center",
                    ...text.caption,
                    color: day === currentDay ? colors.coral : colors.textMuted,
                    fontWeight: day === currentDay ? 700 : 400,
                    paddingBottom: space[2],
                    borderBottom: day === currentDay ? `2px solid ${colors.coral}` : `1px solid transparent`,
                  }}
                >
                  D{day}
                </th>
              ))}
              <th style={{ width: 60, textAlign: "center", ...text.caption, color: colors.textMuted, paddingBottom: space[2] }}>
                Trend
              </th>
              <th style={{ width: 24, textAlign: "center", ...text.caption, color: colors.textMuted, paddingBottom: space[2] }}>
              </th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((pattern) => {
              const trend = trendArrow(entries, pattern.id, days);
              const patternColor = pattern.color || colors.coral;
              return (
                <tr key={pattern.id}>
                  <td style={{
                    ...text.secondary,
                    color: colors.textSecondary,
                    paddingRight: space[3],
                    paddingTop: space[1],
                    paddingBottom: space[1],
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {pattern.label}
                  </td>
                  {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
                    const intensity = getEntry(entries, pattern.id, day);
                    const isToday = day === currentDay;
                    return (
                      <td key={day} style={{ padding: 1 }}>
                        <div
                          onClick={() => toggle(pattern.id, day)}
                          style={{
                            width: CELL_SIZE - 2,
                            height: CELL_SIZE - 6,
                            borderRadius: radii.sm,
                            backgroundColor: INTENSITY_COLORS[intensity],
                            border: isToday ? `2px solid ${colors.coral}` : `1px solid ${colors.borderSubtle}`,
                            cursor: onChange ? "pointer" : "default",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.15s, transform 0.1s",
                          }}
                        >
                          {intensity > 0 && (
                            <span style={{ fontSize: 11, fontWeight: 700, color: intensity >= 3 ? colors.textPrimary : colors.textMuted }}>
                              {intensity}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <Sparkline entries={entries} patternId={pattern.id} days={days} color={patternColor} />
                  </td>
                  <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <span style={{ fontSize: 16, color: trend.color, fontWeight: 700 }}>
                      {trend.arrow}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: space[3], marginTop: space[4], flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ ...text.caption, color: colors.textMuted }}>Intensity:</span>
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <div key={v} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              backgroundColor: INTENSITY_COLORS[v],
              border: `1px solid ${colors.borderSubtle}`,
            }} />
            <span style={{ fontSize: 10, color: colors.textMuted }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
