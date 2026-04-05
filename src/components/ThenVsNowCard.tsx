"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface ThenVsNowProps {
  weekNumber: number;
  firstDayRating: number | null;
  weekAvgRating: number | null;
  firstWeekExercises: number;
  currentWeekExercises: number;
  totalExercisesCompleted: number;
  journalEntryCount: number;
  daysCompleted: number;
}

function MetricCard({
  label,
  then,
  now,
  unit,
  delay,
}: {
  label: string;
  then: string;
  now: string;
  unit?: string;
  delay: number;
}) {
  const thenNum = parseFloat(then);
  const nowNum = parseFloat(now);
  const hasChange = !isNaN(thenNum) && !isNaN(nowNum) && thenNum > 0;
  const change = hasChange ? Math.round(((nowNum - thenNum) / thenNum) * 100) : null;
  const isPositive = change !== null && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        flex: 1,
        minWidth: 120,
        padding: 16,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 10,
        border: `1px solid ${colors.borderSubtle}`,
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: body,
          fontSize: 11,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        {label}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: display,
            fontSize: 14,
            color: colors.textMuted,
            textDecoration: "line-through",
            opacity: 0.6,
          }}
        >
          {then}
          {unit || ""}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M3 7h8M8 4l3 3-3 3"
            stroke={colors.coral}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            fontFamily: display,
            fontSize: 18,
            fontWeight: 700,
            color: colors.textPrimary,
          }}
        >
          {now}
          {unit || ""}
        </span>
      </div>

      {change !== null && (
        <span
          style={{
            fontFamily: body,
            fontSize: 11,
            color: isPositive ? "#8BC48A" : "#E08585",
            fontWeight: 600,
          }}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      )}
    </motion.div>
  );
}

export default function ThenVsNowCard({
  weekNumber,
  firstDayRating,
  weekAvgRating,
  firstWeekExercises,
  currentWeekExercises,
  totalExercisesCompleted,
  journalEntryCount,
  daysCompleted,
}: ThenVsNowProps) {
  // Only show if we have enough data for meaningful comparison
  if (weekNumber < 1 || daysCompleted < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: "rgba(139,196,138,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8BC48A"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <h3
          style={{
            fontFamily: display,
            fontSize: 15,
            fontWeight: 600,
            color: colors.textPrimary,
          }}
        >
          Your progress
        </h3>
        <span
          style={{
            fontFamily: body,
            fontSize: 12,
            color: colors.textMuted,
            marginLeft: "auto",
          }}
        >
          Day 1 → Week {weekNumber}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {firstDayRating !== null && weekAvgRating !== null && (
          <MetricCard
            label="Day rating"
            then={firstDayRating.toFixed(1)}
            now={weekAvgRating.toFixed(1)}
            delay={0.1}
          />
        )}

        <MetricCard
          label="Exercises"
          then={firstWeekExercises > 0 ? String(firstWeekExercises) : "0"}
          now={String(currentWeekExercises)}
          delay={0.2}
        />

        <MetricCard
          label="Days completed"
          then="1"
          now={String(daysCompleted)}
          delay={0.3}
        />
      </div>

      {/* Totals row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${colors.borderSubtle}`,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: body,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          {totalExercisesCompleted} exercises total
        </span>
        <span style={{ color: colors.borderDefault }}>·</span>
        <span
          style={{
            fontFamily: body,
            fontSize: 12,
            color: colors.textMuted,
          }}
        >
          {journalEntryCount} journal entries
        </span>
      </div>
    </motion.div>
  );
}
