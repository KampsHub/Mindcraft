"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import PillButton from "@/components/PillButton";
import FadeIn from "@/components/FadeIn";
import { colors, fonts, space, text, radii } from "@/lib/theme";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Types ── */
interface CompletedExercise {
  id: string;
  framework_name: string;
  exercise_type: string;
  modality: string | null;
  custom_framing: string | null;
  responses: Record<string, string>;
  star_rating: number | null;
  completed_at: string | null;
  daily_session_id: string;
  day_number?: number;
}

interface CoachingExercise {
  name: string;
  duration_min: number;
  custom_framing: string;
}

interface ProgramDay {
  day_number: number;
  title: string;
  coaching_exercises: CoachingExercise[];
}

interface Enrollment {
  id: string;
  program_id: string;
  current_day: number;
  programs: { name: string; slug: string };
}

type TabFilter = "completed" | "parked";
type ModalityFilter = "all" | "cognitive" | "somatic" | "relational" | "integrative" | "systems";

const modalityColors: Record<string, { bg: string; text: string; label: string }> = {
  cognitive: { bg: "rgba(224, 149, 133, 0.12)", text: colors.coral, label: "Cognitive" },
  somatic: { bg: colors.coralWash, text: colors.coralLight, label: "Somatic" },
  relational: { bg: "rgba(61, 40, 64, 0.5)", text: colors.coral, label: "Relational" },
  integrative: { bg: "rgba(224, 149, 133, 0.12)", text: colors.coral, label: "Integrative" },
  systems: { bg: colors.bgElevated, text: colors.textSecondary, label: "Systems" },
};

const typeLabels: Record<string, { label: string; color: string }> = {
  coaching_plan: { label: "Coaching Plan", color: colors.coral },
  overflow: { label: "Overflow", color: "#6366f1" },
  framework_analysis: { label: "Framework", color: "#3b82f6" },
};

interface ExercisesSectionProps {
  user: User;
  enrollment: Enrollment | null;
}

export default function ExercisesSection({ user, enrollment }: ExercisesSectionProps) {
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [parkedExercises, setParkedExercises] = useState<{ name: string; day_number: number; day_title: string; custom_framing: string; duration_min: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("completed");
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedParked, setExpandedParked] = useState<string | null>(null);
  const [parkedResponse, setParkedResponse] = useState("");
  const [parkedRating, setParkedRating] = useState<number | null>(null);
  const [savingParked, setSavingParked] = useState(false);
  const [sessionMap, setSessionMap] = useState<Map<number, string>>(new Map());
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  const loadData = useCallback(async () => {
    if (!enrollment) { setLoading(false); return; }

    const { data: sessions } = await supabase
      .from("daily_sessions")
      .select("id, day_number, completed_at")
      .eq("enrollment_id", enrollment.id);

    const sessMap = new Map<string, number>();
    const dayToSession = new Map<number, string>();
    const completedDays = new Set<number>();
    sessions?.forEach((s) => {
      sessMap.set(s.id, s.day_number);
      dayToSession.set(s.day_number, s.id);
      if (s.completed_at) completedDays.add(s.day_number);
    });
    setSessionMap(dayToSession);
    const sessionIds = sessions?.map((s) => s.id) || [];

    let completed: CompletedExercise[] = [];
    if (sessionIds.length > 0) {
      const { data: exData } = await supabase
        .from("exercise_completions")
        .select("*")
        .in("daily_session_id", sessionIds)
        .order("completed_at", { ascending: false });

      if (exData) {
        completed = exData.map((e) => ({
          ...e,
          day_number: sessMap.get(e.daily_session_id),
        }));
      }
    }
    setCompletedExercises(completed);

    const { data: programDays } = await supabase
      .from("program_days")
      .select("day_number, title, coaching_exercises")
      .eq("program_id", enrollment.program_id)
      .lte("day_number", enrollment.current_day)
      .order("day_number", { ascending: true });

    if (programDays) {
      const completedNames = new Set(completed.map((e) => e.framework_name));
      const parked: typeof parkedExercises = [];

      (programDays as ProgramDay[]).forEach((pd) => {
        // Only show parked exercises for days the user actually completed
        if (!completedDays.has(pd.day_number)) return;
        if (pd.coaching_exercises && Array.isArray(pd.coaching_exercises)) {
          pd.coaching_exercises.forEach((ce) => {
            if (!completedNames.has(ce.name)) {
              parked.push({
                name: ce.name,
                day_number: pd.day_number,
                day_title: pd.title,
                custom_framing: ce.custom_framing,
                duration_min: ce.duration_min,
              });
            }
          });
        }
      });

      setParkedExercises(parked);
    }

    setLoading(false);
  }, [supabase, enrollment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveParked(ex: typeof parkedExercises[0]) {
    if (!enrollment || !parkedResponse.trim() || savingParked) return;
    setSavingParked(true);

    let sessionId = sessionMap.get(ex.day_number);
    if (!sessionId) {
      const { data: newSession } = await supabase
        .from("daily_sessions")
        .insert({
          enrollment_id: enrollment.id,
          day_number: ex.day_number,
          date: new Date().toISOString().split("T")[0],
        })
        .select("id")
        .single();
      if (newSession) {
        sessionId = newSession.id;
        setSessionMap((prev) => new Map(prev).set(ex.day_number, newSession.id));
      }
    }

    if (!sessionId) {
      setSavingParked(false);
      return;
    }

    await supabase.from("exercise_completions").insert({
      daily_session_id: sessionId,
      enrollment_id: enrollment.id,
      framework_name: ex.name,
      framework_id: null,
      exercise_type: "coaching_plan",
      modality: null,
      custom_framing: ex.custom_framing || null,
      responses: { main: parkedResponse.trim() },
      star_rating: parkedRating,
    });

    setParkedResponse("");
    setParkedRating(null);
    setExpandedParked(null);
    setSavingParked(false);
    loadData();
  }

  if (!enrollment || loading) return null;
  // Don't show exercises section before the user has completed their first day
  if (enrollment.current_day < 1) return null;
  if (completedExercises.length === 0 && parkedExercises.length === 0) return null;

  const filteredCompleted = modalityFilter === "all"
    ? completedExercises
    : completedExercises.filter((e) => e.modality === modalityFilter);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "completed", label: "Completed", count: completedExercises.length },
    { key: "parked", label: "Parked", count: parkedExercises.length },
  ];

  return (
    <div style={{
      marginBottom: 28,
      backgroundColor: "rgba(51, 51, 57, 0.5)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderRadius: radii.lg,
      border: "1px solid rgba(255, 255, 255, 0.08)",
      padding: space[5],
    }}>
      {/* Section header — collapsible */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer", marginBottom: collapsed ? 0 : 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3 style={{
            ...text.heading, color: "#ffffff", margin: 0,
          }}>
            Exercises
          </h3>
          <span style={{
            ...text.caption, padding: "2px 8px", borderRadius: radii.full,
            backgroundColor: colors.bgElevated, color: "#ffffff",
          }}>
            {completedExercises.length} completed • {parkedExercises.length} parked
          </span>
        </div>
        <motion.svg
          width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    ...text.secondary, fontWeight: 600,
                    padding: "7px 16px",
                    color: activeTab === tab.key ? colors.bgDeep : colors.textSecondary,
                    backgroundColor: activeTab === tab.key ? colors.coral : colors.bgElevated,
                    border: "none", borderRadius: radii.full, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Modality filters */}
            {activeTab === "completed" && completedExercises.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                {(["all", "cognitive", "somatic", "relational", "integrative", "systems"] as ModalityFilter[]).map((mod) => {
                  const modStyle = mod !== "all" ? modalityColors[mod] : null;
                  const count = mod === "all"
                    ? completedExercises.length
                    : completedExercises.filter((e) => e.modality === mod).length;
                  if (mod !== "all" && count === 0) return null;
                  return (
                    <button
                      key={mod}
                      onClick={() => setModalityFilter(mod)}
                      style={{
                        ...text.caption,
                        padding: "4px 10px",
                        textTransform: "uppercase",
                        color: modalityFilter === mod
                          ? (modStyle?.text || colors.textPrimary)
                          : colors.textMuted,
                        backgroundColor: modalityFilter === mod
                          ? (modStyle?.bg || colors.bgElevated)
                          : "transparent",
                        border: `1px solid ${modalityFilter === mod
                          ? (modStyle?.text || colors.borderDefault) + "30"
                          : colors.borderDefault}`,
                        borderRadius: radii.full, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {mod === "all" ? "All" : modStyle?.label} {count > 0 ? `(${count})` : ""}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {/* Completed */}
              {activeTab === "completed" && (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {filteredCompleted.length === 0 ? (
                    <div style={{
                      backgroundColor: colors.bgSurface, borderRadius: radii.md,
                      border: `1px solid ${colors.borderDefault}`,
                      padding: space[4], textAlign: "center",
                    }}>
                      <p style={{ ...text.secondary, color: "#ffffff", margin: 0 }}>
                        {modalityFilter !== "all"
                          ? `No ${modalityFilter} exercises completed yet.`
                          : "No exercises completed yet."}
                      </p>
                    </div>
                  ) : (
                    filteredCompleted.map((ex) => {
                      const isExpanded = expandedId === ex.id;
                      const modStyle = ex.modality ? modalityColors[ex.modality] : null;
                      const tStyle = typeLabels[ex.exercise_type] || { label: ex.exercise_type, color: colors.textMuted };

                      return (
                        <motion.div
                          key={ex.id}
                          whileHover={{ y: -3, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: "rgba(224, 149, 133, 0.2)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          style={{
                            backgroundColor: colors.bgSurface,
                            borderRadius: radii.md,
                            border: `1px solid ${isExpanded ? colors.coral + "33" : colors.borderDefault}`,
                            overflow: "hidden",
                            transition: "border-color 0.2s",
                          }}
                        >
                          <div
                            onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                            style={{
                              padding: space[4],
                              display: "flex", alignItems: "center", gap: 10,
                              cursor: "pointer",
                            }}
                          >
                            <div style={{
                              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                              backgroundColor: colors.coralWash,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: colors.coral, fontSize: 11,
                            }}>
                              ✓
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                ...text.secondary, fontWeight: 600, color: colors.textPrimary,
                                margin: 0,
                              }}>
                                {ex.framework_name}
                              </p>
                              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{
                                  ...text.caption,
                                  padding: "2px 7px", borderRadius: radii.full,
                                  backgroundColor: tStyle.color + "14",
                                  color: tStyle.color,
                                }}>
                                  {tStyle.label}
                                </span>
                                {modStyle && (
                                  <span style={{
                                    ...text.caption,
                                    textTransform: "uppercase",
                                    padding: "2px 7px", borderRadius: radii.full,
                                    backgroundColor: modStyle.bg, color: modStyle.text,
                                  }}>
                                    {modStyle.label}
                                  </span>
                                )}
                                {ex.day_number && (
                                  <span style={{ fontSize: 10, color: colors.borderDefault, fontFamily: body }}>
                                    Day {ex.day_number}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 11, color: colors.borderDefault,
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.3s ease", display: "inline-block",
                            }}>
                              ▾
                            </span>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <div style={{
                                  padding: "0 18px 18px 18px",
                                  borderTop: `1px solid ${colors.borderDefault}`,
                                  paddingTop: 14,
                                }}>
                                  {ex.custom_framing && (
                                    <p style={{
                                      fontSize: 12, color: colors.textMuted, fontStyle: "italic",
                                      margin: "0 0 10px 0", lineHeight: 1.55, fontFamily: body,
                                    }}>
                                      {ex.custom_framing}
                                    </p>
                                  )}
                                  {ex.responses?.main && (
                                    <div style={{
                                      padding: 14, backgroundColor: colors.bgRecessed,
                                      borderRadius: 10, marginBottom: 10,
                                    }}>
                                      <p style={{
                                        ...text.caption, color: colors.textMuted,
                                        margin: "0 0 6px 0",
                                      }}>
                                        Your response
                                      </p>
                                      <p style={{
                                        fontSize: 13, color: colors.textBody, margin: 0,
                                        lineHeight: 1.65, fontFamily: body, whiteSpace: "pre-wrap",
                                      }}>
                                        {ex.responses.main}
                                      </p>
                                    </div>
                                  )}
                                  {ex.completed_at && (
                                    <p style={{ fontSize: 11, color: colors.borderDefault, margin: 0, fontFamily: body }}>
                                      Completed {new Date(ex.completed_at).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                      })}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* Parked */}
              {activeTab === "parked" && (
                <motion.div
                  key="parked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {parkedExercises.length === 0 ? (
                    <div style={{
                      backgroundColor: colors.bgSurface, borderRadius: radii.md,
                      border: `1px solid ${colors.borderDefault}`,
                      padding: space[4], textAlign: "center",
                    }}>
                      <p style={{ ...text.secondary, color: "#ffffff", margin: "0 0 4px 0" }}>
                        No parked exercises.
                      </p>
                      <p style={{ fontSize: 12, color: colors.borderDefault, margin: 0, fontFamily: body }}>
                        Exercises you skip will appear here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: "#ffffff", margin: "0 0 4px 0", fontFamily: body }}>
                        Coaching plan exercises from past days that weren&apos;t completed.
                      </p>
                      {parkedExercises.map((ex) => {
                        const parkedKey = `${ex.name}-${ex.day_number}`;
                        const isExpParked = expandedParked === parkedKey;
                        return (
                          <motion.div
                            key={parkedKey}
                            whileHover={!isExpParked ? { y: -3, boxShadow: "0 10px 32px rgba(0,0,0,0.12)", borderColor: "rgba(224, 149, 133, 0.2)" } : {}}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            style={{
                              backgroundColor: colors.bgSurface,
                              borderRadius: radii.md,
                              border: `1px solid ${isExpParked ? colors.coral + "33" : colors.borderDefault}`,
                              overflow: "hidden",
                              transition: "border-color 0.2s",
                            }}
                          >
                            <div
                              onClick={() => {
                                if (isExpParked) { setExpandedParked(null); setParkedResponse(""); setParkedRating(null); }
                                else { setExpandedParked(parkedKey); setParkedResponse(""); setParkedRating(null); }
                              }}
                              style={{
                                padding: space[4],
                                display: "flex", alignItems: "center", gap: 12,
                                cursor: "pointer",
                              }}
                            >
                              <div style={{
                                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                                border: `2px solid ${colors.warning}50`,
                                backgroundColor: colors.warningWash,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: colors.warning, fontSize: 11, fontFamily: display, fontWeight: 700,
                              }}>
                                !
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{
                                  ...text.secondary, fontWeight: 600, color: colors.textPrimary,
                                  margin: 0,
                                }}>
                                  {ex.name}
                                </p>
                                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3 }}>
                                  <span style={{
                                    ...text.caption,
                                    padding: "2px 7px", borderRadius: radii.full,
                                    backgroundColor: colors.warningWash, color: colors.warning,
                                  }}>
                                    Parked
                                  </span>
                                  <span style={{ fontSize: 10, color: "#ffffff", fontFamily: body }}>
                                    Day {ex.day_number}: {ex.day_title}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                {ex.duration_min && (
                                  <span style={{ fontSize: 10, color: "#ffffff", fontFamily: display, fontWeight: 500 }}>
                                    ~{ex.duration_min}min
                                  </span>
                                )}
                                <span style={{
                                  fontSize: 11, color: colors.borderDefault,
                                  transform: isExpParked ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.3s ease", display: "inline-block",
                                }}>
                                  ▾
                                </span>
                              </div>
                            </div>

                            <AnimatePresence>
                              {isExpParked && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  <div style={{
                                    padding: "0 18px 18px 18px",
                                    borderTop: `1px solid ${colors.borderDefault}`,
                                    paddingTop: 14,
                                  }}>
                                    {ex.custom_framing && (
                                      <p style={{
                                        fontSize: 12, color: colors.textMuted, fontStyle: "italic",
                                        margin: "0 0 12px 0", lineHeight: 1.55, fontFamily: body,
                                      }}>
                                        {ex.custom_framing}
                                      </p>
                                    )}
                                    <textarea
                                      value={parkedResponse}
                                      onChange={(e) => setParkedResponse(e.target.value)}
                                      placeholder="Write your response here..."
                                      style={{
                                        width: "100%", minHeight: 100, padding: 12,
                                        fontSize: 13, lineHeight: 1.55, fontFamily: body,
                                        border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
                                        resize: "vertical", outline: "none", boxSizing: "border-box",
                                        backgroundColor: colors.bgInput, color: colors.textPrimary,
                                        transition: "border-color 0.2s",
                                      }}
                                      onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                                      onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                                    />
                                    <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
                                      <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, fontWeight: 600, marginRight: 4 }}>
                                        How helpful?
                                      </span>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          onClick={() => setParkedRating(parkedRating === star ? null : star)}
                                          style={{
                                            width: 26, height: 26, borderRadius: "50%", fontSize: 11,
                                            fontWeight: 700, fontFamily: display, cursor: "pointer",
                                            border: parkedRating !== null && parkedRating >= star
                                              ? `2px solid ${colors.coral}`
                                              : `1px solid ${colors.borderDefault}`,
                                            backgroundColor: parkedRating !== null && parkedRating >= star
                                              ? colors.coralWash : "transparent",
                                            color: parkedRating !== null && parkedRating >= star
                                              ? colors.coral : colors.textMuted,
                                            transition: "all 0.15s",
                                          }}
                                        >
                                          {star}
                                        </button>
                                      ))}
                                    </div>
                                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                                      <PillButton
                                        size="sm"
                                        disabled={!parkedResponse.trim() || savingParked}
                                        onClick={() => handleSaveParked(ex)}
                                      >
                                        {savingParked ? "Saving..." : "Complete exercise"}
                                      </PillButton>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
