"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Entry {
  id: string;
  type: string;
  content: string;
  theme_tags: string[];
  date: string;
}

interface Goal {
  goal: string;
  why: string;
}

interface Plan {
  id: string;
  goals: Goal[];
  summary: string;
  focus_areas: { area: string; description: string }[];
  weekly_themes: { weeks: string; theme: string; description: string }[];
  current_phase: string;
}

interface WeeklyReview {
  week_start: string;
  accountability_rating: number;
  entries_count: number;
  exercises_completed: number;
  top_themes: string[];
  reflection: string;
}

const COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#8b5cf6", "#06b6d4"];

export default function MonthlySummaryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [themeCounts, setThemeCounts] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareable, setShareable] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fetchMonthData = useCallback(async (userId: string) => {
    // Entries from this month
    const { data: monthEntries } = await supabase
      .from("entries")
      .select("*")
      .eq("client_id", userId)
      .gte("date", monthStart)
      .order("date", { ascending: true });

    if (monthEntries) {
      setEntries(monthEntries);

      // Theme counts
      const counts: Record<string, number> = {};
      monthEntries.forEach((e) => {
        (e.theme_tags || []).forEach((tag: string) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });
      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([tag, count]) => ({ name: tag.replace(/_/g, " "), count }));
      setThemeCounts(sorted);
    }

    // Coaching plan
    const { data: planData } = await supabase
      .from("coaching_plans")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (planData) {
      setPlan(planData);
    }

    // Weekly reviews from this month
    const { data: reviewData } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("client_id", userId)
      .gte("week_start", monthStart)
      .order("week_start", { ascending: true });

    if (reviewData) {
      setReviews(reviewData);
    }

    setLoading(false);
  }, [supabase, monthStart]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      fetchMonthData(user.id);
    });
  }, [supabase.auth, router, fetchMonthData]);

  const container: React.CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ ...container, textAlign: "center", paddingTop: 120 }}>
        <p style={{ color: "#888" }}>Loading your month...</p>
      </div>
    );
  }

  const journalCount = entries.filter((e) => e.type === "journal").length;
  const oneLinerCount = entries.filter((e) => e.type === "one_liner").length;
  const totalEntries = entries.length;
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.accountability_rating, 0) / reviews.length).toFixed(1)
    : "—";
  const totalExercises = reviews.reduce((sum, r) => sum + (r.exercises_completed || 0), 0);

  // Activity by day of week
  const dayMap: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  entries.forEach((e) => {
    const day = new Date(e.date + "T00:00:00").getDay();
    dayMap[dayNames[day]]++;
  });
  const activityByDay = dayNames.map((d) => ({ day: d, entries: dayMap[d] }));

  return (
    <div style={container}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 4px 0" }}>Monthly Summary</h1>
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{monthName}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} className="no-print" style={{
            padding: "8px 16px", fontSize: 13, color: "#666",
            backgroundColor: "transparent", border: "1px solid #ddd",
            borderRadius: 6, cursor: "pointer",
          }}>
            Print
          </button>
          <button onClick={() => router.push("/dashboard")} style={{
            padding: "8px 16px", fontSize: 13, color: "#666",
            backgroundColor: "transparent", border: "1px solid #ddd",
            borderRadius: 6, cursor: "pointer",
          }}>
            Dashboard
          </button>
        </div>
      </div>

      {/* Month stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
        {[
          { value: totalEntries, label: "total entries" },
          { value: journalCount, label: "journals" },
          { value: totalExercises, label: "exercises" },
          { value: avgRating, label: "avg rating" },
        ].map(({ value, label }) => (
          <div key={label} style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 2px 0", color: "#2563eb" }}>{value}</p>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Theme distribution pie chart */}
      {themeCounts.length > 0 && (
        <div style={{ marginBottom: 28 }} className="print-section">
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0" }}>Theme Distribution</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={themeCounts}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {themeCounts.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {themeCounts.map(({ name, count }, i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS[i % COLORS.length] }} />
                  <span style={{ fontSize: 13, color: "#555" }}>{name} ({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity by day of week */}
      <div style={{ marginBottom: 28 }} className="print-section">
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0" }}>Activity by Day</h2>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityByDay} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8 }} />
              <Bar dataKey="entries" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress vs goals */}
      {plan && plan.goals && (
        <div style={{ marginBottom: 28 }} className="print-section">
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px 0" }}>Progress vs Goals</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(plan.goals as Goal[]).map((goal, i) => {
              // Count entries that mention themes related to this goal
              const relatedEntries = entries.filter((e) =>
                (e.theme_tags || []).some((tag) =>
                  goal.goal.toLowerCase().includes(tag.replace(/_/g, " "))
                  || goal.why.toLowerCase().includes(tag.replace(/_/g, " "))
                )
              ).length;

              return (
                <div key={i} style={{
                  padding: 14, border: "1px solid #e2e8f0", borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{goal.goal}</p>
                    <span style={{
                      fontSize: 12, padding: "2px 8px", borderRadius: 10,
                      backgroundColor: relatedEntries > 3 ? "#f0fdf4" : relatedEntries > 0 ? "#fffbeb" : "#f8fafc",
                      color: relatedEntries > 3 ? "#166534" : relatedEntries > 0 ? "#92400e" : "#888",
                    }}>
                      {relatedEntries} related entries
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{goal.why}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly review summaries */}
      {reviews.length > 0 && (
        <div style={{ marginBottom: 28 }} className="print-section">
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px 0" }}>Weekly Reflections</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reviews.map((review) => (
              <div key={review.week_start} style={{
                padding: 14, border: "1px solid #f0f0f0", borderRadius: 8,
                backgroundColor: "#fafafa",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    Week of {new Date(review.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span style={{ fontSize: 13, color: "#2563eb" }}>{review.accountability_rating}/5</span>
                </div>
                {review.reflection && (
                  <p style={{ fontSize: 14, color: "#555", margin: 0, lineHeight: 1.5 }}>
                    {review.reflection}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shareable toggle */}
      <div style={{
        padding: 16, border: "1px solid #e2e8f0", borderRadius: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 32,
      }} className="no-print">
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px 0" }}>Share with coach</p>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>Allow your coach to view this monthly summary</p>
        </div>
        <button
          onClick={() => setShareable(!shareable)}
          style={{
            width: 48, height: 26, borderRadius: 13,
            backgroundColor: shareable ? "#2563eb" : "#ddd",
            border: "none", cursor: "pointer",
            position: "relative", transition: "background-color 0.2s",
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: "#fff", position: "absolute",
            top: 2, left: shareable ? 24 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }} />
        </button>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 11pt; }
          button { display: none !important; }
          .print-section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
