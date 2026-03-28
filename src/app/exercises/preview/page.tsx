"use client";

import { useState } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";
import WheelChart from "@/components/exercises/primitives/WheelChart";
import TimelineRiver from "@/components/exercises/primitives/TimelineRiver";
import CardSort from "@/components/exercises/primitives/CardSort";
import SpectrumSlider from "@/components/exercises/primitives/SpectrumSlider";
import BubbleSort from "@/components/exercises/primitives/BubbleSort";
import DotGrid from "@/components/exercises/primitives/DotGrid";
import WordCloudBuilder from "@/components/exercises/primitives/WordCloudBuilder";
import EmotionWheel from "@/components/exercises/primitives/EmotionWheel";

const display = fonts.display;
const body = fonts.bodyAlt;

// ── Demo data for each primitive ──

const DISRUPTION_CATEGORIES = [
  "Income & Financial Security",
  "Routine & Structure",
  "Identity",
  "Social Belonging",
  "Sense of Competence",
  "Future Uncertainty",
  "Skill Confidence",
];

const SABOTEUR_CARDS = [
  { id: "1", label: "The Prosecutor", detail: "\"You should have seen this coming.\"" },
  { id: "2", label: "The Perfectionist", detail: "\"If you were better, this wouldn't have happened.\"" },
  { id: "3", label: "The Victim", detail: "\"Nothing ever works out for you.\"" },
  { id: "4", label: "The Avoider", detail: "\"Just don't think about it.\"" },
  { id: "5", label: "The Controller", detail: "\"You need to fix everything right now.\"" },
];

const SABOTEUR_BUCKETS = [
  { id: "loudest", label: "Loudest Right Now", color: colors.coral },
  { id: "background", label: "Background Noise", color: colors.plum },
  { id: "quiet", label: "Quiet / Dormant", color: colors.textMuted },
];

const ACCEPTANCE_STAGES = ["Denial / Shock", "Anger", "Bargaining", "Sadness / Grief", "Acceptance"];

const VALUES_FOR_RANKING = [
  "Autonomy",
  "Financial Security",
  "Impact",
  "Creative Freedom",
  "Work-Life Balance",
  "Status / Recognition",
];

const FINANCIAL_DOTS = [
  { id: "savings", label: "Savings runway", x: 70, y: 30 },
  { id: "insurance", label: "Insurance gap", x: 25, y: 65 },
  { id: "severance", label: "Severance timeline", x: 60, y: 45 },
  { id: "job-market", label: "Job market fear", x: 20, y: 80 },
  { id: "burn-rate", label: "Monthly burn rate", x: 75, y: 55 },
];

const INITIAL_VALUES_WORDS = [
  { text: "autonomy", weight: 3 },
  { text: "impact", weight: 2 },
  { text: "creativity", weight: 4 },
  { text: "belonging", weight: 1 },
  { text: "security", weight: 2 },
];

const PRIMITIVES = [
  { id: "wheel", name: "Wheel / Radar", exercise: "Day 1: Seven Disruptions Inventory" },
  { id: "timeline", name: "Timeline / River", exercise: "Day 2: Timeline Mapping" },
  { id: "cardsort", name: "Card Sort", exercise: "Day 4: Saboteur Identification" },
  { id: "spectrum", name: "Spectrum Slider", exercise: "Day 7: Acceptance Curve" },
  { id: "bubble", name: "Bubble Sort", exercise: "Day 14: Values Stack Ranking" },
  { id: "dotgrid", name: "Dot Grid (2×2)", exercise: "Day 5: Financial Ground Truth" },
  { id: "wordcloud", name: "Word Cloud", exercise: "Day 13: Values Excavation" },
  { id: "emotion", name: "Emotion Wheel", exercise: "Feelings Check-in" },
];

export default function ExercisePreviewPage() {
  const [activeId, setActiveId] = useState("wheel");

  // ── State for each demo ──
  const [wheelValues, setWheelValues] = useState([6, 3, 7, 4, 5, 8, 4]);
  const wheelComparison = [4, 5, 5, 6, 7, 6, 6]; // Day 24 comparison

  const [timelineEvents, setTimelineEvents] = useState<{ id: string; label: string; date?: string; emotion?: string; detail?: string }[]>([
    { id: "1", label: "First warning signs", date: "Sep 2025", emotion: "anxiety", detail: "Skip-level meeting felt off" },
    { id: "2", label: "PIP conversation", date: "Oct 2025", emotion: "shock", detail: "Came out of nowhere" },
    { id: "3", label: "Last day", date: "Nov 2025", emotion: "numbness", detail: "Packed my desk in 20 minutes" },
  ]);

  const [spectrumValue, setSpectrumValue] = useState(35);

  const [dotItems, setDotItems] = useState(FINANCIAL_DOTS);

  const [cloudWords, setCloudWords] = useState(INITIAL_VALUES_WORDS);

  const [selectedEmotions, setSelectedEmotions] = useState<{ emotion: string; intensity: string }[]>([]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bgDeep,
      color: colors.textPrimary,
      fontFamily: body,
    }}>
      {/* Header */}
      <div style={{
        padding: `${space[7]}px ${space[5]}px ${space[6]}px`,
        maxWidth: 960,
        margin: "0 auto",
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: colors.coral, fontFamily: display, letterSpacing: "0.05em", margin: "0 0 8px 0" }}>
          EXERCISE PRIMITIVES
        </p>
        <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
          PARACHUTE Component Library
        </h1>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
          8 interactive primitives for 30 coaching exercises. Click a tab to preview.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: `0 ${space[5]}px`,
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: space[6],
      }}>
        {PRIMITIVES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: display,
              letterSpacing: "0.01em",
              border: activeId === p.id ? "none" : `1px solid ${colors.borderDefault}`,
              borderRadius: radii.full,
              backgroundColor: activeId === p.id ? colors.coral : "transparent",
              color: activeId === p.id ? colors.bgDeep : colors.textSecondary,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active demo */}
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: `0 ${space[5]}px ${space[8]}px`,
      }}>
        {/* Exercise label */}
        <div style={{
          marginBottom: space[5],
          padding: `${space[3]}px ${space[4]}px`,
          backgroundColor: colors.bgSurface,
          borderRadius: radii.sm,
          border: `1px solid ${colors.borderDefault}`,
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, fontFamily: display, letterSpacing: "0.04em", margin: "0 0 4px 0" }}>
            DEMO EXERCISE
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, fontFamily: body, margin: 0 }}>
            {PRIMITIVES.find((p) => p.id === activeId)?.exercise}
          </p>
        </div>

        {/* ── Wheel ── */}
        {activeId === "wheel" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Rate each disruption 1–10. Click a segment to change its value. The plum overlay shows your Day 24 reassessment for comparison.
            </p>
            <WheelChart
              categories={DISRUPTION_CATEGORIES}
              values={wheelValues}
              comparisonValues={wheelComparison}
              onChange={(i, v) => {
                const next = [...wheelValues];
                next[i] = v;
                setWheelValues(next);
              }}
            />
          </div>
        )}

        {/* ── Timeline ── */}
        {activeId === "timeline" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Map the last 6–12 months. Add events, tag emotions, and note the subtext underneath.
            </p>
            <TimelineRiver
              events={timelineEvents}
              onAddEvent={(e) => setTimelineEvents((prev) => [...prev, e])}
              onEditEvent={(id, updates) =>
                setTimelineEvents((prev) =>
                  prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
                )
              }
              onRemoveEvent={(id) =>
                setTimelineEvents((prev) => prev.filter((e) => e.id !== id))
              }
            />
          </div>
        )}

        {/* ── Card Sort ── */}
        {activeId === "cardsort" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Drag your inner critic patterns into categories. Which saboteurs are loudest right now?
            </p>
            <CardSort
              cards={SABOTEUR_CARDS}
              buckets={SABOTEUR_BUCKETS}
              allowAdd
              onAddCard={(card) => console.log("Added:", card)}
              onSort={(bucket, ids) => console.log("Sorted:", bucket, ids)}
            />
          </div>
        )}

        {/* ── Spectrum ── */}
        {activeId === "spectrum" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Place yourself on the acceptance spectrum. Not where you should be — where you actually are.
            </p>
            <SpectrumSlider
              labels={ACCEPTANCE_STAGES}
              value={spectrumValue}
              onChange={setSpectrumValue}
              description="Healthy grief oscillates. Getting stuck in one position is the risk — not being in any particular position."
            />
          </div>
        )}

        {/* ── Bubble Sort ── */}
        {activeId === "bubble" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              When two values conflict, which wins? Click the one that matters more. The ranking emerges from your choices.
            </p>
            <BubbleSort
              items={VALUES_FOR_RANKING}
              question="Which value matters more to you?"
              onComplete={(ranked) => console.log("Final ranking:", ranked)}
            />
          </div>
        )}

        {/* ── Dot Grid ── */}
        {activeId === "dotgrid" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Separate financial facts from financial fear. Drag each item to where it belongs on the grid.
            </p>
            <DotGrid
              items={dotItems}
              axisLabels={{
                top: "Fact",
                bottom: "Fear",
                left: "Not in my control",
                right: "In my control",
              }}
              onChange={setDotItems}
              title="Financial Ground Truth"
            />
          </div>
        )}

        {/* ── Word Cloud ── */}
        {activeId === "wordcloud" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              Type the values that emerged from your stories. Click a word to strengthen it. Your values exist in your history — they are patterns, not aspirations.
            </p>
            <WordCloudBuilder
              words={cloudWords}
              onAddWord={(word) => setCloudWords((prev) => [...prev, { text: word, weight: 1 }])}
              onRemoveWord={(word) => setCloudWords((prev) => prev.filter((w) => w.text !== word))}
              onWeightChange={(word, weight) =>
                setCloudWords((prev) =>
                  prev.map((w) => (w.text === word ? { ...w, weight } : w))
                )
              }
              placeholder="Type a value and press Enter..."
            />
          </div>
        )}

        {/* ── Emotion Wheel ── */}
        {activeId === "emotion" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>
              What are you feeling right now? Click segments to select. Outer ring = mild, inner ring = intense.
            </p>
            <EmotionWheel
              selected={selectedEmotions}
              onSelect={(emotion, intensity) => {
                setSelectedEmotions((prev) => {
                  const exists = prev.find((e) => e.emotion === emotion && e.intensity === intensity);
                  if (exists) return prev.filter((e) => !(e.emotion === emotion && e.intensity === intensity));
                  return [...prev, { emotion, intensity }];
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
