"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { colors, fonts, card } from "@/lib/theme";

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
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <p style={{ color: colors.gray400 }}>Loading your coaching plan...</p>
        </div>
      </div>
    );
  }

  // No plan yet — offer to generate
  if (!plan) {
    return (
      <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
        <Nav />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px", textAlign: "center", paddingTop: 80 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: colors.black }}>
            Your Coaching Plan
          </h1>
          <p style={{ color: colors.gray500, fontSize: 16, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 32px" }}>
            {error
              ? error
              : "Your plan hasn't been generated yet. Complete your intake first, then generate your personalised coaching plan."}
          </p>

          {generating && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24, color: colors.gray500 }}>
              <div style={{
                width: 20, height: 20,
                border: `2px solid ${colors.gray200}`, borderTopColor: colors.primary,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              <span>Generating your personalised plan — this takes about 15 seconds...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={generatePlan}
              disabled={generating}
              style={{
                padding: "12px 32px", fontSize: 15, fontWeight: 600,
                color: colors.white, backgroundColor: generating ? colors.gray400 : colors.primary,
                border: "none", borderRadius: 8,
                cursor: generating ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
              }}
            >
              {generating ? "Generating..." : "Generate my plan"}
            </button>
            <button
              onClick={() => router.push("/intake")}
              style={{
                padding: "12px 32px", fontSize: 15, fontWeight: 600,
                color: colors.gray500, backgroundColor: "transparent",
                border: `1px solid ${colors.gray200}`, borderRadius: 8, cursor: "pointer",
              }}
            >
              Go to intake
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display the plan
  const packageLabels: Record<string, string> = {
    layoff: "Layoff Recovery",
    international_move: "International Move",
    new_manager: "New Manager",
    general: "General Growth",
  };

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      <Nav />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: colors.black }}>
              Your Coaching Plan
            </h1>
            <p style={{ fontSize: 14, color: colors.gray400, margin: 0 }}>
              {packageLabels[plan.package] || plan.package} · Phase: {plan.current_phase}
            </p>
          </div>
          <button
            onClick={() => router.push("/journal")}
            style={{
              padding: "8px 20px", fontSize: 13, fontWeight: 600,
              color: colors.white, backgroundColor: colors.primary,
              border: "none", borderRadius: 6, cursor: "pointer",
            }}
          >
            Start journaling
          </button>
        </div>

        {/* Summary */}
        <div style={{ ...card, padding: 24, marginBottom: 32 }}>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: colors.black, margin: 0 }}>
            {plan.summary}
          </p>
        </div>

        {/* Goals */}
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: colors.black }}>Goals</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {plan.goals.map((g, i) => (
            <div key={i} style={{ ...card, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px 0", color: colors.black }}>
                {g.goal}
              </h3>
              <p style={{ fontSize: 14, color: colors.gray500, margin: 0, lineHeight: 1.5 }}>
                {g.why}
              </p>
            </div>
          ))}
        </div>

        {/* Focus Areas */}
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: colors.black }}>Focus Areas</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {plan.focus_areas.map((f, i) => (
            <div key={i} style={{ ...card, padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px 0", color: colors.black }}>
                {f.area}
              </h3>
              <p style={{ fontSize: 14, color: colors.dark, margin: "0 0 8px 0", lineHeight: 1.5 }}>
                {f.description}
              </p>
              <p style={{ fontSize: 12, color: colors.gray400, margin: 0, fontStyle: "italic" }}>
                Based on: {f.related_intake}
              </p>
            </div>
          ))}
        </div>

        {/* Weekly Themes */}
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: colors.black }}>12-Week Journey</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
          {plan.weekly_themes.map((w, i) => (
            <div key={i} style={{
              ...card, padding: 20,
              borderLeft: `4px solid ${colors.primary}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: colors.primaryDark,
                  backgroundColor: colors.primaryLight, padding: "2px 10px",
                  borderRadius: 12,
                }}>
                  Weeks {w.weeks}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: colors.black }}>
                  {w.theme}
                </h3>
              </div>
              <p style={{ fontSize: 14, color: colors.dark, margin: "0 0 10px 0", lineHeight: 1.5 }}>
                {w.description}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {w.frameworks.map((fw) => (
                  <span key={fw} style={{
                    padding: "3px 10px", fontSize: 12,
                    backgroundColor: colors.gray50, color: colors.gray600,
                    borderRadius: 12,
                  }}>
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
