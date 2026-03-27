"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, text, radii } from "@/lib/theme";
import WeekProgressTracker from "@/components/WeekProgressTracker";

const display = fonts.display;
const body = fonts.bodyAlt;

const PROGRAM_ACCENTS: Record<string, { border: string; wash: string; color: string }> = {
  jetstream: { border: "rgba(224, 149, 133, 0.2)", wash: colors.coralWash, color: colors.coral },
  parachute: { border: "rgba(224, 149, 133, 0.2)", wash: colors.coralWash, color: colors.coral },
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
  programs: { name: string; slug: string; weekly_themes?: any[] };
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
  todaySessionStarted: boolean;
  isCompact: boolean;
  onNavigate: (path: string) => void;
  weekDays?: DayStatus[];
  weekNumber?: number;
}

export default function ProgramCard({ enrollment, goals, todaySessionDone, todaySessionStarted, isCompact, onNavigate, weekDays, weekNumber }: ProgramCardProps) {
  const [goalsOpen, setGoalsOpen] = useState(!isCompact);
  const accent = getAccent(enrollment.programs?.slug);

  // Prefetch yesterday's themes so they're ready when the user clicks "Start Session"
  useEffect(() => {
    if (enrollment.status === "active" && enrollment.current_day > 1 && !todaySessionDone) {
      fetch("/api/daily-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          dayNumber: enrollment.current_day,
        }),
      }).catch(() => {}); // Fire-and-forget — errors are fine, the day page will retry
    }
  }, [enrollment.id, enrollment.current_day, enrollment.status, todaySessionDone]);
  const { status } = enrollment;

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    border: `1px solid ${accent.border}`,
    padding: space[5],
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
          <ProgramBadge name={enrollment.programs?.name} accent={accent} weekNumber={Math.ceil(enrollment.current_day / 7)} />

          {/* Program arc — always visible */}
          {enrollment.programs?.weekly_themes && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {(enrollment.programs.weekly_themes as any[]).map((wt: any, i: number) => {
                  const weekStart = (wt.week - 1) * 7 + 1;
                  const weekEnd = wt.week * 7;
                  const isCurrent = enrollment.current_day >= weekStart && enrollment.current_day <= weekEnd;
                  const isDone = enrollment.current_day > weekEnd;
                  return (
                    <div key={wt.week} style={{ flex: 1 }}>
                      <div style={{
                        height: 3, borderRadius: 2,
                        backgroundColor: isDone ? colors.coral : isCurrent ? `${colors.coral}88` : "rgba(255,255,255,0.1)",
                        marginBottom: 6,
                      }} />
                      <p style={{
                        ...text.caption,
                        color: isCurrent ? colors.coral : isDone ? "#ffffff" : "rgba(255,255,255,0.3)",
                        margin: 0,
                      }}>
                        {wt.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h2 style={{
            ...text.title, color: colors.textPrimary, margin: "0 0 4px 0",
          }}>
            Day {enrollment.current_day}
          </h2>
          <p style={{ ...text.body, color: "#ffffff", margin: "0 0 18px 0" }}>
            {todaySessionDone ? "Session complete — nice work." : todaySessionStarted ? "You have an open session." : "Your daily session is ready."}
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(224, 149, 133, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => onNavigate(`/day/${enrollment.current_day}?enrollment=${enrollment.id}`)}
            style={{
              padding: "12px 28px", fontSize: 14, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: radii.full, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            {todaySessionDone ? "Review Day" : todaySessionStarted ? "Continue Session" : "Start Session"}
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
                ...text.caption, color: colors.textMuted,
                margin: "0 0 10px 0",
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
                        ...text.secondary, color: colors.textBody, margin: 0,
                        paddingLeft: 14, borderLeft: `2px solid ${accent.color}`,
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
        <ProgramBadge name={enrollment.programs?.name} accent={accent} weekNumber={Math.ceil(enrollment.current_day / 7)} />
        <h2 style={{
          ...text.title, color: colors.textPrimary, margin: "0 0 6px 0",
        }}>
          Ready to begin
        </h2>
        <p style={{ ...text.body, color: "#ffffff", margin: "0 0 18px 0" }}>
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
        ...text.caption, display: "inline-block",
        background: isAwaiting ? colors.warningWash : accent.wash,
        color: isAwaiting ? colors.warning : accent.color,
        padding: "5px 14px", borderRadius: radii.full, marginBottom: 14,
      }}>
        {enrollment.programs?.name} — Day {enrollment.current_day}
      </span>
      <h2 style={{
        ...text.title, color: colors.textPrimary, margin: "0 0 6px 0",
      }}>
        {isAwaiting ? "Goals ready for review" : "Continue onboarding"}
      </h2>
      <p style={{ ...text.body, color: "#ffffff", margin: "0 0 18px 0" }}>
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

function ProgramBadge({ name, accent, weekNumber }: { name: string; accent: { wash: string; color: string }; weekNumber?: number }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      {weekNumber && (
        <span style={{
          ...text.caption, display: "inline-block",
          background: colors.coralWash, color: colors.coral,
          padding: "5px 14px", borderRadius: radii.full,
        }}>
          Week {weekNumber}
        </span>
      )}
      <span style={{
        ...text.caption, display: "inline-block",
        background: colors.bgElevated, color: colors.textPrimary,
        padding: "5px 14px", borderRadius: radii.full,
      }}>
        {name}
      </span>
    </div>
  );
}
