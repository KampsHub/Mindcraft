"use client";

import { useState, useMemo } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";
import ExerciseCard from "../preview/ExerciseCard";
import PrimitiveRenderer from "./PrimitiveRenderer";

// Data imports — merged from all modalities
import { EXERCISES as RELATIONAL_INTEGRATIVE } from "../preview/exerciseData";
import { SYSTEMS_EXERCISES } from "../preview/exerciseDataSystems";
import { COGNITIVE_SOMATIC_EXERCISES as COGNITIVE_SOMATIC } from "../preview/exerciseDataCognitiveSomatic";
import { MISSING_SOMATIC_EXERCISES } from "../preview/exerciseDataMissingSomatic";
import { MISSING_REL_INT_SYS_EXERCISES } from "../preview/exerciseDataMissingRelIntSys";
import { CORE_EXERCISES } from "../preview/exerciseDataCore";
import { SCENARIOS } from "../preview/exerciseDataScenarios";

const display = fonts.display;
const body = fonts.bodyAlt;

// Tag existing framework exercises as journal-matched if no tags set
function tagJournalMatched(exercises: typeof RELATIONAL_INTEGRATIVE) {
  return exercises.map((e) => ({
    ...e,
    tags: e.tags || ["journal-matched" as const],
  }));
}

// Merge scenario data into exercises
function applyScenarios(exercises: typeof RELATIONAL_INTEGRATIVE) {
  return exercises.map((e) => {
    const s = SCENARIOS[e.id];
    if (s) return { ...e, scenario: s.scenario, prePopulated: s.prePopulated };
    return e;
  });
}

const ALL_EXERCISES = applyScenarios([
  ...tagJournalMatched(COGNITIVE_SOMATIC),
  ...tagJournalMatched(RELATIONAL_INTEGRATIVE),
  ...tagJournalMatched(SYSTEMS_EXERCISES),
  ...tagJournalMatched(MISSING_SOMATIC_EXERCISES),
  ...tagJournalMatched(MISSING_REL_INT_SYS_EXERCISES),
  ...CORE_EXERCISES,
]);

const MODALITIES = [
  { id: "all", label: "All", color: colors.textPrimary },
  { id: "cognitive", label: "Cognitive", color: colors.coral },
  { id: "somatic", label: "Somatic", color: colors.success },
  { id: "relational", label: "Relational", color: colors.plumLight },
  { id: "integrative", label: "Integrative", color: colors.coralLight },
  { id: "systems", label: "Systems", color: colors.textMuted },
];

const PRIMITIVE_LABELS: Record<string, string> = {
  wheelChart: "Wheel / Radar",
  spectrumSlider: "Spectrum Slider",
  zonedSpectrum: "Zoned Spectrum",
  multiSpectrum: "Multi-Spectrum",
  cardSort: "Card Sort",
  bubbleSort: "Bubble Sort",
  forcedChoice: "Forced Choice",
  splitAnnotator: "Split Annotator",
  dialogueSequence: "Dialogue Sequence",
  hierarchicalBranch: "Hierarchical Branch",
  emotionalArc: "Emotional Arc",
  bodyMap: "Body Map",
  saboteurCard: "Saboteur Card",
  heatmap: "Heatmap Tracker",
  stakeholderMap: "Stakeholder Map",
  vennOverlap: "Venn Overlap",
  forceField: "Force Field",
  beforeAfter: "Before / After",
  narrativeTriptych: "Narrative Triptych",
  wordCloud: "Word Cloud",
  dotGrid: "Dot Grid",
  timelineRiver: "Timeline River",
  progressRiver: "Progress River",
  emotionWheel: "Emotion Wheel",
  guided: "Guided (text only)",
};

export default function ExerciseCatalogPage() {
  const [activeModality, setActiveModality] = useState("all");
  const [activeTag, setActiveTag] = useState("all");
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let result = ALL_EXERCISES;
    if (activeModality !== "all") {
      result = result.filter((e) => e.modality === activeModality);
    }
    if (activeTag !== "all") {
      result = result.filter((e) => e.tags?.includes(activeTag as "core-parachute" | "core-jetstream" | "core-basecamp" | "journal-matched"));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.originator.toLowerCase().includes(q) ||
        e.primitive.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeModality, activeTag, searchQuery]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const ex of filtered) {
      const key = PRIMITIVE_LABELS[ex.primitive] || ex.primitive;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ex);
    }
    // Sort groups by size (biggest first)
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const totalCount = ALL_EXERCISES.length;
  const filteredCount = filtered.length;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bgDeep,
      color: colors.textPrimary,
      fontFamily: body,
    }}>
      {/* Header */}
      <div style={{
        padding: `${space[7]}px ${space[5]}px ${space[5]}px`,
        maxWidth: 800,
        margin: "0 auto",
      }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: colors.coral,
          fontFamily: display, letterSpacing: "0.05em", margin: "0 0 8px 0",
        }}>
          EXERCISE CATALOG
        </p>
        <h1 style={{
          fontFamily: display, fontSize: 28, fontWeight: 700,
          margin: "0 0 8px 0", letterSpacing: "-0.02em",
        }}>
          Mindcraft Framework Library
        </h1>
        <p style={{
          fontSize: 15, color: colors.textSecondary, margin: "0 0 24px 0", lineHeight: 1.6,
        }}>
          {totalCount} exercises across 5 modalities. Each matched to your journal, with the science behind why it works.
        </p>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises, originators, or primitives..."
          style={{
            width: "100%",
            padding: `${space[3]}px ${space[4]}px`,
            fontSize: 14,
            fontFamily: body,
            backgroundColor: colors.bgInput,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radii.sm,
            outline: "none",
            marginBottom: space[4],
            boxSizing: "border-box",
          }}
        />

        {/* Modality filters */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: space[4],
        }}>
          {MODALITIES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModality(m.id)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 600,
                fontFamily: display, letterSpacing: "0.01em",
                border: activeModality === m.id ? "none" : `1px solid ${colors.borderDefault}`,
                borderRadius: radii.full,
                backgroundColor: activeModality === m.id ? m.color : "transparent",
                color: activeModality === m.id ? colors.bgDeep : colors.textSecondary,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Tag filters */}
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap", marginBottom: space[4],
        }}>
          {[
            { id: "all", label: "All Sources" },
            { id: "core-parachute", label: "🪂 Parachute Core" },
            { id: "core-jetstream", label: "✈️ Jetstream Core" },
            { id: "core-basecamp", label: "⛺ Basecamp Core" },
            { id: "journal-matched", label: "📓 Journal-matched" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.id)}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 600,
                fontFamily: display, letterSpacing: "0.01em",
                border: activeTag === t.id ? "none" : `1px solid ${colors.borderSubtle}`,
                borderRadius: radii.full,
                backgroundColor: activeTag === t.id ? colors.bgElevated : "transparent",
                color: activeTag === t.id ? colors.textPrimary : colors.textMuted,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Count */}
        <p style={{
          fontSize: 13, color: colors.textMuted, margin: "0 0 8px 0",
          fontFamily: body,
        }}>
          Showing {filteredCount} of {totalCount} exercises
          {activeModality !== "all" && ` · ${activeModality}`}
          {searchQuery && ` · "${searchQuery}"`}
        </p>
      </div>

      {/* Exercise list grouped by primitive */}
      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: `0 ${space[5]}px ${space[8]}px`,
      }}>
        {grouped.map(([groupName, exercises]) => (
          <div key={groupName} style={{ marginBottom: space[6] }}>
            {/* Group header */}
            <div style={{
              display: "flex", alignItems: "center", gap: space[3],
              marginBottom: space[3], paddingBottom: space[2],
              borderBottom: `1px solid ${colors.borderSubtle}`,
            }}>
              <h2 style={{
                fontFamily: display, fontSize: 14, fontWeight: 700,
                color: colors.textSecondary, margin: 0,
                letterSpacing: "0.02em",
              }}>
                {groupName}
              </h2>
              <span style={{
                fontSize: 11, color: colors.textMuted, fontFamily: body,
                backgroundColor: colors.bgRecessed,
                padding: "2px 8px", borderRadius: radii.full,
              }}>
                {exercises.length}
              </span>
            </div>

            {/* Exercises in group */}
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                name={ex.name}
                modality={ex.modality}
                originator={ex.originator}
                primitive={ex.primitive}
                scenario={ex.scenario}
                whyNow={ex.whyNow}
                science={ex.science}
                instruction={ex.instruction}
                tags={ex.tags}
                dayNumber={ex.dayNumber}
                isActive={activeExerciseId === ex.id}
                onClick={() => setActiveExerciseId(activeExerciseId === ex.id ? null : ex.id)}
              >
                {activeExerciseId === ex.id && <PrimitiveRenderer primitive={ex.primitive} prePopulated={ex.prePopulated} />}
              </ExerciseCard>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{
            textAlign: "center", color: colors.textMuted,
            fontFamily: body, fontSize: 15, padding: space[7],
          }}>
            No exercises match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
