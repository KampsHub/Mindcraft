"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface Entry {
  id: string;
  type: string;
  content: string;
  theme_tags: string[];
  date: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Exercise {
  id: string;
  completed: boolean;
  date: string;
  content: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [oneLiner, setOneLiner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [todaysExercise, setTodaysExercise] = useState<Exercise | null>(null);
  const [streak, setStreak] = useState(0);
  const [topThemes, setTopThemes] = useState<{ tag: string; count: number }[]>([]);
  const [flash, setFlash] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const fetchDashboardData = useCallback(async (userId: string) => {
    const today = new Date().toISOString().split("T")[0];

    // Fetch recent entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("client_id", userId)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .limit(10);

    if (entries) {
      setRecentEntries(entries);

      // Calculate top themes from recent entries
      const themeCounts: Record<string, number> = {};
      entries.forEach((e) => {
        (e.theme_tags || []).forEach((tag: string) => {
          themeCounts[tag] = (themeCounts[tag] || 0) + 1;
        });
      });
      const sorted = Object.entries(themeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag, count]) => ({ tag, count }));
      setTopThemes(sorted);
    }

    // Fetch today's exercise
    const { data: exercise } = await supabase
      .from("exercises")
      .select("*")
      .eq("date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (exercise) {
      setTodaysExercise(exercise);
    }

    // Calculate streak (consecutive days with journal entries)
    const { data: allEntries } = await supabase
      .from("entries")
      .select("date")
      .eq("client_id", userId)
      .eq("type", "journal")
      .order("date", { ascending: false })
      .limit(30);

    if (allEntries) {
      let currentStreak = 0;
      const checkDate = new Date();
      const entryDates = new Set(allEntries.map((e) => e.date));

      for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (entryDates.has(dateStr)) {
          currentStreak++;
        } else if (i > 0) {
          break; // streak broken
        }
        checkDate.setDate(checkDate.getDate() - 1);
      }
      setStreak(currentStreak);
    }
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchDashboardData(user.id);
    });
  }, [supabase.auth, router, fetchDashboardData]);

  async function handleOneLiner(e: React.FormEvent) {
    e.preventDefault();
    if (!oneLiner.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      // Get theme tags from Claude
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: oneLiner }),
      });

      let themeTags: string[] = [];
      if (res.ok) {
        const data = await res.json();
        themeTags = data.theme_tags || [];
      }

      // Save as one_liner entry
      const { error } = await supabase.from("entries").insert({
        client_id: user.id,
        coach_id: user.id,
        type: "one_liner",
        content: oneLiner,
        theme_tags: themeTags,
        date: new Date().toISOString().split("T")[0],
        metadata: {},
      });

      if (error) {
        console.error("Failed to save one-liner:", error);
      } else {
        setFlash("Thought captured");
        setOneLiner("");
        fetchDashboardData(user.id);
        setTimeout(() => setFlash(""), 2000);
      }
    } catch (err) {
      console.error("Error submitting one-liner:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const container: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  if (!user) {
    return (
      <div style={{ ...container, textAlign: "center", paddingTop: 120 }}>
        <p style={{ color: "#888" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={container}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 4px 0" }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{user.email}</p>
        </div>
        <button onClick={handleSignOut} style={{
          padding: "8px 16px", fontSize: 13, color: "#666",
          backgroundColor: "transparent", border: "1px solid #ddd",
          borderRadius: 6, cursor: "pointer",
        }}>
          Sign out
        </button>
      </div>

      {/* One-liner capture */}
      <form onSubmit={handleOneLiner} style={{
        padding: 20, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 12, marginBottom: 24,
      }}>
        <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#475569", marginBottom: 8 }}>
          Quick thought
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={oneLiner}
            onChange={(e) => setOneLiner(e.target.value)}
            placeholder="Capture a thought, feeling, or observation..."
            disabled={submitting}
            style={{
              flex: 1, padding: "10px 14px", fontSize: 15,
              border: "1px solid #ddd", borderRadius: 8,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <button type="submit" disabled={submitting || !oneLiner.trim()} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: 500, color: "#fff",
            backgroundColor: submitting || !oneLiner.trim() ? "#999" : "#2563eb",
            border: "none", borderRadius: 8,
            cursor: submitting || !oneLiner.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}>
            {submitting ? "..." : "Capture"}
          </button>
        </div>
        {flash && (
          <p style={{ fontSize: 13, color: "#16a34a", margin: "8px 0 0 0" }}>{flash}</p>
        )}
      </form>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{
          padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center",
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#2563eb" }}>{streak}</p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>day streak</p>
        </div>
        <div style={{
          padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center",
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#2563eb" }}>
            {recentEntries.filter((e) => e.type === "journal").length}
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>entries this week</p>
        </div>
        <div style={{
          padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center",
        }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0",
            color: todaysExercise?.completed ? "#16a34a" : "#f59e0b",
          }}>
            {todaysExercise ? (todaysExercise.completed ? "\u2713" : "\u2022") : "\u2014"}
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            {todaysExercise ? (todaysExercise.completed ? "exercise done" : "exercise pending") : "no exercise"}
          </p>
        </div>
      </div>

      {/* Top themes */}
      {topThemes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px 0", color: "#475569" }}>
            Themes this week
          </h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {topThemes.map(({ tag, count }) => (
              <span key={tag} style={{
                padding: "4px 12px", fontSize: 13,
                backgroundColor: "#eff6ff", color: "#2563eb",
                borderRadius: 16, border: "1px solid #bfdbfe",
              }}>
                {tag.replace(/_/g, " ")} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 32 }}>
        {[
          { href: "/journal", label: "Journal", desc: "Write today's entry" },
          { href: "/exercise", label: "Exercise", desc: "Today's exercise" },
          { href: "/plan", label: "Plan", desc: "Your coaching plan" },
          { href: "/weekly-review", label: "Review", desc: "Reflect on your week" },
          { href: "/intake", label: "Intake", desc: "Update your profile" },
        ].map(({ href, label, desc }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              padding: 16, textAlign: "left",
              border: "1px solid #e2e8f0", borderRadius: 10,
              backgroundColor: "#fff", cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px 0" }}>{label}</p>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>{desc}</p>
          </button>
        ))}
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: "#475569" }}>
            Recent entries
          </h3>
          {recentEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} style={{
              padding: 14, border: "1px solid #f0f0f0", borderRadius: 8,
              marginBottom: 8, backgroundColor: "#fafafa",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{
                  fontSize: 12, color: "#888",
                  padding: "2px 8px", backgroundColor: entry.type === "one_liner" ? "#fef3c7" : "#eff6ff",
                  borderRadius: 10, border: `1px solid ${entry.type === "one_liner" ? "#fde68a" : "#bfdbfe"}`,
                  color: entry.type === "one_liner" ? "#92400e" : "#2563eb",
                }}>
                  {entry.type === "one_liner" ? "thought" : "journal"}
                </span>
                <span style={{ fontSize: 12, color: "#aaa" }}>{entry.date}</span>
              </div>
              <p style={{
                fontSize: 14, color: "#333", margin: 0, lineHeight: 1.5,
                overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {entry.content}
              </p>
              {entry.theme_tags?.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                  {entry.theme_tags.map((tag) => (
                    <span key={tag} style={{
                      padding: "2px 8px", fontSize: 11,
                      backgroundColor: "#f1f5f9", color: "#64748b",
                      borderRadius: 10,
                    }}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
