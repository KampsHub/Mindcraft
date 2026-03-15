"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import WeekProgressTracker from "@/components/WeekProgressTracker";

const display = fonts.display;
const body = fonts.bodyAlt;

const PROGRAM_ACCENTS: Record<string, { border: string; wash: string; color: string }> = {
  jetstream: { border: "rgba(224, 149, 133, 0.2)", wash: colors.coralWash, color: colors.coral },
  parachute: { border: "rgba(123, 82, 120, 0.2)", wash: colors.plumWash, color: colors.plumLight },
  basecamp: { border: "rgba(224, 149, 133, 0.2)", wash: colors.coralWash, color: colors.coralLight },
};

function getAccent(slug: string) {
  return PROGRAM_ACCENTS[slug] || PROGRAM_ACCENTS.basecamp;
}

interface ProgramEnrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  goals_approved: boolean;
  programs: { name: string; slug: string };
}

interface ActiveGoal {
  id: string;
  goal_text: string;
  status: string;
}

interface DayStatus {
  dayNumber: number;
  completed: boolean;
  inProgress: boolean;
  isCurrent: boolean;
}

interface ProgramCardProps {
  enrollment: ProgramEnrollment;
  goals: ActiveGoal[];
  todaySessionDone: boolean;
  isCompact: boolean;
  onNavigate: (path: string) => void;
  weekDays?: DayStatus[];
  weekNumber?: number;
}

export default function ProgramCard({ enrollment, goals, todaySessionDone, isCompact, onNavigate, weekDays, weekNumber }: ProgramCardProps) {
  const [goalsOpen, setGoalsOpen] = useState(!isCompact);
  const accent = getAccent(enrollment.programs?.slug);
  const { status } = enrollment;

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    border: `1px solid ${accent.border}`,
    padding: 28,
    position: "relative",
    overflow: "hidden",
  };

  if (status === "active") {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: accent.color }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={cardStyle}
      >
        {/* Subtle accent glow */}
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent.wash} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <ProgramBadge name={enrollment.programs?.name} accent={accent} />
          <h2 style={{
            fontFamily: display, fontSize: 24, fontWeight: 700,
            color: colors.textPrimary, margin: "0 0 4px 0", letterSpacing: "-0.02em",
          }}>
            Day {enrollment.current_day}
          </h2>
          <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 18px 0", fontFamily: body }}>
            {todaySessionDone ? "Session complete — nice work." : "Your daily session is ready."}
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(224, 149, 133, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => onNavigate(`/day/${enrollment.current_day}?enrollment=${enrollment.id}`)}
            style={{
              padding: "12px 28px", fontSize: 14, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            {todaySessionDone ? "Review Day" : "Start Session"}
          </motion.button>
        </div>

        {/* Week progress tracker */}
        {weekDays && weekDays.length > 0 && weekNumber && (
          <WeekProgressTracker
            days={weekDays}
            weekNumber={weekNumber}
            accentColor={accent.color}
          />
        )}

        {goals.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${colors.borderSubtle}` }}>
            <button
              onClick={() => isCompact && setGoalsOpen(!goalsOpen)}
              style={{
                fontFamily: display, fontSize: 11, fontWeight: 700,
                color: colors.textMuted, textTransform: "uppercase",
                letterSpacing: "0.08em", margin: "0 0 10px 0",
                background: "none", border: "none", cursor: isCompact ? "pointer" : "default",
                padding: 0, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Active Goals
              {isCompact && (
                <motion.span animate={{ rotate: goalsOpen ? 180 : 0 }} style={{ fontSize: 10, display: "inline-block" }}>
                  ▼
                </motion.span>
              )}
            </button>
            <AnimatePresence initial={false}>
              {goalsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {goals.map((g) => (
                      <p key={g.id} style={{
                        fontSize: 13, color: colors.textBody, margin: 0,
                        paddingLeft: 14, borderLeft: `2px solid ${accent.color}`,
                        lineHeight: 1.5, fontFamily: body,
                      }}>
                        {g.goal_text}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    );
  }

  if (status === "pre_start") {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: accent.color }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={cardStyle}
      >
        <ProgramBadge name={enrollment.programs?.name} accent={accent} />
        <h2 style={{
          fontFamily: display, fontSize: 22, fontWeight: 700,
          color: colors.textPrimary, margin: "0 0 6px 0", letterSpacing: "-0.02em",
        }}>
          Ready to begin
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 18px 0", fontFamily: body }}>
          Your first three days are onboarding — the exercises double as intake.
        </p>
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(224, 149, 133, 0.4)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => onNavigate(`/day/1?enrollment=${enrollment.id}`)}
          style={{
            padding: "12px 28px", fontSize: 14, fontWeight: 600,
            color: colors.bgDeep, backgroundColor: colors.coral,
            border: "none", borderRadius: 100, cursor: "pointer",
            fontFamily: display, letterSpacing: "0.01em",
          }}
        >
          Start Day 1
        </motion.button>
      </motion.div>
    );
  }

  // awaiting_goals or onboarding
  const isAwaiting = status === "awaiting_goals";
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: accent.color }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: isAwaiting
          ? `1px solid rgba(214, 182, 93, 0.2)`
          : `1px solid ${accent.border}`,
      }}
    >
      <span style={{
        display: "inline-block",
        background: isAwaiting ? colors.warningWash : accent.wash,
        color: isAwaiting ? colors.warning : accent.color,
        fontFamily: display, fontWeight: 700, fontSize: 11,
        textTransform: "uppercase", letterSpacing: "0.1em",
        padding: "5px 14px", borderRadius: 100, marginBottom: 14,
      }}>
        {enrollment.programs?.name} — Day {enrollment.current_day}
      </span>
      <h2 style={{
        fontFamily: display, fontSize: 22, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 6px 0", letterSpacing: "-0.02em",
      }}>
        {isAwaiting ? "Goals ready for review" : "Continue onboarding"}
      </h2>
      <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 18px 0", fontFamily: body }}>
        {isAwaiting
          ? "Your goals have been generated from your first three days. Review and approve them."
          : "Pick up where you left off in your onboarding sessions."}
      </p>
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(224, 149, 133, 0.4)" }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onNavigate(isAwaiting ? `/goals?enrollment=${enrollment.id}` : `/day/${enrollment.current_day}?enrollment=${enrollment.id}`)}
        style={{
          padding: "12px 28px", fontSize: 14, fontWeight: 600,
          color: colors.bgDeep, backgroundColor: colors.coral,
          border: "none", borderRadius: 100, cursor: "pointer",
          fontFamily: display, letterSpacing: "0.01em",
        }}
      >
        {isAwaiting ? "Review Goals" : "Continue"}
      </motion.button>
    </motion.div>
  );
}

function ProgramBadge({ name, accent }: { name: string; accent: { wash: string; color: string } }) {
  return (
    <span style={{
      display: "inline-block",
      background: accent.wash,
      color: accent.color,
      fontFamily: display, fontWeight: 700, fontSize: 11,
      textTransform: "uppercase", letterSpacing: "0.1em",
      padding: "5px 14px", borderRadius: 100, marginBottom: 14,
    }}>
      {name}
    </span>
  );
}
