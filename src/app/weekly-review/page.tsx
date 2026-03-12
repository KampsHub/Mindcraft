"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Entry {
  id: string;
  type: string;
  content: string;
  theme_tags: string[];
  date: string;
  metadata: Record<string, unknown>;
}

interface Exercise {
  id: string;
  completed: boolean;
  date: string;
  content: string;
}

interface WeeklyReview {
  id: string;
  week_start: string;
  accountability_rating: number;
  reflection: string;
  plan_adjustments: string;
  created_at: string;
}

export default function WeeklyReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [themeCounts, setThemeCounts] = useState<{ tag: string; count: number }[]>([]);
  const [rating, setRating] = useState(0);
  const [reflection, setReflection] = useState("");
  const [planAdjustments, setPlanAdjustments] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastReviews, setPastReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Get Monday of the current week
  function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split("T")[0];
  }

  const weekStart = getWeekStart();

  const fetchWeekData = useCallback(async (userId: string) => {
    // Get entries from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString().split("T")[0];

    const { data: weekEntries } = await supabase
      .from("entries")
      .select("*")
      .eq("client_id", userId)
      .gte("date", startDate)
      .order("date", { ascending: true });

    if (weekEntries) {
      setEntries(weekEntries);

      // Count themes
      const counts: Record<string, number> = {};
      weekEntries.forEach((e) => {
        (e.theme_tags || []).forEach((tag: string) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });
      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .map(([tag, count]) => ({ tag, count }));
      setThemeCounts(sorted);
    }

    // Get exercises from this week
    const { data: weekExercises } = await supabase
      .from("exercises")
      .select("*")
      .gte("date", startDate)
      .order("date", { ascending: true });

    if (weekExercises) {
      setExercises(weekExercises);
    }

    // Check for existing review this week
    const { data: existingReview } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("client_id", userId)
      .eq("week_start", weekStart)
      .single();

    if (existingReview) {
      setRating(existingReview.accountability_rating);
      setReflection(existingReview.reflection || "");
      setPlanAdjustments(existingReview.plan_adjustments || "");
      setSaved(true);
    }

    // Fetch past reviews
    const { data: reviews } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("client_id", userId)
      .order("week_start", { ascending: false })
      .limit(8);

    if (reviews) {
      setPastReviews(reviews);
    }

    setLoading(false);
  }, [supabase, weekStart]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchWeekData(user.id);
    });
  }, [supabase.auth, router, fetchWeekData]);

  async function handleSave() {
    if (!user || !rating) return;
    setSaving(true);

    const reviewData = {
      client_id: user.id,
      week_start: weekStart,
      accountability_rating: rating,
      reflection,
      plan_adjustments: planAdjustments,
      entries_count: entries.filter((e) => e.type === "journal").length,
      exercises_completed: exercises.filter((e) => e.completed).length,
      top_themes: themeCounts.slice(0, 5).map((t) => t.tag),
    };

    // Upsert — update if review for this week already exists
    const { error } = await supabase
      .from("weekly_reviews")
      .upsert(reviewData, { onConflict: "client_id,week_start" });

    if (error) {
      console.error("Failed to save review:", error);
      alert("Failed to save. Check console for details.");
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  const container: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ ...container, textAlign: "center", paddingTop: 120 }}>
        <p style={{ color: "#888" }}>Loading your week...</p>
      </div>
    );
  }

  const journalCount = entries.filter((e) => e.type === "journal").length;
  const oneLinerCount = entries.filter((e) => e.type === "one_liner").length;
  const exercisesCompleted = exercises.filter((e) => e.completed).length;
  const exercisesTotal = exercises.length;

  return (
    <div style={container}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 4px 0" }}>Weekly Review</h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
            Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button onClick={() => router.push("/dashboard")} style={{
          padding: "8px 16px", fontSize: 13, color: "#666",
          backgroundColor: "transparent", border: "1px solid #ddd",
          borderRadius: 6, cursor: "pointer",
        }}>
          Dashboard
        </button>
      </div>

      {/* Week at a glance */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12, marginBottom: 28,
      }}>
        <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#2563eb" }}>{journalCount}</p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>journal entries</p>
        </div>
        <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: "#2563eb" }}>{oneLinerCount}</p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>quick thoughts</p>
        </div>
        <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0",
            color: exercisesCompleted === exercisesTotal && exercisesTotal > 0 ? "#16a34a" : "#f59e0b"
          }}>
            {exercisesCompleted}/{exercisesTotal}
          </p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>exercises done</p>
        </div>
      </div>

      {/* Theme bar chart */}
      {themeCounts.length > 0 && (
        <div style={{ marginBottom: 28 }} className="print-section">
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0" }}>Themes This Week</h2>
          <div style={{ width: "100%", height: Math.max(200, themeCounts.length * 36) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={themeCounts.map(({ tag, count }) => ({
                  name: tag.replace(/_/g, " "),
                  count,
                }))}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={160}
                  tick={{ fontSize: 13, fill: "#555" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [`${value} entries`, "Count"]}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Accountability trend (from past reviews) */}
      {pastReviews.length > 1 && (
        <div style={{ marginBottom: 28 }} className="print-section">
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0" }}>Accountability Trend</h2>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[...pastReviews]
                  .reverse()
                  .map((r) => ({
                    week: new Date(r.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    rating: r.accountability_rating,
                  }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [`${value}/5`, "Rating"]}
                />
                <Line type="monotone" dataKey="rating" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Accountability rating */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0" }}>
          How did you show up this week?
        </h2>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 12px 0" }}>
          1 = barely engaged &nbsp;&middot;&nbsp; 5 = fully committed
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                width: 48, height: 48, fontSize: 18, fontWeight: 600,
                border: rating === n ? "2px solid #2563eb" : "1px solid #ddd",
                borderRadius: 10,
                backgroundColor: rating === n ? "#eff6ff" : "#fff",
                color: rating === n ? "#2563eb" : "#888",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Reflection */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0" }}>
          What stood out this week?
        </h2>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 12px 0" }}>
          What did you notice, learn, or feel? What surprised you?
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={5}
          placeholder="Write freely — this is for you."
          style={{
            width: "100%", padding: 14, fontSize: 15, lineHeight: 1.6,
            border: "1px solid #ddd", borderRadius: 8,
            resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Plan adjustments */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0" }}>
          Anything to adjust in your plan?
        </h2>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 12px 0" }}>
          Want to shift focus, change pace, or try a different approach next week?
        </p>
        <textarea
          value={planAdjustments}
          onChange={(e) => setPlanAdjustments(e.target.value)}
          rows={3}
          placeholder="Optional — leave blank if the current plan feels right."
          style={{
            width: "100%", padding: 14, fontSize: 15, lineHeight: 1.6,
            border: "1px solid #ddd", borderRadius: 8,
            resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Save + Print buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
        <button
          onClick={handleSave}
          disabled={saving || !rating}
          style={{
            padding: "12px 32px", fontSize: 15, fontWeight: 500, color: "#fff",
            backgroundColor: saving || !rating ? "#999" : saved ? "#16a34a" : "#2563eb",
            border: "none", borderRadius: 8,
            cursor: saving || !rating ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : saved ? "Saved \u2713" : "Save review"}
        </button>
        <button
          onClick={() => window.print()}
          className="no-print"
          style={{
            padding: "12px 24px", fontSize: 15, fontWeight: 500,
            color: "#666", backgroundColor: "transparent",
            border: "1px solid #ddd", borderRadius: 8, cursor: "pointer",
          }}
        >
          Print
        </button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12pt; }
          button { display: none !important; }
          textarea { border: 1px solid #ccc !important; }
          .print-section { break-inside: avoid; }
        }
      `}</style>

      {/* Past reviews */}
      {pastReviews.length > 1 && (
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0", color: "#475569" }}>
            Past Reviews
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pastReviews
              .filter((r) => r.week_start !== weekStart)
              .map((review) => (
                <div key={review.id} style={{
                  padding: 14, border: "1px solid #f0f0f0", borderRadius: 8,
                  backgroundColor: "#fafafa",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      Week of {new Date(review.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span style={{
                      fontSize: 13, padding: "2px 10px", borderRadius: 10,
                      backgroundColor: review.accountability_rating >= 4 ? "#f0fdf4" : review.accountability_rating >= 3 ? "#fffbeb" : "#fef2f2",
                      color: review.accountability_rating >= 4 ? "#166534" : review.accountability_rating >= 3 ? "#92400e" : "#991b1b",
                    }}>
                      {review.accountability_rating}/5
                    </span>
                  </div>
                  {review.reflection && (
                    <p style={{
                      fontSize: 14, color: "#555", margin: 0, lineHeight: 1.5,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {review.reflection}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
