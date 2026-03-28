"use client";

import React, { useEffect, useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface ComparisonDataPoint {
  label: string;
  values: { period: string; value: number }[];
}

interface BeforeAfterComparisonProps {
  title?: string;
  dataPoints: ComparisonDataPoint[];
  maxValue?: number;
  periods: string[];
}

/* ── Helpers ── */

const periodColor = (index: number, total: number): string => {
  if (index === 0) return colors.plum;
  if (index === total - 1) return colors.coral;
  return colors.textMuted;
};

const deltaColor = (delta: number): string =>
  delta < 0 ? colors.success : delta > 0 ? colors.error : colors.textMuted;

const deltaLabel = (delta: number): string =>
  delta > 0 ? `+${delta}` : `${delta}`;

/* ── Main Component ── */

export default function BeforeAfterComparison({
  title,
  dataPoints,
  maxValue = 10,
  periods,
}: BeforeAfterComparisonProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: radii.lg,
      border: `1px solid ${colors.borderDefault}`,
      padding: space[5],
      fontFamily: fonts.body,
    }}>
      {/* Header */}
      {title && (
        <h3 style={{
          ...text.heading,
          color: colors.textPrimary,
          margin: 0,
          marginBottom: space[4],
        }}>
          {title}
        </h3>
      )}

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: space[4],
        marginBottom: space[4],
        flexWrap: "wrap",
      }}>
        {periods.map((p, i) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: space[1] }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: radii.full,
              backgroundColor: periodColor(i, periods.length),
              display: "inline-block",
              flexShrink: 0,
            }} />
            <span style={{ ...text.caption, color: colors.textSecondary }}>{p}</span>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: space[3] }}>
        {dataPoints.map((dp) => {
          const first = dp.values[0]?.value ?? 0;
          const last = dp.values[dp.values.length - 1]?.value ?? 0;
          const delta = last - first;

          return (
            <div key={dp.label} style={{ display: "flex", alignItems: "center", gap: space[3] }}>
              {/* Label */}
              <div style={{
                ...text.secondary,
                color: colors.textPrimary,
                width: 120,
                flexShrink: 0,
                textAlign: "right",
              }}>
                {dp.label}
              </div>

              {/* Bars */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                {dp.values.map((v, i) => {
                  const pct = (v.value / maxValue) * 100;
                  const color = periodColor(i, dp.values.length);
                  return (
                    <div key={v.period} style={{ display: "flex", alignItems: "center", gap: space[2] }}>
                      <div style={{
                        flex: 1,
                        height: 14,
                        backgroundColor: colors.bgRecessed,
                        borderRadius: radii.sm,
                        overflow: "hidden",
                        position: "relative",
                      }}>
                        <div style={{
                          height: "100%",
                          width: animated ? `${pct}%` : "0%",
                          backgroundColor: color,
                          borderRadius: radii.sm,
                          transition: "width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                          transitionDelay: `${i * 120}ms`,
                        }} />
                      </div>
                      <span style={{
                        ...text.caption,
                        color: colors.textMuted,
                        width: 22,
                        textAlign: "right",
                        flexShrink: 0,
                      }}>
                        {v.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Delta */}
              <div style={{
                width: 44,
                flexShrink: 0,
                textAlign: "center",
              }}>
                {dp.values.length >= 2 && delta !== 0 && (
                  <span style={{
                    ...text.caption,
                    color: deltaColor(delta),
                    backgroundColor: delta < 0 ? colors.successWash : colors.errorWash,
                    padding: `2px ${space[2]}px`,
                    borderRadius: radii.sm,
                  }}>
                    {deltaLabel(delta)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: space[3],
        paddingLeft: 120 + space[3],
        paddingRight: 44 + space[3],
      }}>
        <span style={{ ...text.caption, color: colors.textMuted }}>0</span>
        <span style={{ ...text.caption, color: colors.textMuted }}>{maxValue}</span>
      </div>
    </div>
  );
}
