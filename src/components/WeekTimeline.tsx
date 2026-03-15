"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface DaySession {
  day_number: number;
  step_2_journal: string;
  day_rating: number | null;
  completed_at: string | null;
}

interface WeekTimelineProps {
  sessions: DaySession[];
  weekStartDay: number;
}

export default function WeekTimeline({ sessions, weekStartDay }: WeekTimelineProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dayNum = weekStartDay + i;
    return sessions.find((s) => s.day_number === dayNum) || null;
  });

  const maxRating = 10;
  const barHeight = 120;

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{
        fontFamily: display, fontSize: 14, fontWeight: 600,
        color: colors.textMuted, margin: "0 0 14px 0",
        letterSpacing: "0.01em",
      }}>
        This week day by day
      </h3>

      {/* Bars */}
      <div style={{
        display: "flex", gap: 8, alignItems: "flex-end",
        height: barHeight + 32, padding: "0 4px",
        position: "relative",
      }}>
        {days.map((session, i) => {
          const dayNum = weekStartDay + i;
          const rating = session?.day_rating ?? 0;
          const isComplete = !!session?.completed_at;
          const height = rating > 0 ? (rating / maxRating) * barHeight : 0;
          const isHovered = hoveredDay === dayNum;

          return (
            <div
              key={dayNum}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                position: "relative",
              }}
              onMouseEnter={() => setHoveredDay(dayNum)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && session && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    style={{
                      position: "absolute",
                      bottom: barHeight + 16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: colors.bgElevated,
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: 10,
                      padding: "10px 14px",
                      width: 180,
                      zIndex: 10,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      pointerEvents: "none",
                    }}
                  >
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                      margin: "0 0 4px 0", fontFamily: display,
                    }}>
                      Day {dayNum} {session.day_rating ? `· ${session.day_rating}/10` : ""}
                    </p>
                    {session.step_2_journal && (
                      <p style={{
                        fontSize: 11, color: colors.textMuted, margin: 0,
                        fontFamily: body, lineHeight: 1.4,
                        overflow: "hidden", textOverflow: "ellipsis",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {session.step_2_journal}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar */}
              <div style={{
                width: "100%",
                height: barHeight,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}>
                {isComplete && rating > 0 ? (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: i * 0.08,
                    }}
                    style={{
                      width: "80%",
                      height,
                      borderRadius: "6px 6px 2px 2px",
                      background: `linear-gradient(180deg, ${colors.coral} 0%, ${colors.plum} 100%)`,
                      transformOrigin: "bottom",
                      cursor: "pointer",
                      opacity: isHovered ? 1 : 0.85,
                      transition: "opacity 0.15s",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "80%",
                    height: 40,
                    borderRadius: "6px 6px 2px 2px",
                    border: `2px dashed ${colors.borderDefault}`,
                    opacity: 0.4,
                  }} />
                )}
              </div>

              {/* Day label */}
              <span style={{
                fontSize: 11, fontWeight: 600, fontFamily: display,
                color: isComplete ? colors.textSecondary : colors.textMuted,
              }}>
                D{dayNum}
              </span>

              {/* Completion dot */}
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: isComplete ? colors.coral : colors.bgElevated,
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
