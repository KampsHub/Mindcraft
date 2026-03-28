"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { colors, fonts, space, radii } from "@/lib/theme";

interface EmotionWheelProps {
  onSelect?: (emotion: string, intensity: "mild" | "moderate" | "intense") => void;
  selected?: { emotion: string; intensity: string }[];
  showLabels?: boolean;
}

const EMOTIONS = [
  "joy",
  "trust",
  "fear",
  "surprise",
  "sadness",
  "disgust",
  "anger",
  "anticipation",
] as const;

const INTENSITIES = ["intense", "moderate", "mild"] as const; // inner to outer

const EMOTION_HUES: Record<string, string> = {
  joy: "#D4A84E",
  trust: "#6AB282",
  fear: "#5E8E6E",
  surprise: "#6AA8C4",
  sadness: "#7B8EC4",
  disgust: "#9B7BC4",
  anger: "#C47B7B",
  anticipation: "#C4943A",
};

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_RADIUS = SIZE / 2 - 20;
const RING_WIDTH = OUTER_RADIUS / 3;

function intensityIndex(intensity: string): number {
  return INTENSITIES.indexOf(intensity as (typeof INTENSITIES)[number]);
}

function getArcRadius(ring: number): { inner: number; outer: number } {
  const inner = ring * RING_WIDTH;
  const outer = (ring + 1) * RING_WIDTH;
  return { inner: Math.max(inner, 8), outer };
}

function adjustColor(hex: string, ring: number): string {
  // ring 0 = intense (bright), 1 = moderate, 2 = mild (muted)
  const color = d3.color(hex);
  if (!color) return hex;
  const hsl = d3.hsl(color);
  hsl.s = Math.max(0.15, hsl.s - ring * 0.15);
  hsl.l = Math.min(0.7, hsl.l + ring * 0.1);
  return hsl.formatHex();
}

function isSelected(
  sel: { emotion: string; intensity: string }[] | undefined,
  emotion: string,
  intensity: string
): boolean {
  return !!sel?.some((s) => s.emotion === emotion && s.intensity === intensity);
}

export default function EmotionWheel({
  onSelect,
  selected = [],
  showLabels = true,
}: EmotionWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const segments = useMemo(() => {
    const sectorAngle = (Math.PI * 2) / EMOTIONS.length;
    const result: {
      emotion: string;
      intensity: (typeof INTENSITIES)[number];
      ring: number;
      path: string;
      color: string;
      labelX: number;
      labelY: number;
      startAngle: number;
      endAngle: number;
    }[] = [];

    EMOTIONS.forEach((emotion, ei) => {
      const startAngle = ei * sectorAngle - Math.PI / 2;
      const endAngle = startAngle + sectorAngle;

      INTENSITIES.forEach((intensity, ring) => {
        const { inner, outer } = getArcRadius(ring);
        const arcGen = d3
          .arc<unknown>()
          .innerRadius(inner)
          .outerRadius(outer)
          .startAngle(startAngle + Math.PI / 2)
          .endAngle(endAngle + Math.PI / 2)
          .padAngle(0.02)
          .cornerRadius(2);

        const path = arcGen(null as unknown as d3.DefaultArcObject) || "";
        const midAngle = (startAngle + endAngle) / 2;
        const midRadius = (inner + outer) / 2;
        const labelX = CENTER + midRadius * Math.cos(midAngle);
        const labelY = CENTER + midRadius * Math.sin(midAngle);

        result.push({
          emotion,
          intensity,
          ring,
          path,
          color: adjustColor(EMOTION_HUES[emotion], ring),
          labelX,
          labelY,
          startAngle,
          endAngle,
        });
      });
    });

    return result;
  }, []);

  const handleClick = (emotion: string, intensity: (typeof INTENSITIES)[number]) => {
    onSelect?.(emotion, intensity);
  };

  return (
    <div
      style={{
        background: colors.bgDeep,
        borderRadius: radii.lg,
        padding: space[5],
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space[4],
        border: `1px solid ${colors.borderDefault}`,
      }}
    >
      {/* Wheel */}
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ maxWidth: "100%", height: "auto" }}
      >
        <g transform={`translate(${CENTER}, ${CENTER})`}>
          {segments.map((seg) => {
            const key = `${seg.emotion}-${seg.intensity}`;
            const active = isSelected(selected, seg.emotion, seg.intensity);
            const hovered = hoveredSegment === key;

            return (
              <g key={key}>
                <path
                  d={seg.path}
                  fill={seg.color}
                  opacity={hovered ? 1 : active ? 0.95 : 0.7}
                  stroke={active ? colors.coral : "transparent"}
                  strokeWidth={active ? 2.5 : 0}
                  style={{
                    cursor: "pointer",
                    transition: "opacity 0.15s, stroke 0.15s",
                    filter: active
                      ? `drop-shadow(0 0 8px ${colors.coral})`
                      : "none",
                  }}
                  onClick={() => handleClick(seg.emotion, seg.intensity)}
                  onMouseEnter={() => setHoveredSegment(key)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
                {showLabels && seg.ring === 2 && (
                  <text
                    x={seg.labelX - CENTER}
                    y={seg.labelY - CENTER}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={colors.textPrimary}
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 10,
                      fontWeight: 600,
                      pointerEvents: "none",
                      textTransform: "capitalize",
                    }}
                  >
                    {seg.emotion}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Ring labels */}
        {showLabels && (
          <g>
            {INTENSITIES.map((label, ring) => {
              const { inner, outer } = getArcRadius(ring);
              const r = (inner + outer) / 2;
              return (
                <text
                  key={label}
                  x={CENTER + r + 2}
                  y={CENTER - 4}
                  fill={colors.textMuted}
                  style={{
                    fontFamily: fonts.bodyAlt,
                    fontSize: 9,
                    pointerEvents: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: space[2],
            justifyContent: "center",
          }}
        >
          {selected.map((s) => (
            <button
              key={`${s.emotion}-${s.intensity}`}
              onClick={() =>
                onSelect?.(s.emotion, s.intensity as "mild" | "moderate" | "intense")
              }
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: space[1],
                padding: `${space[1]}px ${space[3]}px`,
                fontFamily: fonts.display,
                fontSize: 12,
                fontWeight: 600,
                color: colors.textPrimary,
                backgroundColor: colors.bgElevated,
                border: `1px solid ${colors.coral}`,
                borderRadius: radii.full,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "background-color 0.15s",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    EMOTION_HUES[s.emotion] || colors.plum,
                  display: "inline-block",
                }}
              />
              {s.emotion}{" "}
              <span style={{ color: colors.textMuted, fontWeight: 400 }}>
                ({s.intensity})
              </span>
              <span style={{ marginLeft: 2, color: colors.textMuted }}>
                x
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
