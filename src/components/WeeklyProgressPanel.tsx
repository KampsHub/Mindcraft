"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors, fonts, space, text as textPreset, radii } from "@/lib/theme";
import { createClient } from "@/lib/supabase";

// WeeklyProgressPanel
//
// Shown at the top of the day flow on Day 7, 14, 21, and 30 so the user
// can see all active goals + insights from the week without navigating
// away to /weekly-review. Pulls from client_goals + weekly_reviews.
//
// This inlines the "program progress" view that used to live on
// /weekly-review for the moment of the program where it's most useful —
// the end of each week.

const display = fonts.display;
const body = fonts.bodyAlt;

type Goal = { id: string; goal_text: string; status: string };
type Insight = {
  title?: string;
  insight?: string;
  description?: string;
  date?: string;
  day_number?: number;
};
type WeeklyReview = {
  week_number: number;
  key_insights: Insight[] | null;
  summary_text: string | null;
  reflection: string | null;
};

export default function WeeklyProgressPanel({
  enrollmentId,
  dayNumber,
}: {
  enrollmentId: string;
  dayNumber: number;
}) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [loading, setLoading] = useState(true);

  const weekNumber = Math.ceil(dayNumber / 7);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const [{ data: goalsData }, { data: reviewsData }] = await Promise.all([
          supabase
            .from("client_goals")
            .select("id, goal_text, status")
            .eq("enrollment_id", enrollmentId)
            .in("status", ["active", "completed"]),
          userId
            ? supabase
                .from("weekly_reviews")
                .select("week_number, key_insights, summary_text, reflection")
                .eq("client_id", userId)
                .eq("enrollment_id", enrollmentId)
                .not("key_insights", "is", null)
                .order("week_number", { ascending: true })
            : Promise.resolve({ data: [] as WeeklyReview[] }),
        ]);
        if (cancelled) return;
        setGoals((goalsData ?? []) as Goal[]);
        setReviews((reviewsData ?? []) as WeeklyReview[]);
      } catch {
        // silent — panel renders empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [enrollmentId]);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`,
        padding: space[5],
        marginBottom: space[6],
      }}
    >
      <p style={{
        fontFamily: display, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: colors.coral, margin: "0 0 6px 0",
      }}>
        Program progress
      </p>
      <p style={{
        fontFamily: display, fontSize: 22, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 6px 0",
        letterSpacing: "-0.02em",
      }}>
        Week {weekNumber} check-in
      </p>
      <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 20px 0", opacity: 0.85 }}>
        Your goals and the insights that have surfaced so far. Take a moment to see what&rsquo;s landing.
      </p>

      {/* Goals */}
      <div style={{ marginBottom: space[5] }}>
        <p style={{
          fontFamily: body, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: colors.textPrimary, margin: "0 0 10px 0", opacity: 0.7,
        }}>
          Your goals
        </p>
        {goals.length === 0 ? (
          <p style={{ ...textPreset.secondary, color: colors.textPrimary, margin: 0, opacity: 0.6 }}>
            No goals set yet. You can add them from the nav menu.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {goals.map((g) => (
              <div key={g.id} style={{
                padding: "10px 14px",
                borderRadius: radii.md,
                backgroundColor: colors.bgElevated,
                borderLeft: `3px solid ${g.status === "completed" ? colors.coral : "rgba(196,148,58,0.4)"}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18, height: 18, borderRadius: 4,
                  flexShrink: 0,
                  marginTop: 2,
                  backgroundColor: g.status === "completed" ? colors.coral : "transparent",
                  border: `1.5px solid ${g.status === "completed" ? colors.coral : colors.borderDefault}`,
                }}>
                  {g.status === "completed" && (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span style={{
                  ...textPreset.body, color: colors.textPrimary,
                  textDecoration: g.status === "completed" ? "line-through" : "none",
                  opacity: g.status === "completed" ? 0.7 : 1,
                }}>
                  {g.goal_text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div>
        <p style={{
          fontFamily: body, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: colors.textPrimary, margin: "0 0 10px 0", opacity: 0.7,
        }}>
          Insights so far
        </p>
        {reviews.length === 0 ? (
          <p style={{ ...textPreset.secondary, color: colors.textPrimary, margin: 0, opacity: 0.6 }}>
            No insights captured yet. Finish today&rsquo;s session and more will appear here next week.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.map((r) => (
              <div key={r.week_number}>
                <p style={{
                  ...textPreset.caption, color: colors.coral,
                  margin: "0 0 6px 0",
                }}>
                  Week {r.week_number}
                </p>
                {r.summary_text && (
                  <p style={{ ...textPreset.body, color: colors.textPrimary, margin: "0 0 8px 0" }}>
                    {r.summary_text}
                  </p>
                )}
                {r.key_insights && r.key_insights.length > 0 && (
                  <ul style={{
                    ...textPreset.body, color: colors.textPrimary,
                    margin: "0 0 0 18px", padding: 0,
                  }}>
                    {r.key_insights.slice(0, 5).map((ins, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>
                        {ins.insight || ins.description || ins.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
