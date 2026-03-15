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

interface Exercise {
  framework_name: string;
  title: string;
  introduction: string;
  exercise: string;
  estimated_time: string;
  theme_tags: string[];
}

export default function ExercisePage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const fetchTodaysExercise = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("exercises")
      .select("*")
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      try {
        setExercise(JSON.parse(data.content));
        setCompleted(data.completed);
      } catch {
        setExercise(null);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTodaysExercise();
  }, [fetchTodaysExercise]);

  async function generateExercise() {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/daily-exercise", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate exercise");
      }
      const data = await res.json();
      setExercise(data.exercise);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function markComplete() {
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("exercises")
      .update({ completed: true })
      .eq("date", today);
    setCompleted(true);
  }

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <p style={{ color: colors.textMuted, fontFamily: body }}>{c.exercise.loadingText}</p>
        </div>
      </PageShell>
    );
  }

  if (!exercise) {
    return (
      <PageShell>
        <FadeIn preset="fade" triggerOnMount>
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 700, marginBottom: 12,
              color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.03em",
            }}>
              {c.exercise.headline}
            </h1>
            <p style={{
              color: colors.textSecondary, fontSize: 15, lineHeight: 1.6,
              maxWidth: 480, margin: "0 auto 32px", fontFamily: body,
            }}>
              {error || c.exercise.emptyMessage}
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
                  <span style={{ fontFamily: body, fontSize: 14 }}>{c.exercise.generatingText}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <PillButton onClick={generateExercise} disabled={generating}>
              {generating ? c.exercise.generatingButton : c.exercise.generateButton}
            </PillButton>
          </div>
        </FadeIn>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 13, color: colors.textMuted, margin: "0 0 4px 0", fontFamily: body,
          }}>
            {exercise.framework_name} · {exercise.estimated_time}
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 700, margin: 0, color: colors.textPrimary,
            fontFamily: display, letterSpacing: "-0.03em",
          }}>
            {exercise.title}
          </h1>
        </div>
      </FadeIn>

      {/* Theme tags */}
      <FadeIn preset="slide-up" delay={0.08} triggerOnMount>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {exercise.theme_tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: i * 0.06 }}
              style={{
                padding: "4px 12px", fontSize: 12, fontWeight: 600,
                backgroundColor: colors.plumWash, color: colors.plumLight,
                borderRadius: 100, fontFamily: display,
              }}
            >
              {tag.replace(/_/g, " ")}
            </motion.span>
          ))}
        </div>
      </FadeIn>

      {/* Introduction */}
      <FadeIn preset="slide-up" delay={0.12} triggerOnMount>
        <motion.div
          whileHover={{ y: -2, borderColor: "rgba(224, 149, 133, 0.2)" }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 24, marginBottom: 24,
            transition: "border-color 0.2s",
          }}
        >
          <p style={{
            fontSize: 15, lineHeight: 1.7, color: colors.textBody, margin: 0, fontFamily: body,
          }}>
            {exercise.introduction}
          </p>
        </motion.div>
      </FadeIn>

      {/* Exercise instructions */}
      <FadeIn preset="slide-up" delay={0.18} triggerOnMount>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontSize: 18, fontWeight: 700, marginBottom: 16,
            color: colors.textPrimary, fontFamily: display, letterSpacing: "-0.02em",
          }}>
            {c.exercise.exerciseHeading}
          </h2>
          <div style={{
            fontSize: 15, lineHeight: 1.8, color: colors.textBody,
            whiteSpace: "pre-wrap", fontFamily: body,
          }}>
            {exercise.exercise}
          </div>
        </div>
      </FadeIn>

      {/* Complete button */}
      <FadeIn preset="fade" delay={0.24} triggerOnMount>
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: 18,
                backgroundColor: colors.coralWash,
                border: `1px solid rgba(224, 149, 133, 0.25)`,
                borderRadius: 14, textAlign: "center",
                color: colors.coral, fontFamily: body, fontSize: 14, fontWeight: 600,
              }}
            >
              {c.exercise.completedMessage}
            </motion.div>
          ) : (
            <PillButton key="complete" onClick={markComplete} variant="success">
              {c.exercise.completeButton}
            </PillButton>
          )}
        </AnimatePresence>
      </FadeIn>
    </PageShell>
  );
}
