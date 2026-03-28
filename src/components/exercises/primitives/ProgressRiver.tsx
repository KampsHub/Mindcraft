"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface DayData {
  day: number;
  completed: boolean;
  rating?: number;
  keyMoment?: string;
  exerciseName?: string;
  themes?: string[];
}

interface ProgressRiverProps {
  days: DayData[];
  currentDay: number;
  programName?: string;
  weekNames?: string[];
}

/* ── Constants ── */

const DAY_GAP = 56;
const PAD_X = 48;
const PAD_Y = 40;
const SVG_HEIGHT = 220;
const RIVER_CENTER = SVG_HEIGHT / 2;
const MIN_HALF = 6;
const MAX_HALF = 28;
const DOT_R = 6;

const WEEK_COLORS = [
  "rgba(123, 82, 120, 0.08)",
  "rgba(196, 148, 58, 0.06)",
  "rgba(123, 82, 120, 0.06)",
  "rgba(196, 148, 58, 0.08)",
];

/* ── Helpers ── */

function halfWidth(rating?: number): number {
  if (rating == null) return (MIN_HALF + MAX_HALF) / 2;
  return MIN_HALF + ((rating - 1) / 9) * (MAX_HALF - MIN_HALF);
}

function buildRiverPath(days: DayData[], totalW: number): string {
  if (days.length === 0) return "";
  const pts = days.map((d, i) => ({ x: PAD_X + i * DAY_GAP, hw: halfWidth(d.rating) }));

  // top edge (left to right)
  let top = `M ${pts[0].x} ${RIVER_CENTER - pts[0].hw}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    top += ` C ${cx} ${RIVER_CENTER - pts[i - 1].hw}, ${cx} ${RIVER_CENTER - pts[i].hw}, ${pts[i].x} ${RIVER_CENTER - pts[i].hw}`;
  }

  // bottom edge (right to left)
  let bot = ` L ${pts[pts.length - 1].x} ${RIVER_CENTER + pts[pts.length - 1].hw}`;
  for (let i = pts.length - 2; i >= 0; i--) {
    const cx = (pts[i + 1].x + pts[i].x) / 2;
    bot += ` C ${cx} ${RIVER_CENTER + pts[i + 1].hw}, ${cx} ${RIVER_CENTER + pts[i].hw}, ${pts[i].x} ${RIVER_CENTER + pts[i].hw}`;
  }

  return top + bot + " Z";
}

/* ── Tooltip ── */

function Tooltip({ day, x, y }: { day: DayData; x: number; y: number }) {
  return (
    <foreignObject x={x - 90} y={y - 105} width={180} height={100}>
      <div
        style={{
          backgroundColor: colors.bgElevated,
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: radii.sm,
          padding: `${space[2]}px ${space[3]}px`,
          pointerEvents: "none",
        }}
      >
        <div style={{ ...text.caption, color: colors.coral, marginBottom: 2 }}>
          Day {day.day}{day.rating != null ? ` — ${day.rating}/10` : ""}
        </div>
        {day.exerciseName && (
          <div style={{ ...text.secondary, color: colors.textSecondary, marginBottom: 2 }}>
            {day.exerciseName}
          </div>
        )}
        {day.keyMoment && (
          <div style={{ ...text.secondary, color: colors.textMuted, fontStyle: "italic" }}>
            {day.keyMoment}
          </div>
        )}
      </div>
    </foreignObject>
  );
}

/* ── Component ── */

export default function ProgressRiver({
  days,
  currentDay,
  programName,
  weekNames = ["GROUND", "DIG", "BUILD", "INTEGRATE"],
}: ProgressRiverProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const totalDays = days.length || 30;
  const svgWidth = PAD_X * 2 + (totalDays - 1) * DAY_GAP;

  // Scroll to current day on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const target = PAD_X + (currentDay - 1) * DAY_GAP - scrollRef.current.clientWidth / 2;
    scrollRef.current.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [currentDay]);

  const riverPath = useMemo(() => buildRiverPath(days, svgWidth), [days, svgWidth]);

  const weekBounds = useMemo(() => {
    const daysPerWeek = Math.ceil(totalDays / weekNames.length);
    return weekNames.map((name, wi) => {
      const start = wi * daysPerWeek;
      const end = Math.min(start + daysPerWeek, totalDays) - 1;
      const x1 = PAD_X + start * DAY_GAP - DAY_GAP / 2;
      const x2 = PAD_X + end * DAY_GAP + DAY_GAP / 2;
      return { name, x1, x2, color: WEEK_COLORS[wi % WEEK_COLORS.length] };
    });
  }, [totalDays, weekNames]);

  const onDotEnter = useCallback((day: number) => setHovered(day), []);
  const onDotLeave = useCallback(() => setHovered(null), []);

  return (
    <div style={{ fontFamily: fonts.body }}>
      {/* Header */}
      {programName && (
        <div
          style={{
            ...text.caption,
            color: colors.textMuted,
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            marginBottom: space[2],
          }}
        >
          {programName} — Your Journey
        </div>
      )}

      {/* Scrollable river */}
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          borderRadius: radii.md,
          backgroundColor: colors.bgRecessed,
          border: `1px solid ${colors.borderSubtle}`,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <svg
          width={svgWidth}
          height={SVG_HEIGHT + PAD_Y}
          viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT + PAD_Y}`}
          style={{ display: "block" }}
        >
          {/* Week background bands */}
          {weekBounds.map((w) => (
            <g key={w.name}>
              <rect
                x={w.x1}
                y={0}
                width={w.x2 - w.x1}
                height={SVG_HEIGHT + PAD_Y}
                fill={w.color}
              />
              <text
                x={(w.x1 + w.x2) / 2}
                y={18}
                textAnchor="middle"
                style={{
                  fontSize: 10,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fill: colors.textMuted,
                  letterSpacing: "0.08em",
                }}
              >
                {w.name}
              </text>
              {/* Week divider line */}
              <line
                x1={w.x2}
                y1={0}
                x2={w.x2}
                y2={SVG_HEIGHT + PAD_Y}
                stroke={colors.borderSubtle}
                strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* River body */}
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.coral} stopOpacity={0.25} />
              <stop offset="50%" stopColor={colors.plum} stopOpacity={0.15} />
              <stop offset="100%" stopColor={colors.coral} stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <path d={riverPath} fill="url(#riverGrad)" />

          {/* Center flow line */}
          <line
            x1={PAD_X}
            y1={RIVER_CENTER}
            x2={PAD_X + (totalDays - 1) * DAY_GAP}
            y2={RIVER_CENTER}
            stroke={colors.plum}
            strokeWidth={1}
            strokeOpacity={0.3}
          />

          {/* Day dots */}
          {days.map((d) => {
            const cx = PAD_X + (d.day - 1) * DAY_GAP;
            const cy = RIVER_CENTER;
            const isCurrent = d.day === currentDay;
            const isHovered = hovered === d.day;

            let fill = colors.borderDefault;
            let stroke = "none";
            let r = DOT_R;

            if (d.completed) {
              fill = colors.coral;
            } else if (isCurrent) {
              fill = colors.coral;
            } else {
              fill = "transparent";
              stroke = colors.textMuted;
            }

            if (isHovered) r = DOT_R + 2;

            return (
              <g key={d.day}>
                {/* Pulse for current day */}
                {isCurrent && (
                  <circle cx={cx} cy={cy} r={DOT_R + 4} fill="none" stroke={colors.coral}>
                    <animate
                      attributeName="r"
                      values={`${DOT_R + 2};${DOT_R + 10};${DOT_R + 2}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                  style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                  onMouseEnter={() => onDotEnter(d.day)}
                  onMouseLeave={onDotLeave}
                />

                {/* Day number below */}
                <text
                  x={cx}
                  y={RIVER_CENTER + DOT_R + 16}
                  textAnchor="middle"
                  style={{
                    fontSize: 9,
                    fontFamily: fonts.display,
                    fill: isCurrent ? colors.coral : colors.textMuted,
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {d.day}
                </text>

                {/* Theme tags */}
                {d.themes && d.themes.length > 0 && d.completed && (
                  <text
                    x={cx}
                    y={RIVER_CENTER - halfWidth(d.rating) - 10}
                    textAnchor="middle"
                    style={{
                      fontSize: 8,
                      fontFamily: fonts.bodyAlt,
                      fill: colors.plumLight,
                    }}
                  >
                    {d.themes[0]}
                  </text>
                )}

                {/* Tooltip on hover */}
                {isHovered && <Tooltip day={d} x={cx} y={cy} />}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: space[5],
          marginTop: space[3],
          justifyContent: "center",
        }}
      >
        {[
          { label: "Completed", color: colors.coral, filled: true },
          { label: "Current", color: colors.coral, filled: true, pulse: true },
          { label: "Upcoming", color: colors.textMuted, filled: false },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: space[1] }}>
            <svg width={14} height={14}>
              <circle
                cx={7}
                cy={7}
                r={5}
                fill={item.filled ? item.color : "transparent"}
                stroke={item.filled ? "none" : item.color}
                strokeWidth={1.5}
              />
            </svg>
            <span style={{ ...text.caption, color: colors.textMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
