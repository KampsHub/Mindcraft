"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";

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
      const { data: insertedEntry, error } = await supabase
        .from("entries")
        .insert({
          client_id: user.id,
          coach_id: user.id,
          type: "one_liner",
          content: oneLiner,
          theme_tags: themeTags,
          date: new Date().toISOString().split("T")[0],
          metadata: {},
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to save one-liner:", error);
      } else {
        // Fire-and-forget: generate embedding for RAG
        if (insertedEntry) {
          fetch("/api/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entryId: insertedEntry.id }),
          }).catch((err) => console.warn("Embedding generation failed:", err));
        }
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

  if (!user) {
    return (
      <div style={{ textAlign: "center", paddingTop: 120, fontFamily: fonts.body }}>
        <p style={{ color: colors.gray400 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>
            The work continues.
          </h1>
          <p style={{ fontSize: 14, color: colors.gray400, margin: 0 }}>{user.email}</p>
        </div>

        {/* One-liner capture */}
        <form onSubmit={handleOneLiner} style={{
          ...card, padding: 20, marginBottom: 24,
        }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: colors.gray600, marginBottom: 8 }}>
            What&apos;s on your mind?
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="A thought. A feeling. Something you noticed."
              disabled={submitting}
              style={{
                flex: 1, padding: "10px 14px", fontSize: 15,
                border: `1px solid ${colors.gray200}`, borderRadius: 8,
                outline: "none", boxSizing: "border-box",
              }}
            />
            <button type="submit" disabled={submitting || !oneLiner.trim()} style={{
              padding: "10px 20px", fontSize: 14, fontWeight: 600, color: colors.white,
              backgroundColor: submitting || !oneLiner.trim() ? colors.gray400 : colors.primary,
              border: "none", borderRadius: 8,
              cursor: submitting || !oneLiner.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", transition: "background-color 0.15s",
            }}>
              {submitting ? "..." : "Capture"}
            </button>
          </div>
          {flash && (
            <p style={{ fontSize: 13, color: colors.success, margin: "8px 0 0 0" }}>{flash}</p>
          )}
        </form>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: colors.primary }}>{streak}</p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>day streak</p>
          </div>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: colors.primary }}>
              {recentEntries.filter((e) => e.type === "journal").length}
            </p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>entries this week</p>
          </div>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0",
              color: todaysExercise?.completed ? colors.success : colors.warning,
            }}>
              {todaysExercise ? (todaysExercise.completed ? "\u2713" : "\u2022") : "\u2014"}
            </p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
              {todaysExercise ? (todaysExercise.completed ? "exercise done" : "exercise pending") : "no exercise"}
            </p>
          </div>
        </div>

        {/* Top themes */}
        {topThemes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px 0", color: colors.gray600 }}>
              Themes this week
            </h3>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {topThemes.map(({ tag, count }) => (
                <span key={tag} style={{
                  padding: "4px 12px", fontSize: 13,
                  backgroundColor: colors.primaryLight, color: colors.primaryDark,
                  borderRadius: 16, border: `1px solid ${colors.primaryMuted}`,
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
            { href: "/journal", label: "Journal", desc: "Write. Get seen." },
            { href: "/exercise", label: "Exercise", desc: "Today's real work" },
            { href: "/plan", label: "Plan", desc: "Your 12-week map" },
            { href: "/weekly-review", label: "Review", desc: "What showed up this week" },
            { href: "/monthly-summary", label: "Monthly", desc: "See the patterns" },
            { href: "/privacy", label: "Privacy", desc: "Your data. Full stop." },
          ].map(({ href, label, desc }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                ...card, padding: 16, textAlign: "left",
                cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px 0", color: colors.black }}>{label}</p>
              <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>{desc}</p>
            </button>
          ))}
        </div>

        {/* Recent entries */}
        {recentEntries.length > 0 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: colors.gray600 }}>
              Recent entries
            </h3>
            {recentEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} style={{
                ...card, padding: 14, marginBottom: 8,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 12,
                    padding: "2px 8px", backgroundColor: entry.type === "one_liner" ? colors.warningLight : colors.primaryLight,
                    borderRadius: 10, border: `1px solid ${entry.type === "one_liner" ? "#fde68a" : colors.primaryMuted}`,
                    color: entry.type === "one_liner" ? "#92400e" : colors.primaryDark,
                  }}>
                    {entry.type === "one_liner" ? "thought" : "journal"}
                  </span>
                  <span style={{ fontSize: 12, color: colors.gray300 }}>{entry.date}</span>
                </div>
                <p style={{
                  fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.5,
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
                        backgroundColor: colors.gray50, color: colors.gray600,
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
    </div>
  );
}
