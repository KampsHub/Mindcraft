"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

  const container: React.CSSProperties = {
    maxWidth: 720, margin: "0 auto", padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  if (loading) {
    return <div style={{ ...container, textAlign: "center", paddingTop: 120 }}>
      <p style={{ color: "#888" }}>Loading today&apos;s exercise...</p>
    </div>;
  }

  if (!exercise) {
    return (
      <div style={{ ...container, textAlign: "center", paddingTop: 80 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 12 }}>Today&apos;s Exercise</h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
          {error || "No exercise for today yet. Generate one based on your coaching plan and recent entries."}
        </p>
        {generating && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, color: "#666" }}>
            <div style={{
              width: 20, height: 20, border: "2px solid #ddd", borderTopColor: "#2563eb",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
            <span>Selecting and personalising your exercise...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
        <button onClick={generateExercise} disabled={generating} style={{
          padding: "12px 32px", fontSize: 15, fontWeight: 500, color: "#fff",
          backgroundColor: generating ? "#999" : "#2563eb", border: "none",
          borderRadius: 8, cursor: generating ? "not-allowed" : "pointer",
        }}>
          {generating ? "Generating..." : "Generate today's exercise"}
        </button>
      </div>
    );
  }

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px 0" }}>
            {exercise.framework_name} · {exercise.estimated_time}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>{exercise.title}</h1>
        </div>
        <button onClick={() => router.push("/journal")} style={{
          padding: "8px 16px", fontSize: 13, color: "#666", backgroundColor: "transparent",
          border: "1px solid #ddd", borderRadius: 6, cursor: "pointer",
        }}>
          Go to journal
        </button>
      </div>

      {/* Theme tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {exercise.theme_tags.map((tag) => (
          <span key={tag} style={{
            padding: "3px 10px", fontSize: 12, backgroundColor: "#eff6ff",
            color: "#2563eb", borderRadius: 12, border: "1px solid #bfdbfe",
          }}>
            {tag.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      {/* Introduction */}
      <div style={{
        padding: 20, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 12, marginBottom: 24,
      }}>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "#1e293b", margin: 0 }}>
          {exercise.introduction}
        </p>
      </div>

      {/* Exercise instructions */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>The Exercise</h2>
        <div style={{
          fontSize: 15, lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap",
        }}>
          {exercise.exercise}
        </div>
      </div>

      {/* Complete button */}
      {completed ? (
        <div style={{
          padding: 16, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
          borderRadius: 8, textAlign: "center", color: "#166534",
        }}>
          ✓ Completed — nice work. Head to your journal to process what came up.
        </div>
      ) : (
        <button onClick={markComplete} style={{
          padding: "12px 32px", fontSize: 15, fontWeight: 500, color: "#fff",
          backgroundColor: "#16a34a", border: "none", borderRadius: 8, cursor: "pointer",
        }}>
          Mark as complete
        </button>
      )}
    </div>
  );
}
