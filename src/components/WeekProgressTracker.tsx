"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface DayStatus {
  dayNumber: number;
  completed: boolean;
  inProgress: boolean; // started but not completed
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
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.textMuted,
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
            color: colors.textMuted,
            fontFamily: display,
            fontWeight: 500,
          }}
        >
          {completedCount}/{days.length} days
        </span>
      </div>

      {/* Day orbs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {days.map((day) => (
          <DayOrb
            key={day.dayNumber}
            day={day}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Connecting line (underneath) */}
      <div
        style={{
          position: "relative",
          height: 2,
          marginTop: -20,
          marginBottom: 18,
          marginLeft: 18,
          marginRight: 18,
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.borderSubtle,
            borderRadius: 1,
          }}
        />
        {completedCount > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((completedCount - 0.5) / (days.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: 2,
              backgroundColor: accentColor,
              borderRadius: 1,
              opacity: 0.5,
            }}
          />
        )}
      </div>
    </div>
  );
}

function DayOrb({
  day,
  accentColor,
}: {
  day: DayStatus;
  accentColor: string;
}) {
  const size = 36;
  const innerSize = day.isCurrent ? 28 : day.completed ? 24 : 20;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 1,
        position: "relative",
      }}
    >
      {/* Orb container */}
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Glow ring for current day */}
        {day.isCurrent && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: size + 4,
              height: size + 4,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Inner orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: day.dayNumber * 0.06,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            width: innerSize,
            height: innerSize,
            borderRadius: "50%",
            background: day.completed
              ? `radial-gradient(circle at 35% 35%, ${accentColor}, ${colors.plum})`
              : day.isCurrent
              ? `radial-gradient(circle at 35% 35%, ${accentColor}cc, ${accentColor}66)`
              : day.inProgress
              ? `radial-gradient(circle at 35% 35%, ${colors.bgElevated}, ${colors.bgSurface})`
              : colors.bgRecessed,
            border: day.isCurrent
              ? `2px solid ${accentColor}`
              : day.inProgress
              ? `1px solid ${colors.borderDefault}`
              : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: day.completed
              ? `0 2px 10px ${accentColor}40`
              : day.isCurrent
              ? `0 0 16px ${accentColor}30`
              : "none",
          }}
        >
          {day.completed && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: day.dayNumber * 0.06 + 0.2, type: "spring", stiffness: 500 }}
              style={{
                fontSize: 11,
                color: colors.bgDeep,
                fontWeight: 700,
              }}
            >
              ✓
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Day number label */}
      <span
        style={{
          fontSize: 10,
          fontWeight: day.isCurrent ? 700 : 500,
          color: day.isCurrent
            ? accentColor
            : day.completed
            ? colors.textSecondary
            : colors.textMuted,
          fontFamily: display,
          letterSpacing: "-0.01em",
        }}
      >
        {day.dayNumber}
      </span>
    </div>
  );
}
