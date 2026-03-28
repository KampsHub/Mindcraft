"use client";

import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface DayStatus {
  dayNumber: number;
  completed: boolean;
  inProgress: boolean;
  isCurrent: boolean;
}

interface WeekProgressTrackerProps {
  days: DayStatus[];
  weekNumber: number;
  accentColor?: string;
}

export default function WeekProgressTracker({
  days,
  weekNumber,
  accentColor = colors.coral,
}: WeekProgressTrackerProps) {
  const completedCount = days.filter((d) => d.completed).length;

  return (
    <div style={{ marginTop: 18 }}>
      {/* Week label + count */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.textPrimary,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: display,
          }}
        >
          Week {weekNumber}
        </span>
        <span
          style={{
            fontSize: 11,
            color: colors.textPrimary,
            fontFamily: display,
            fontWeight: 500,
            opacity: 0.7,
          }}
        >
          {completedCount}/{days.length} days
        </span>
      </div>

      {/* Segmented progress bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {days.map((day) => (
          <div
            key={day.dayNumber}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: day.completed
                ? accentColor
                : day.isCurrent
                ? `${accentColor}66`
                : "rgba(255, 255, 255, 0.1)",
              transition: "background-color 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Day labels */}
      <div
        style={{
          display: "flex",
          gap: 4,
        }}
      >
        {days.map((day) => (
          <div
            key={day.dayNumber}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              fontWeight: day.isCurrent ? 700 : 500,
              color: day.isCurrent
                ? accentColor
                : day.completed
                ? "#ffffff"
                : "rgba(255, 255, 255, 0.35)",
              fontFamily: display,
            }}
          >
            {day.dayNumber}
          </div>
        ))}
      </div>
    </div>
  );
}
