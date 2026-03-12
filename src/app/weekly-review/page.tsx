"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";
import { content as c } from "@/content/site";

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

    const { data: weekExercises } = await supabase
      .from("exercises")
      .select("*")
      .gte("date", startDate)
      .order("date", { ascending: true });

    if (weekExercises) {
      setExercises(weekExercises);
    }

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

  if (loading) {
    return (
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <p style={{ color: colors.gray400 }}>{c.weeklyReview.loadingText}</p>
        </div>
      </div>
    );
  }

  const journalCount = entries.filter((e) => e.type === "journal").length;
  const oneLinerCount = entries.filter((e) => e.type === "one_liner").length;
  const exercisesCompleted = exercises.filter((e) => e.completed).length;
  const exercisesTotal = exercises.length;

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>{c.weeklyReview.headline}</h1>
          <p style={{ fontSize: 14, color: colors.gray400, margin: 0 }}>
            Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Week at a glance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: colors.primary }}>{journalCount}</p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>{c.weeklyReview.stats.journalEntries}</p>
          </div>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0", color: colors.primary }}>{oneLinerCount}</p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>{c.weeklyReview.stats.quickThoughts}</p>
          </div>
          <div style={{ ...card, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0",
              color: exercisesCompleted === exercisesTotal && exercisesTotal > 0 ? colors.success : colors.warning
            }}>
              {exercisesCompleted}/{exercisesTotal}
            </p>
            <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>{c.weeklyReview.stats.exercisesDone}</p>
          </div>
        </div>

        {/* Theme bar chart */}
        {themeCounts.length > 0 && (
          <div style={{ marginBottom: 28 }} className="print-section">
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0", color: colors.black }}>{c.weeklyReview.themesHeading}</h2>
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
                    tick={{ fontSize: 13, fill: colors.gray500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 13, borderRadius: 8, border: `1px solid ${colors.gray100}` }}
                    formatter={(value) => [`${value} entries`, "Count"]}
                  />
                  <Bar dataKey="count" fill={colors.primary} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accountability trend */}
        {pastReviews.length > 1 && (
          <div style={{ marginBottom: 28 }} className="print-section">
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0", color: colors.black }}>{c.weeklyReview.trendHeading}</h2>
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
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: colors.gray400 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: colors.gray400 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ fontSize: 13, borderRadius: 8, border: `1px solid ${colors.gray100}` }}
                    formatter={(value) => [`${value}/5`, "Rating"]}
                  />
                  <Line type="monotone" dataKey="rating" stroke={colors.primary} strokeWidth={2} dot={{ fill: colors.primary, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accountability rating */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
            {c.weeklyReview.rating.heading}
          </h2>
          <p style={{ fontSize: 14, color: colors.gray500, margin: "0 0 12px 0" }}>
            {c.weeklyReview.rating.scale}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                style={{
                  width: 48, height: 48, fontSize: 18, fontWeight: 600,
                  border: rating === n ? `2px solid ${colors.primary}` : `1px solid ${colors.gray200}`,
                  borderRadius: 10,
                  backgroundColor: rating === n ? colors.primaryLight : colors.white,
                  color: rating === n ? colors.primaryDark : colors.gray400,
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
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
            {c.weeklyReview.reflection.heading}
          </h2>
          <p style={{ fontSize: 14, color: colors.gray500, margin: "0 0 12px 0" }}>
            {c.weeklyReview.reflection.subheadline}
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={5}
            placeholder={c.weeklyReview.reflection.placeholder}
            style={{
              width: "100%", padding: 14, fontSize: 15, lineHeight: 1.6,
              border: `1px solid ${colors.gray200}`, borderRadius: 8,
              resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Plan adjustments */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
            {c.weeklyReview.adjustments.heading}
          </h2>
          <p style={{ fontSize: 14, color: colors.gray500, margin: "0 0 12px 0" }}>
            {c.weeklyReview.adjustments.subheadline}
          </p>
          <textarea
            value={planAdjustments}
            onChange={(e) => setPlanAdjustments(e.target.value)}
            rows={3}
            placeholder={c.weeklyReview.adjustments.placeholder}
            style={{
              width: "100%", padding: 14, fontSize: 15, lineHeight: 1.6,
              border: `1px solid ${colors.gray200}`, borderRadius: 8,
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
              padding: "12px 32px", fontSize: 15, fontWeight: 600, color: colors.white,
              backgroundColor: saving || !rating ? colors.gray400 : saved ? colors.success : colors.primary,
              border: "none", borderRadius: 8,
              cursor: saving || !rating ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {saving ? c.weeklyReview.savingButton : saved ? c.weeklyReview.savedButton : c.weeklyReview.saveButton}
          </button>
          <button
            onClick={() => window.print()}
            className="no-print"
            style={{
              padding: "12px 24px", fontSize: 15, fontWeight: 600,
              color: colors.gray500, backgroundColor: "transparent",
              border: `1px solid ${colors.gray200}`, borderRadius: 8, cursor: "pointer",
            }}
          >
            {c.weeklyReview.printButton}
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
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 16px 0", color: colors.gray600 }}>
              {c.weeklyReview.pastReviewsHeading}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pastReviews
                .filter((r) => r.week_start !== weekStart)
                .map((review) => (
                  <div key={review.id} style={{ ...card, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: colors.black }}>
                        Week of {new Date(review.week_start + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span style={{
                        fontSize: 13, padding: "2px 10px", borderRadius: 10,
                        backgroundColor: review.accountability_rating >= 4 ? colors.successLight : review.accountability_rating >= 3 ? colors.warningLight : colors.errorLight,
                        color: review.accountability_rating >= 4 ? "#166534" : review.accountability_rating >= 3 ? "#92400e" : "#991b1b",
                      }}>
                        {review.accountability_rating}/5
                      </span>
                    </div>
                    {review.reflection && (
                      <p style={{
                        fontSize: 14, color: colors.gray500, margin: 0, lineHeight: 1.5,
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
    </div>
  );
}
