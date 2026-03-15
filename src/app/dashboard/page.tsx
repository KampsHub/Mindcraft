"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import FadeIn from "@/components/FadeIn";
import ProgramCard from "./ProgramCard";
import ContactModal from "./ContactModal";
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

interface EnrollmentWithContext {
  enrollment: ProgramEnrollment;
  goals: ActiveGoal[];
  todaySessionDone: boolean;
}

/* ── Quick-access links (3 per row) ── */
const quickLinks = [
  { href: "/mindful-journal", label: "Journal", desc: "Write freely", icon: "✎" },
  { href: "/goals", label: "Progress", desc: "Goals & milestones", icon: "◎" },
  { href: "/weekly-review", label: "Insights", desc: "Review & share", icon: "↻" },
  { href: "/my-account", label: "My Account", desc: "Your data", icon: "◈" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithContext[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
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
            const [goalsRes, sessionRes] = await Promise.all([
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
            ]);
            return {
              enrollment: { ...enr, programs: Array.isArray(enr.programs) ? enr.programs[0] : enr.programs } as ProgramEnrollment,
              goals: (goalsRes.data || []) as ActiveGoal[],
              todaySessionDone: !!sessionRes.data?.completed_at,
            };
          })
        );
        setEnrollments(enriched);
      }
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
    <div style={{ backgroundColor: colors.bgDeep, minHeight: "100vh", fontFamily: body, position: "relative" }}>
      {/* Decorative floating dots */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        style={{
          position: "absolute", top: "8%", right: "12%",
          width: 180, height: 180, borderRadius: "50%",
          background: colors.coral, pointerEvents: "none", filter: "blur(60px)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
        style={{
          position: "absolute", top: "18%", left: "8%",
          width: 140, height: 140, borderRadius: "50%",
          background: colors.plum, pointerEvents: "none", filter: "blur(50px)",
        }}
      />

      <Nav />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px", position: "relative" }}>

        {/* ── Welcome ── */}
        <FadeIn preset="fade" duration={0.6} triggerOnMount>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: display, fontSize: 32, fontWeight: 700,
              letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
            }}>
              The work continues.
            </h1>
            <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
              {user.email}
            </p>
          </div>
        </FadeIn>

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
                whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: "rgba(224, 149, 133, 0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.03 }}
                onClick={() => router.push(link.href)}
                style={{
                  ...cardStyle, padding: "18px 14px", textAlign: "center",
                  cursor: "pointer", transition: "border-color 0.2s",
                }}
              >
                <p style={{ fontSize: 20, margin: "0 0 8px 0", lineHeight: 1, color: colors.textMuted }}>{link.icon}</p>
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
            {/* Contact (opens modal instead of navigating) */}
            <motion.button
              whileHover={{ y: -4, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: "rgba(224, 149, 133, 0.3)" }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: quickLinks.length * 0.03 }}
              onClick={() => setContactOpen(true)}
              style={{
                ...cardStyle, padding: "18px 14px", textAlign: "center",
                cursor: "pointer", transition: "border-color 0.2s",
              }}
            >
              <p style={{ fontSize: 20, margin: "0 0 8px 0", lineHeight: 1, color: colors.textMuted }}>✉</p>
              <p style={{
                fontFamily: display, fontSize: 14, fontWeight: 600,
                margin: "0 0 3px 0", color: colors.textPrimary,
              }}>
                Contact
              </p>
              <p style={{ fontSize: 12, color: colors.textMuted, margin: 0, fontFamily: body }}>
                Get support
              </p>
            </motion.button>
          </div>
        </FadeIn>


      </div>

      {/* ── Contact modal ── */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
