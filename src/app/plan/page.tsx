"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import PillButton from "@/components/PillButton";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

const display = fonts.display;
const body = fonts.bodyAlt;

interface Goal {
  goal: string;
  why: string;
}

interface FocusArea {
  area: string;
  description: string;
  related_intake: string;
}

interface WeeklyTheme {
  weeks: string;
  theme: string;
  description: string;
  frameworks: string[];
}

interface Plan {
  id: string;
  summary: string;
  goals: Goal[];
  focus_areas: FocusArea[];
  weekly_themes: WeeklyTheme[];
  current_phase: string;
  package: string;
  created_at: string;
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const fetchPlan = useCallback(async () => {
    const { data, error } = await supabase
      .from("coaching_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setPlan(data as Plan);
    } else if (error?.code === "PGRST116") {
      setPlan(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  async function generatePlan() {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-plan", { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate plan");
      }

      const data = await res.json();
      setPlan(data.plan as Plan);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ color: colors.textMuted, fontFamily: body }}>{c.plan.loadingText}</p>
        </div>
      </PageShell>
    );
  }

  // No plan yet — offer to generate
  if (!plan) {
    return (
      <PageShell>
        <FadeIn preset="fade" triggerOnMount>
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700, marginBottom: 12,
              color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.03em",
            }}>
              {c.plan.headline}
            </h1>
            <p style={{
              color: colors.textSecondary, fontSize: 15, lineHeight: 1.6,
              maxWidth: 480, margin: "0 auto 32px", fontFamily: body,
            }}>
              {error ? error : c.plan.emptyMessage}
            </p>

            <AnimatePresence>
              {generating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 12, marginBottom: 24, color: colors.textMuted,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${colors.borderDefault}`,
                      borderTopColor: colors.coral, flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: body, fontSize: 14 }}>{c.plan.generatingText}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <PillButton onClick={generatePlan} disabled={generating}>
                {generating ? c.plan.generatingButton : c.plan.generateButton}
              </PillButton>
              <PillButton variant="ghost" onClick={() => router.push("/intake")}>
                {c.plan.goToIntake}
              </PillButton>
            </div>
          </div>
        </FadeIn>
      </PageShell>
    );
  }

  // Display the plan
  const packageLabels = c.plan.packageLabels;

  return (
    <PageShell maxWidth={760}>
      <FadeIn preset="fade" triggerOnMount>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 32, flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h1 style={{
              fontSize: 32, fontWeight: 700, marginBottom: 4,
              color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.03em",
            }}>
              {c.plan.headline}
            </h1>
            <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, fontFamily: body }}>
              {packageLabels[plan.package] || plan.package} · Phase: {plan.current_phase}
            </p>
          </div>
          <PillButton onClick={() => router.push("/mindful-journal")} size="sm">
            {c.plan.startJournaling}
          </PillButton>
        </div>
      </FadeIn>

      {/* Summary */}
      <FadeIn preset="slide-up" delay={0.08} triggerOnMount>
        <motion.div
          whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.2)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            backgroundColor: colors.bgSurface, borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`, padding: 24,
            marginBottom: 32, transition: "border-color 0.2s",
          }}
        >
          <p style={{
            fontSize: 15, lineHeight: 1.7, color: colors.textBody, margin: 0, fontFamily: body,
          }}>
            {plan.summary}
          </p>
        </motion.div>
      </FadeIn>

      {/* Goals */}
      <FadeIn preset="fade" delay={0.12} triggerOnMount>
        <h2 style={{
          fontSize: 20, fontWeight: 700, marginBottom: 16,
          color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
        }}>
          {c.plan.goalsHeading}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {plan.goals.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.2)" }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`, padding: 20,
                transition: "border-color 0.2s",
              }}
            >
              <h3 style={{
                fontSize: 15, fontWeight: 600, margin: "0 0 6px 0",
                color: colors.textPrimary, fontFamily: display,
              }}>
                {g.goal}
              </h3>
              <p style={{ fontSize: 14, color: colors.textSecondary, margin: 0, lineHeight: 1.5, fontFamily: body }}>
                {g.why}
              </p>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* Focus Areas */}
      <FadeIn preset="fade" delay={0.18} triggerOnMount>
        <h2 style={{
          fontSize: 20, fontWeight: 700, marginBottom: 16,
          color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
        }}>
          {c.plan.focusAreasHeading}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {plan.focus_areas.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.2)" }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`, padding: 20,
                transition: "border-color 0.2s",
              }}
            >
              <h3 style={{
                fontSize: 15, fontWeight: 600, margin: "0 0 6px 0",
                color: colors.textPrimary, fontFamily: display,
              }}>
                {f.area}
              </h3>
              <p style={{ fontSize: 14, color: colors.textBody, margin: "0 0 8px 0", lineHeight: 1.5, fontFamily: body }}>
                {f.description}
              </p>
              <p style={{
                fontSize: 12, color: colors.textMuted, margin: 0,
                fontStyle: "italic", fontFamily: body,
              }}>
                {c.plan.basedOn} {f.related_intake}
              </p>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      {/* Weekly Themes */}
      <FadeIn preset="fade" delay={0.24} triggerOnMount>
        <h2 style={{
          fontSize: 20, fontWeight: 700, marginBottom: 16,
          color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
        }}>
          {c.plan.weeklyJourneyHeading}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
          {plan.weekly_themes.map((w, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.26 + i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.25)" }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`, padding: 20,
                borderLeft: `4px solid ${colors.coral}`,
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, fontFamily: display,
                  color: colors.coral, backgroundColor: colors.coralWash,
                  padding: "3px 12px", borderRadius: 100,
                }}>
                  Weeks {w.weeks}
                </span>
                <h3 style={{
                  fontSize: 15, fontWeight: 600, margin: 0,
                  color: colors.textPrimary, fontFamily: display,
                }}>
                  {w.theme}
                </h3>
              </div>
              <p style={{
                fontSize: 14, color: colors.textBody, margin: "0 0 10px 0",
                lineHeight: 1.5, fontFamily: body,
              }}>
                {w.description}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {w.frameworks.map((fw) => (
                  <span key={fw} style={{
                    padding: "3px 10px", fontSize: 12, fontFamily: display,
                    backgroundColor: colors.bgElevated, color: colors.textSecondary,
                    borderRadius: 100,
                  }}>
                    {fw}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </FadeIn>
    </PageShell>
  );
}
