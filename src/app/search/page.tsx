"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

type SearchType = "exercises" | "entries" | "insights";

interface ExerciseResult {
  id: string;
  framework_name: string;
  custom_framing: string | null;
  modality: string | null;
  exercise_type: string;
  responses: Record<string, unknown>;
  star_rating: number | null;
  insight: string | null;
  completed_at: string;
  day_number: number | null;
  framework: { instructions: string; originator: string; description: string } | null;
}

interface EntryResult {
  id: string;
  day_number: number;
  step_2_journal: string;
  date: string;
  completed_at: string | null;
}

interface InsightResult {
  id: string;
  insight: string;
  source: string;
  type: string;
  created_at: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<SearchType>("exercises");
  const [results, setResults] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const search = useCallback(async (q: string, type: SearchType) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (q) params.set("q", q);
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query, activeType), 300);
    return () => clearTimeout(timer);
  }, [query, activeType, search]);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [supabase.auth, router]);

  // Load initial results
  useEffect(() => {
    search("", activeType);
  }, [activeType, search]);

  function highlightMatch(text: string, q: string): string {
    if (!q || !text) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "**$1**");
  }

  const tabs: { type: SearchType; label: string }[] = [
    { type: "exercises", label: "Exercises" },
    { type: "entries", label: "Journal Entries" },
    { type: "insights", label: "Insights" },
  ];

  return (
    <PageShell maxWidth={720}>
      <FadeIn preset="slide-up" triggerOnMount>
        <h1 style={{
          fontFamily: display, fontSize: 24, fontWeight: 700,
          color: colors.textPrimary, marginBottom: 20,
        }}>
          Search
        </h1>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search exercises, entries, insights..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px 14px 44px",
              fontFamily: body, fontSize: 15, color: colors.textPrimary,
              backgroundColor: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: radii.md, outline: "none",
              boxSizing: "border-box",
            }}
          />
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => { setActiveType(tab.type); setExpandedId(null); }}
              style={{
                fontFamily: display, fontSize: 13, fontWeight: 600,
                padding: "8px 16px", borderRadius: 100, cursor: "pointer",
                border: activeType === tab.type ? `2px solid ${colors.coral}` : `1px solid ${colors.borderDefault}`,
                backgroundColor: activeType === tab.type ? colors.coralWash : "transparent",
                color: activeType === tab.type ? colors.coral : colors.textMuted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted, textAlign: "center", padding: 40 }}>
            Searching...
          </p>
        ) : results.length === 0 ? (
          <p style={{ fontFamily: body, fontSize: 14, color: colors.textMuted, textAlign: "center", padding: 40 }}>
            {query ? "No results found." : "Your past work will appear here."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeType === "exercises" && (results as ExerciseResult[]).map((ex) => (
              <motion.div
                key={ex.id}
                whileHover={{ borderColor: `${colors.coral}40` }}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: radii.md, border: `1px solid ${colors.borderDefault}`,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
                  style={{
                    width: "100%", display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "14px 18px",
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                      {ex.framework_name}
                    </span>
                    {ex.day_number && (
                      <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, marginLeft: 10 }}>
                        Day {ex.day_number}
                      </span>
                    )}
                    {ex.modality && (
                      <span style={{
                        fontSize: 10, fontWeight: 600, fontFamily: display,
                        padding: "2px 8px", borderRadius: 20, marginLeft: 8,
                        backgroundColor: `${colors.coral}15`, color: colors.coral,
                      }}>
                        {ex.modality}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {ex.star_rating && (
                      <span style={{ fontSize: 12, color: colors.coral }}>
                        {"★".repeat(ex.star_rating)}{"☆".repeat(5 - ex.star_rating)}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: colors.textMuted }}>
                      {new Date(ex.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === ex.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${colors.borderSubtle}` }}>
                        {/* Framework instructions */}
                        {ex.framework?.instructions && (
                          <div style={{ marginTop: 14 }}>
                            <h4 style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                              Instructions
                            </h4>
                            <p style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                              {ex.framework.instructions}
                            </p>
                            {ex.framework.originator && (
                              <p style={{ fontFamily: body, fontSize: 11, color: colors.textMuted, marginTop: 6 }}>
                                Framework by {ex.framework.originator}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Custom framing */}
                        {ex.custom_framing && (
                          <div style={{ marginTop: 14 }}>
                            <h4 style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                              Your personalized version
                            </h4>
                            <p style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>
                              {ex.custom_framing}
                            </p>
                          </div>
                        )}

                        {/* Insight */}
                        {ex.insight && (
                          <div style={{ marginTop: 14, padding: 12, backgroundColor: `${colors.coral}08`, borderRadius: 8, borderLeft: `3px solid ${colors.coral}` }}>
                            <h4 style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: colors.coral, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                              Insight
                            </h4>
                            <p style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary, lineHeight: 1.5, margin: 0 }}>
                              {ex.insight}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {activeType === "entries" && (results as EntryResult[]).map((entry) => (
              <div
                key={entry.id}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: radii.md, border: `1px solid ${colors.borderDefault}`,
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                    Day {entry.day_number}
                  </span>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                    {entry.date ? new Date(entry.date).toLocaleDateString() : ""}
                  </span>
                </div>
                <p style={{
                  fontFamily: body, fontSize: 13, color: colors.textSecondary,
                  lineHeight: 1.6, margin: 0,
                  display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}>
                  {entry.step_2_journal}
                </p>
              </div>
            ))}

            {activeType === "insights" && (results as InsightResult[]).map((ins) => (
              <div
                key={ins.id}
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: radii.md, border: `1px solid ${colors.borderDefault}`,
                  padding: "14px 18px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 600, fontFamily: display,
                    padding: "2px 8px", borderRadius: 20, textTransform: "uppercase",
                    backgroundColor: ins.type === "shift" ? "#60a5fa20" : ins.type === "breakthrough" ? "#34d39920" : `${colors.coral}15`,
                    color: ins.type === "shift" ? "#60a5fa" : ins.type === "breakthrough" ? "#34d399" : colors.coral,
                  }}>
                    {ins.type}
                  </span>
                  <span style={{ fontSize: 11, color: colors.textMuted }}>
                    {ins.source}
                  </span>
                </div>
                <p style={{ fontFamily: body, fontSize: 14, color: colors.textPrimary, lineHeight: 1.6, margin: 0 }}>
                  {ins.insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </PageShell>
  );
}
