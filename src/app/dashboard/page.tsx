"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import FadeIn from "@/components/FadeIn";
import ProgramCard from "./ProgramCard";
import UpsellSection from "./UpsellSection";
import { colors, fonts } from "@/lib/theme";
import ExercisesSection from "@/components/ExercisesSection";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: 14,
  border: `1px solid ${colors.borderDefault}`,
};

/* ── Types ── */
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

interface EnrollmentWithContext {
  enrollment: ProgramEnrollment;
  goals: ActiveGoal[];
  todaySessionDone: boolean;
  weekDays: DayStatus[];
  weekNumber: number;
}

/* ── Dashboard greetings by program ── */
const greetings: Record<string, string[]> = {
  parachute: [
    "You're still here. That counts.",
    "Structure before strategy.",
    "The fog lifts one morning at a time.",
    "\"The only way out is through.\" — Robert Frost",
    "You don't have to figure it all out today.",
    "Clear eyes first. Then decisions.",
    "\"In the middle of difficulty lies opportunity.\" — Albert Einstein",
    "Rebuilding is not starting over.",
    "\"Courage is not the absence of fear.\" — Nelson Mandela",
    "You showed up. That's the whole job today.",
    "Let the dust settle before you sweep.",
    "What got disrupted can be rebuilt differently.",
    "Progress isn't always visible. Keep going.",
  ],
  jetstream: [
    "Stay steady. Stay sharp.",
    "Clarity under pressure is a skill. You're building it.",
    "Separate the noise from the signal.",
    "You're still in the game.",
    "One clear conversation at a time.",
    "\"Courage is grace under pressure.\" — Hemingway",
    "Think clearly. Act deliberately.",
    "Pressure reveals. It doesn't define.",
    "Stay in the room. Breathe. Then speak.",
    "The best move right now is the calm one.",
  ],
  basecamp: [
    "New map. Same compass.",
    "Listen before you lead.",
    "Read the room before you redecorate it.",
    "The first 30 days are data collection, not performance.",
    "\"Begin as you mean to go on.\"",
    "Trust the discomfort of not knowing.",
    "New doesn't mean unprepared.",
    "Every new room feels wrong until you've sat in it a while.",
    "The culture will reveal itself. Just watch.",
    "\"Do what you can, with what you have, where you are.\" — Theodore Roosevelt",
    "Observe twice. Speak once.",
    "You've done hard transitions before. This is another one.",
    "Credibility is built daily, not announced.",
    "The learning curve is the point, not the obstacle.",
    "Land first. Then fly.",
  ],
};

const defaultGreetings = [
  "You're still here. That counts.",
  "Clear eyes first. Then decisions.",
  "Progress isn't always visible. Keep going.",
];

function getGreeting(programSlug?: string): string {
  const list = (programSlug && greetings[programSlug]) || defaultGreetings;
  // Use today's date as seed for daily rotation
  const today = new Date();
  const dayIndex = today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate();
  return list[dayIndex % list.length];
}

/* ── Quick-access links (3 per row) ── */
const quickLinks = [
  { href: "/mindful-journal", label: "Journal", desc: "Write freely", icon: "✎", accent: colors.coral },
  { href: "/goals", label: "Progress", desc: "Goals & milestones", icon: "◎", accent: colors.coral },
  { href: "/weekly-review", label: "Insights", desc: "Review & share", icon: "↻", accent: colors.coral },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithContext[]>([]);
  const [hasEnneagram, setHasEnneagram] = useState(true); // default true to hide upsell until checked
  const supabase = createClient();
  const router = useRouter();

  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      const { data: rawEnrollments } = await supabase
        .from("program_enrollments")
        .select("id, program_id, current_day, status, goals_approved, created_at, programs(name, slug)")
        .eq("client_id", userId)
        .in("status", ["active", "onboarding", "awaiting_goals", "pre_start", "completed", "paused"])
        .order("created_at", { ascending: false });

      if (rawEnrollments && rawEnrollments.length > 0) {
        const enriched = await Promise.all(
          rawEnrollments.map(async (enr) => {
            // Calculate current week range
            const weekNumber = Math.ceil(enr.current_day / 7);
            const weekStart = (weekNumber - 1) * 7 + 1;
            const weekEnd = weekNumber * 7;

            const [goalsRes, sessionRes, weekSessionsRes] = await Promise.all([
              supabase
                .from("client_goals")
                .select("id, goal_text, status")
                .eq("enrollment_id", enr.id)
                .eq("status", "active"),
              supabase
                .from("daily_sessions")
                .select("completed_at")
                .eq("enrollment_id", enr.id)
                .eq("day_number", enr.current_day)
                .single(),
              supabase
                .from("daily_sessions")
                .select("day_number, completed_at")
                .eq("enrollment_id", enr.id)
                .gte("day_number", weekStart)
                .lte("day_number", weekEnd)
                .order("day_number", { ascending: true }),
            ]);

            // Build week day statuses
            const completedDays = new Set(
              (weekSessionsRes.data || [])
                .filter((s: { completed_at: string | null }) => s.completed_at)
                .map((s: { day_number: number }) => s.day_number)
            );
            const startedDays = new Set(
              (weekSessionsRes.data || [])
                .map((s: { day_number: number }) => s.day_number)
            );

            const weekDays: DayStatus[] = [];
            for (let d = weekStart; d <= weekEnd; d++) {
              weekDays.push({
                dayNumber: d,
                completed: completedDays.has(d),
                inProgress: startedDays.has(d) && !completedDays.has(d),
                isCurrent: d === enr.current_day,
              });
            }

            return {
              enrollment: { ...enr, programs: Array.isArray(enr.programs) ? enr.programs[0] : enr.programs } as ProgramEnrollment,
              goals: (goalsRes.data || []) as ActiveGoal[],
              todaySessionDone: !!sessionRes.data?.completed_at,
              weekDays,
              weekNumber,
            };
          })
        );
        setEnrollments(enriched);
      }

      // Check if user has enneagram assessment
      const { data: assessments } = await supabase
        .from("client_assessments")
        .select("id")
        .eq("client_id", userId)
        .eq("type", "enneagram")
        .limit(1);
      setHasEnneagram((assessments?.length || 0) > 0);
    } catch {
      // Tables may not exist yet
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      fetchDashboardData(user.id);
      fetch("/api/link-subscription", { method: "POST" }).catch(() => {});
    });
  }, [supabase.auth, router, fetchDashboardData]);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.bgDeep }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: colors.textMuted, fontFamily: body }}>
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bgDeep, minHeight: "100vh", fontFamily: body, position: "relative", overflow: "hidden" }}>
      {/* Background image — program-aware */}
      <DashboardBgImage programSlug={enrollments[0]?.enrollment?.programs?.slug} />

      {/* Decorative floating dots — hidden when bg image is active */}

      <Nav />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px", position: "relative" }}>
       <div style={{
          backgroundColor: "rgba(51, 51, 57, 0.5)",
          borderRadius: 16,
          padding: "28px 24px",
          border: `1px solid rgba(255, 255, 255, 0.06)`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}>

        {/* ── Welcome ── */}
        <FadeIn preset="fade" duration={0.6} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: display, fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
            }}>
              {getGreeting(enrollments[0]?.enrollment?.programs?.slug)}
            </h1>
            <p style={{ fontSize: 14, color: "#ffffff", margin: 0, fontFamily: body }}>
              {user.email}
            </p>
          </div>
        </FadeIn>

        {/* ── No program yet ── */}
        {enrollments.length === 0 && (
          <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
            <div style={{
              padding: "48px 32px",
              borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`,
              backgroundColor: colors.bgSurface,
              textAlign: "center",
              marginBottom: 28,
            }}>
              <p style={{
                fontFamily: display, fontSize: 22, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 12px 0",
              }}>
                No program yet.
              </p>
              <p style={{
                fontSize: 15, color: colors.textSecondary, lineHeight: 1.6,
                margin: "0 0 24px 0", maxWidth: 400, marginLeft: "auto", marginRight: "auto",
              }}>
                Choose a program that fits where you are right now. Each one is 30 days of structured, personalized coaching.
              </p>
              <button
                onClick={() => { window.location.assign("/#programs"); }}
                style={{
                  display: "inline-block",
                  padding: "12px 32px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#ffffff",
                  backgroundColor: colors.coral,
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                  border: "none",
                }}
              >
                Explore programs
              </button>
            </div>
          </FadeIn>
        )}

        {/* ── Program cards ── */}
        {enrollments.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
            {enrollments.map((ctx, i) => (
              <FadeIn key={ctx.enrollment.id} preset="slide-up" delay={0.1 + i * 0.08} triggerOnMount>
                <ProgramCard
                  enrollment={ctx.enrollment}
                  goals={ctx.goals}
                  todaySessionDone={ctx.todaySessionDone}
                  isCompact={enrollments.length > 1}
                  onNavigate={(path) => router.push(path)}
                  weekDays={ctx.weekDays}
                  weekNumber={ctx.weekNumber}
                />
              </FadeIn>
            ))}
          </div>
        )}

        {/* ── Exercises section ── */}
        {enrollments.length > 0 && (
          <FadeIn preset="fade" delay={0.12} triggerOnMount>
            <ExercisesSection
              user={user}
              enrollment={enrollments[0]?.enrollment ? {
                id: enrollments[0].enrollment.id,
                program_id: enrollments[0].enrollment.program_id,
                current_day: enrollments[0].enrollment.current_day,
                programs: enrollments[0].enrollment.programs,
              } : null}
            />
          </FadeIn>
        )}

        {/* ── Quick links (3 per row) ── */}
        <FadeIn preset="fade" delay={0.15} triggerOnMount>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 28,
          }}>
            {quickLinks.map((link, i) => (
              <motion.button
                key={link.href}
                whileHover={{ y: -5, boxShadow: `0 12px 32px ${link.accent}18` }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.03 }}
                onClick={() => router.push(link.href)}
                style={{
                  ...cardStyle,
                  padding: "22px 14px 18px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle warm glow */}
                <div style={{
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${link.accent}15 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${link.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 18, color: link.accent }}>{link.icon}</span>
                </div>
                <p style={{
                  fontFamily: display, fontSize: 14, fontWeight: 600,
                  margin: "0 0 3px 0", color: colors.textPrimary,
                }}>
                  {link.label}
                </p>
                <p style={{ fontSize: 12, color: colors.textMuted, margin: 0, fontFamily: body }}>
                  {link.desc}
                </p>
              </motion.button>
            ))}
          </div>
        </FadeIn>

        <UpsellSection
          showEnneagram={!hasEnneagram}
          programSlug={enrollments[0]?.enrollment?.programs?.slug || "parachute"}
          onNavigate={(path) => router.push(path)}
        />

       </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${colors.borderSubtle}` }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#ffffff", alignItems: "center", fontFamily: body }}>
            <span>
              &copy; 2026 All Minds on Deck &middot; Made with{" "}
              <span style={{ color: colors.coral, fontSize: 18 }}>&#9829;</span> by{" "}
              <a href="https://allmindsondeck.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "#ffffff", textDecoration: "underline" }}>
                All Minds On Deck
              </a>
            </span>
            <a href="/privacy" style={{ color: "#ffffff", textDecoration: "none" }}>Privacy</a>
            <a href="/contact" style={{ color: "#ffffff", textDecoration: "none" }}>Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

/* ── Background image component ── */
const PROGRAM_BG_IMAGES: Record<string, string[]> = {
  parachute: [
    "/hero-parachute.jpg",
    "/shutterstock_2758752955.jpg",
    "/shutterstock_2758753407.jpg",
    "/shutterstock_2758753475.jpg",
    "/shutterstock_2758773487.jpg",
    "/shutterstock_2758773645.jpg",
    "/shutterstock_2758773677.jpg",
    "/shutterstock_2758773863.jpg",
    "/shutterstock_2758774471.jpg",
  ],
  jetstream: [
    "/jetstream-hero-bg.jpg",
    "/shutterstock_2758780005.jpg",
    "/shutterstock_2758780047.jpg",
    "/shutterstock_2758780709.jpg",
    "/shutterstock_2758781481.jpg",
    "/shutterstock_2758781721.jpg",
    "/shutterstock_2758781913.jpg",
    "/shutterstock_2758782247.jpg",
  ],
  basecamp: [
    "/basecamp-hero-bg.jpg",
    "/shutterstock_2758783389.jpg",
    "/shutterstock_2758783589.jpg",
    "/shutterstock_2758783845.jpg",
    "/shutterstock_2758783917.jpg",
    "/shutterstock_2758784169.jpg",
    "/shutterstock_2758784713.jpg",
    "/shutterstock_2758784965.jpg",
    "/shutterstock_2758785201.jpg",
    "/shutterstock_2758785621.jpg",
    "/shutterstock_2758785777.jpg",
    "/shutterstock_2758786195.jpg",
  ],
};

function DashboardBgImage({ programSlug }: { programSlug?: string }) {
  const [bgImage, setBgImage] = useState<string | null>(null);
  useEffect(() => {
    const pool = PROGRAM_BG_IMAGES[programSlug || "parachute"] || PROGRAM_BG_IMAGES.parachute;
    const day = Math.floor(Date.now() / 86400000);
    setBgImage(pool[day % pool.length]);
  }, [programSlug]);

  if (!bgImage) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
