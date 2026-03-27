"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface PatternChallengeData {
  pattern: string;
  challenge: string;
  counter_move: string;
  day_number: number;
  days_ago: number;
}

interface ActivePatternChallengeProps {
  challenge: PatternChallengeData;
  currentDayNumber: number;
}

export default function ActivePatternChallenge({
  challenge,
  currentDayNumber,
}: ActivePatternChallengeProps) {
  if (!challenge) return null;

  const dayOfChallenge = currentDayNumber - challenge.day_number + 1;
  const totalDays = 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "14px 18px",
        backgroundColor: "rgba(224, 149, 133, 0.12)",
        borderRadius: 12,
        borderLeft: `3px solid ${colors.coral}`,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.coral,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: display,
          }}
        >
          Active challenge
        </p>
        <span
          style={{
            fontSize: 11,
            color: colors.coral,
            fontFamily: body,
            fontWeight: 600,
          }}
        >
          Day {dayOfChallenge} of {totalDays}
        </span>
      </div>

      <p
        style={{
          fontSize: 14,
          color: colors.textBody,
          margin: "0 0 6px 0",
          lineHeight: 1.55,
          fontFamily: body,
          fontWeight: 600,
        }}
      >
        {challenge.pattern}
      </p>

      <p
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          margin: 0,
          fontFamily: body,
          fontStyle: "italic",
        }}
      >
        Counter-move: {challenge.counter_move}
      </p>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 10,
        }}
      >
        {Array.from({ length: totalDays }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor:
                i < dayOfChallenge ? colors.coral : colors.borderDefault,
              transition: "background-color 0.3s",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
