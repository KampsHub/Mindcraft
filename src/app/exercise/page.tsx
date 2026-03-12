"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";
import { content as c } from "@/content/site";

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
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <p style={{ color: colors.gray400 }}>{c.exercise.loadingText}</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px", textAlign: "center", paddingTop: 80 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: colors.black }}>{c.exercise.headline}</h1>
          <p style={{ color: colors.gray500, fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
            {error || c.exercise.emptyMessage}
          </p>
          {generating && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, color: colors.gray500 }}>
              <div style={{
                width: 20, height: 20, border: `2px solid ${colors.gray200}`, borderTopColor: colors.primary,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <span>{c.exercise.generatingText}</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}
          <button onClick={generateExercise} disabled={generating} style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 600, color: colors.white,
            backgroundColor: generating ? colors.gray400 : colors.primary, border: "none",
            borderRadius: 8, cursor: generating ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
          }}>
            {generating ? c.exercise.generatingButton : c.exercise.generateButton}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: colors.gray400, margin: "0 0 4px 0" }}>
            {exercise.framework_name} · {exercise.estimated_time}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: colors.black }}>{exercise.title}</h1>
        </div>

        {/* Theme tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {exercise.theme_tags.map((tag) => (
            <span key={tag} style={{
              padding: "3px 10px", fontSize: 12, backgroundColor: colors.primaryLight,
              color: colors.primaryDark, borderRadius: 12, border: `1px solid ${colors.primaryMuted}`,
            }}>
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>

        {/* Introduction */}
        <div style={{ ...card, padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.black, margin: 0 }}>
            {exercise.introduction}
          </p>
        </div>

        {/* Exercise instructions */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.black }}>{c.exercise.exerciseHeading}</h2>
          <div style={{
            fontSize: 15, lineHeight: 1.8, color: colors.dark, whiteSpace: "pre-wrap",
          }}>
            {exercise.exercise}
          </div>
        </div>

        {/* Complete button */}
        {completed ? (
          <div style={{
            padding: 16, backgroundColor: colors.successLight, border: "1px solid #bbf7d0",
            borderRadius: 8, textAlign: "center", color: "#166534",
          }}>
            {c.exercise.completedMessage}
          </div>
        ) : (
          <button onClick={markComplete} style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 600, color: colors.white,
            backgroundColor: colors.success, border: "none", borderRadius: 8, cursor: "pointer",
          }}>
            {c.exercise.completeButton}
          </button>
        )}
      </div>
    </div>
  );
}
