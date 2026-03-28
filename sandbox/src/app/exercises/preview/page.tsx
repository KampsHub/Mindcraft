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
import BeforeAfterComparison from "@/components/exercises/primitives/BeforeAfterComparison";
import NarrativeTriptych from "@/components/exercises/primitives/NarrativeTriptych";
import ForcedChoiceMatrix from "@/components/exercises/primitives/ForcedChoiceMatrix";
import ProgressRiver from "@/components/exercises/primitives/ProgressRiver";
import VennOverlap from "@/components/exercises/primitives/VennOverlap";
import HeatmapTracker from "@/components/exercises/primitives/HeatmapTracker";
import StakeholderMap from "@/components/exercises/primitives/StakeholderMap";
import MultiSpectrumCompare from "@/components/exercises/primitives/MultiSpectrumCompare";
import BodyMap from "@/components/exercises/primitives/BodyMap";
import SaboteurCard from "@/components/exercises/primitives/SaboteurCard";
import SplitAnnotator from "@/components/exercises/primitives/SplitAnnotator";
import DialogueSequence from "@/components/exercises/primitives/DialogueSequence";
import HierarchicalBranch from "@/components/exercises/primitives/HierarchicalBranch";
import EmotionalArc from "@/components/exercises/primitives/EmotionalArc";
import ZonedSpectrum from "@/components/exercises/primitives/ZonedSpectrum";
import ForceFieldDiagram from "@/components/exercises/primitives/ForceFieldDiagram";

const display = fonts.display;
const body = fonts.bodyAlt;

// ── Demo data ──

const DISRUPTION_CATEGORIES = [
  "Income & Financial Security", "Routine & Structure", "Identity",
  "Social Belonging", "Sense of Competence", "Future Uncertainty", "Skill Confidence",
];

const SABOTEUR_CARDS_DATA = [
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

const VALUES_FOR_RANKING = ["Autonomy", "Financial Security", "Impact", "Creative Freedom", "Work-Life Balance", "Status / Recognition"];

const FINANCIAL_DOTS = [
  { id: "savings", label: "Savings runway", x: 70, y: 30 },
  { id: "insurance", label: "Insurance gap", x: 25, y: 65 },
  { id: "severance", label: "Severance timeline", x: 60, y: 45 },
  { id: "job-market", label: "Job market fear", x: 20, y: 80 },
  { id: "burn-rate", label: "Monthly burn rate", x: 75, y: 55 },
];

const INITIAL_VALUES_WORDS = [
  { text: "autonomy", weight: 3 }, { text: "impact", weight: 2 },
  { text: "creativity", weight: 4 }, { text: "belonging", weight: 1 }, { text: "security", weight: 2 },
];

const BEFORE_AFTER_DATA = [
  { label: "Income & Financial Security", values: [{ period: "Day 1", value: 8 }, { period: "Day 24", value: 5 }] },
  { label: "Routine & Structure", values: [{ period: "Day 1", value: 3 }, { period: "Day 24", value: 6 }] },
  { label: "Identity", values: [{ period: "Day 1", value: 9 }, { period: "Day 24", value: 6 }] },
  { label: "Social Belonging", values: [{ period: "Day 1", value: 5 }, { period: "Day 24", value: 4 }] },
  { label: "Sense of Competence", values: [{ period: "Day 1", value: 7 }, { period: "Day 24", value: 4 }] },
  { label: "Future Uncertainty", values: [{ period: "Day 1", value: 9 }, { period: "Day 24", value: 6 }] },
  { label: "Skill Confidence", values: [{ period: "Day 1", value: 6 }, { period: "Day 24", value: 3 }] },
];

const TRIPTYCH_PANELS = [
  { id: "acquaintance", title: "The Acquaintance Version", subtitle: "What you say at a party", placeholder: "\"I left my role at...\"", content: "" },
  { id: "friend", title: "The Close Friend Version", subtitle: "What you say after two glasses of wine", placeholder: "\"Honestly, what happened was...\"", content: "" },
  { id: "3am", title: "The 3am Version", subtitle: "What you say to yourself at night", placeholder: "\"The truth is...\"", content: "" },
];

const SCENARIO_DATA = [
  { id: "1", description: "A role that pays 40% more but the company culture contradicts your top value of autonomy. Heavy micromanagement, daily standups, camera-on policy.", choiceA: "Take the role", choiceB: "Pass on it", valueAtStake: "Financial Security vs. Autonomy" },
  { id: "2", description: "A startup founder role with a team you'd love. The catch: it's a title step-down, and your parents would see it as a demotion.", choiceA: "Take the role", choiceB: "Hold out for title match", valueAtStake: "Impact vs. Status" },
  { id: "3", description: "A remote role that honors all your values — but you'd be the only person in your timezone, working alone most of the day.", choiceA: "Take the role", choiceB: "Keep looking", valueAtStake: "Work-Life Balance vs. Belonging" },
];

const PROGRESS_RIVER_DAYS = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1, completed: i < 12,
  rating: i < 12 ? [6, 5, 7, 4, 6, 5, 8, 6, 7, 5, 4, 7][i] : undefined,
  keyMoment: i === 0 ? "First disruptions baseline" : i === 3 ? "Named The Prosecutor" : i === 6 ? "Placed at Anger on acceptance curve" : i === 9 ? "Belief inventory surfaced family patterns" : undefined,
  exerciseName: ["Seven Disruptions", "Timeline Mapping", "Somatic Mapping", "Saboteur ID", "Financial Ground Truth", "Minimal Structure", "Acceptance Curve", "Role Identity", "Belonging Inventory", "Belief Inventory", "Family Patterns", "Saboteur Tracking"][i],
  themes: i === 3 ? ["inner critic"] : i === 6 ? ["grief", "anger"] : i === 9 ? ["identity"] : undefined,
}));

const VENN_ITEMS = [
  { id: "1", label: "Problem solver" }, { id: "2", label: "Team leader" },
  { id: "3", label: "Creative thinker" }, { id: "4", label: "Reliable" },
  { id: "5", label: "Strategic" }, { id: "6", label: "Curious" },
  { id: "7", label: "Patient" }, { id: "8", label: "Competitive" },
];

const HEATMAP_ROWS = [
  { id: "prosecutor", label: "The Prosecutor" },
  { id: "perfectionist", label: "The Perfectionist" },
  { id: "avoider", label: "The Avoider" },
];
const HEATMAP_COLS = [
  { id: "mon", label: "Mon" }, { id: "tue", label: "Tue" }, { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" }, { id: "fri", label: "Fri" }, { id: "sat", label: "Sat" }, { id: "sun", label: "Sun" },
];
const HEATMAP_INITIAL_CELLS = [
  { rowId: "prosecutor", colId: "mon", value: 4, note: "3am thought spiral about the PIP meeting" },
  { rowId: "prosecutor", colId: "wed", value: 3 },
  { rowId: "perfectionist", colId: "tue", value: 5, note: "Rewrote resume cover letter 6 times" },
  { rowId: "perfectionist", colId: "fri", value: 2 },
  { rowId: "avoider", colId: "thu", value: 4, note: "Skipped networking event" },
  { rowId: "avoider", colId: "sat", value: 1 },
];

// New primitive demo data
const STAKEHOLDER_NODES: { id: string; name: string; role?: string; type: "ally" | "neutral" | "blocker" | "unknown"; x: number; y: number; notes?: string }[] = [
  { id: "1", name: "Sarah (Manager)", role: "Direct manager", type: "neutral" as const, x: 35, y: 25, notes: "Unclear if she initiated the PIP" },
  { id: "2", name: "Mike (VP)", role: "Skip-level", type: "ally" as const, x: 65, y: 20, notes: "Has always been supportive" },
  { id: "3", name: "HR (Lisa)", role: "HR Business Partner", type: "blocker" as const, x: 30, y: 70, notes: "Feels procedural, not personal" },
  { id: "4", name: "Dev (Colleague)", role: "Peer", type: "ally" as const, x: 70, y: 60 },
];

const CULTURAL_DIMENSIONS = [
  { id: "directness", label: "Communication", leftLabel: "Indirect", rightLabel: "Direct" },
  { id: "formality", label: "Formality", leftLabel: "Casual", rightLabel: "Formal" },
  { id: "feedback", label: "Feedback Style", leftLabel: "Gentle / Private", rightLabel: "Blunt / Public" },
  { id: "pace", label: "Decision Pace", leftLabel: "Deliberate", rightLabel: "Fast-moving" },
  { id: "hierarchy", label: "Hierarchy", leftLabel: "Flat", rightLabel: "Top-down" },
];

const CULTURAL_MARKERS = [
  { dimensionId: "directness", markerId: "self-d", label: "You", value: 70, color: colors.coral },
  { dimensionId: "directness", markerId: "new-d", label: "New Culture", value: 40, color: colors.plum },
  { dimensionId: "directness", markerId: "old-d", label: "Old Culture", value: 80, color: colors.textMuted },
  { dimensionId: "formality", markerId: "self-f", label: "You", value: 30, color: colors.coral },
  { dimensionId: "formality", markerId: "new-f", label: "New Culture", value: 75, color: colors.plum },
  { dimensionId: "formality", markerId: "old-f", label: "Old Culture", value: 25, color: colors.textMuted },
  { dimensionId: "feedback", markerId: "self-fb", label: "You", value: 60, color: colors.coral },
  { dimensionId: "feedback", markerId: "new-fb", label: "New Culture", value: 80, color: colors.plum },
  { dimensionId: "feedback", markerId: "old-fb", label: "Old Culture", value: 50, color: colors.textMuted },
  { dimensionId: "pace", markerId: "self-p", label: "You", value: 55, color: colors.coral },
  { dimensionId: "pace", markerId: "new-p", label: "New Culture", value: 85, color: colors.plum },
  { dimensionId: "pace", markerId: "old-p", label: "Old Culture", value: 40, color: colors.textMuted },
  { dimensionId: "hierarchy", markerId: "self-h", label: "You", value: 25, color: colors.coral },
  { dimensionId: "hierarchy", markerId: "new-h", label: "New Culture", value: 70, color: colors.plum },
  { dimensionId: "hierarchy", markerId: "old-h", label: "Old Culture", value: 20, color: colors.textMuted },
];

const CULTURAL_LEGEND = [
  { id: "you", label: "You", color: colors.coral },
  { id: "new", label: "New Culture", color: colors.plum },
  { id: "old", label: "Old Culture", color: colors.textMuted },
];

const BODY_INITIAL_MARKERS: { id: string; zone: string; sensation: string; intensity: number; label?: string; note?: string }[] = [
  { id: "1", zone: "chest", sensation: "tight", intensity: 4, label: "The Prosecutor", note: "Tightens before meetings" },
  { id: "2", zone: "stomach", sensation: "buzzing", intensity: 3, label: "Anxiety" },
  { id: "3", zone: "shoulders", sensation: "heavy", intensity: 5, note: "Carrying everything" },
];

const SABOTEUR_DEMO: { id: string; name: string; archetype?: string; triggerPattern: string; exactWords: string; protectsFrom: string; activationHistory?: { day: number; intensity: number }[] } = {
  id: "prosecutor",
  name: "The Prosecutor",
  archetype: "The Prosecutor",
  triggerPattern: "Before any meeting with authority figures. Loudest at 3am.",
  exactWords: "You should have seen this coming. You're not cut out for this level.",
  protectsFrom: "The vulnerability of being evaluated. If I blame myself first, no one else's judgment can hurt worse.",
  activationHistory: [
    { day: 1, intensity: 4 }, { day: 3, intensity: 5 }, { day: 5, intensity: 3 },
    { day: 7, intensity: 4 }, { day: 9, intensity: 2 }, { day: 11, intensity: 3 }, { day: 12, intensity: 1 },
  ],
};

const SPLIT_ROWS = [
  { id: "1", leftText: "Your project deliverables have not met the expected timeline.", rightText: "I'm completely incompetent and everyone knows it.", tags: ["overgeneralization"] },
  { id: "2", leftText: "Communication with cross-functional teams needs improvement.", rightText: "Nobody likes working with me. I'm a burden to the team.", tags: ["mind-reading", "catastrophizing"] },
  { id: "3", leftText: "Technical documentation was incomplete on two occasions.", rightText: "I can never do anything right. Two mistakes and my career is over.", tags: ["overgeneralization", "catastrophizing"] },
];

const SPLIT_TAGS = [
  { id: "overgeneralization", label: "Overgeneralization", color: colors.coral },
  { id: "catastrophizing", label: "Catastrophizing", color: colors.error },
  { id: "mind-reading", label: "Mind Reading", color: colors.plum },
  { id: "filtering", label: "Mental Filtering", color: colors.warning },
  { id: "labeling", label: "Labeling", color: colors.coralPressed },
];

const DIALOGUE_VOICES = [
  { id: "critic", label: "Inner Critic", color: colors.plum },
  { id: "self", label: "Self", color: colors.coral },
];

const DIALOGUE_TURNS: { id: string; voice: string; prompt?: string; content: string }[] = [
  { id: "1", voice: "critic", prompt: "What does the critic say when you think about the PIP?", content: "" },
  { id: "2", voice: "self", prompt: "Respond from Self — with compassion, not agreement.", content: "" },
  { id: "3", voice: "critic", prompt: "How does the critic push back?", content: "" },
  { id: "4", voice: "self", prompt: "What does Self notice about this pattern?", content: "" },
];

const IMMUNITY_LEVELS = [
  { id: "goal", label: "Commitment / Goal", prompt: "What do you want to change?", content: "I want to stop over-preparing for every meeting and trust my expertise.", color: colors.coral },
  { id: "doing", label: "What I'm Doing Instead", prompt: "What behaviors work against this goal?", content: "Spending 4 hours prepping for a 30-minute check-in. Rehearsing answers to questions no one will ask.", color: colors.coralPressed },
  { id: "assumption", label: "Hidden Competing Commitment", prompt: "What am I committed to that competes with my goal?", content: "I'm committed to never being caught off-guard. To always appearing competent.", color: colors.plum },
  { id: "fear", label: "Big Assumption", prompt: "What belief makes this competing commitment feel necessary?", content: "If I'm not perfectly prepared, people will see I don't belong at this level.", color: colors.plumPressed },
];

const ARC_PHASES = [
  { id: "rising", label: "Rising", prompt: "What triggered this emotion? What are the first signals?", content: "", intensity: 30 },
  { id: "building", label: "Building", prompt: "What thoughts are fueling it? Where do you feel it in your body?", content: "", intensity: 65 },
  { id: "peak", label: "Peak", prompt: "You're at the top. What does it feel like? Can you stay with it for 90 seconds?", content: "", intensity: 95 },
  { id: "falling", label: "Falling", prompt: "What shifts as it passes? What remains?", content: "", intensity: 50 },
  { id: "integration", label: "Integration", prompt: "What did this wave teach you? What do you want to remember?", content: "", intensity: 15 },
];

const WINDOW_ZONES = [
  { id: "hypo", label: "Hypo-arousal", fromPercent: 0, toPercent: 25, color: colors.plum, guidance: "Shutdown zone. You might feel numb, foggy, disconnected, or frozen. Grounding exercises and gentle movement can help you re-engage." },
  { id: "window", label: "Window of Tolerance", fromPercent: 25, toPercent: 65, color: colors.success, guidance: "You're in your window. You can think clearly, feel emotions without being overwhelmed, and make decisions. This is where growth happens." },
  { id: "activated", label: "Activated", fromPercent: 65, toPercent: 85, color: colors.warning, guidance: "You're getting activated. Heart rate may be up, thoughts may be racing. Use regulation tools — box breathing, cold water, TIPP — to bring yourself back toward your window." },
  { id: "hyper", label: "Hyper-arousal", fromPercent: 85, toPercent: 100, color: colors.error, guidance: "Fight-or-flight zone. Intense anxiety, anger, or panic. This is your nervous system protecting you. Prioritize safety and regulation before any cognitive work." },
];

const DRIVING_FORCES = [
  { id: "d1", label: "Want to prove myself", strength: 4 },
  { id: "d2", label: "Financial need", strength: 5 },
  { id: "d3", label: "Growth opportunity", strength: 3 },
];

const RESTRAINING_FORCES = [
  { id: "r1", label: "Fear of failure", strength: 4, notes: "Loudest at night" },
  { id: "r2", label: "Imposter syndrome", strength: 3 },
  { id: "r3", label: "Toxic culture signals", strength: 2 },
];

// ── Tab definitions ──

const PRIMITIVES = [
  { id: "wheel", name: "Wheel / Radar", exercise: "Day 1: Seven Disruptions Inventory" },
  { id: "timeline", name: "Timeline / River", exercise: "Day 2: Timeline Mapping" },
  { id: "cardsort", name: "Card Sort", exercise: "Day 4: Saboteur Identification" },
  { id: "spectrum", name: "Spectrum Slider", exercise: "Day 7: Acceptance Curve" },
  { id: "bubble", name: "Bubble Sort", exercise: "Day 14: Values Stack Ranking" },
  { id: "dotgrid", name: "Dot Grid (2×2)", exercise: "Day 5: Financial Ground Truth" },
  { id: "wordcloud", name: "Word Cloud", exercise: "Day 13: Values Excavation" },
  { id: "emotion", name: "Emotion Wheel", exercise: "Feelings Check-in" },
  { id: "beforeafter", name: "Before / After", exercise: "Day 1 vs 24: Disruptions Comparison" },
  { id: "triptych", name: "Narrative Triptych", exercise: "Day 18: Three Versions of the Story" },
  { id: "forcedchoice", name: "Forced Choice", exercise: "Day 15: Values Pressure Test" },
  { id: "progressriver", name: "Progress River", exercise: "30-Day Journey View" },
  { id: "venn", name: "Venn Overlap", exercise: "Day 8: Role Identity Transition" },
  { id: "heatmap", name: "Heatmap Tracker", exercise: "Day 12: Saboteur Patterns in Action" },
  { id: "stakeholder", name: "Stakeholder Map", exercise: "Jetstream Day 6: Reading the Room" },
  { id: "multispectrum", name: "Multi-Spectrum", exercise: "Basecamp Day 4: Cultural Dimensions" },
  { id: "bodymap", name: "Body Map", exercise: "Somatic Mapping: Where Do You Feel It?" },
  { id: "saboteurcard", name: "Saboteur Card", exercise: "Day 4: Saboteur Character Profile" },
  { id: "splitannotator", name: "Split Annotator", exercise: "Jetstream Day 4: Document vs. Story" },
  { id: "dialogue", name: "Dialogue Sequence", exercise: "IFS: Self-Led Journaling" },
  { id: "hierarchy", name: "Hierarchical Branch", exercise: "Immunity to Change Map" },
  { id: "emotionalarc", name: "Emotional Arc", exercise: "Emotion Wave: 90-Second Processing" },
  { id: "zonedspectrum", name: "Zoned Spectrum", exercise: "Window of Tolerance Tracking" },
  { id: "forcefield", name: "Force Field", exercise: "Force Field Analysis: Change Readiness" },
];

export default function ExercisePreviewPage() {
  const [activeId, setActiveId] = useState("wheel");

  // ── State for existing demos ──
  const [wheelValues, setWheelValues] = useState([6, 3, 7, 4, 5, 8, 4]);
  const wheelComparison = [4, 5, 5, 6, 7, 6, 6];

  const [timelineEvents, setTimelineEvents] = useState<{ id: string; label: string; date?: string; emotion?: string; detail?: string }[]>([
    { id: "1", label: "First warning signs", date: "Sep 2025", emotion: "anxiety", detail: "Skip-level meeting felt off" },
    { id: "2", label: "PIP conversation", date: "Oct 2025", emotion: "shock", detail: "Came out of nowhere" },
    { id: "3", label: "Last day", date: "Nov 2025", emotion: "numbness", detail: "Packed my desk in 20 minutes" },
  ]);

  const [spectrumValue, setSpectrumValue] = useState(35);
  const [dotItems, setDotItems] = useState(FINANCIAL_DOTS);
  const [cloudWords, setCloudWords] = useState(INITIAL_VALUES_WORDS);
  const [selectedEmotions, setSelectedEmotions] = useState<{ emotion: string; intensity: string }[]>([]);
  const [triptychPanels, setTriptychPanels] = useState(TRIPTYCH_PANELS);
  const [scenarioChoices, setScenarioChoices] = useState<Record<string, "a" | "b">>({});
  const [vennPlacements, setVennPlacements] = useState<Record<string, "left" | "overlap" | "right" | "unplaced">>({});
  const [vennItems, setVennItems] = useState(VENN_ITEMS);
  const [heatmapCells, setHeatmapCells] = useState(HEATMAP_INITIAL_CELLS);

  // ── State for new demos ──
  const [stakeholderNodes, setStakeholderNodes] = useState(STAKEHOLDER_NODES);
  const [culturalMarkers, setCulturalMarkers] = useState(CULTURAL_MARKERS);
  const [bodyMarkers, setBodyMarkers] = useState(BODY_INITIAL_MARKERS);
  const [saboteurData, setSaboteurData] = useState(SABOTEUR_DEMO);
  const [splitRows, setSplitRows] = useState(SPLIT_ROWS);
  const [dialogueTurns, setDialogueTurns] = useState(DIALOGUE_TURNS);
  const [immunityLevels, setImmunityLevels] = useState(IMMUNITY_LEVELS);
  const [arcPhases, setArcPhases] = useState(ARC_PHASES);
  const [windowValue, setWindowValue] = useState(45);
  const [drivingForces, setDrivingForces] = useState(DRIVING_FORCES);
  const [restrainingForces, setRestrainingForces] = useState(RESTRAINING_FORCES);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary, fontFamily: body }}>
      {/* Header */}
      <div style={{ padding: `${space[7]}px ${space[5]}px ${space[6]}px`, maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: colors.coral, fontFamily: display, letterSpacing: "0.05em", margin: "0 0 8px 0" }}>
          EXERCISE PRIMITIVES
        </p>
        <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
          Mindcraft Component Library
        </h1>
        <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
          24 interactive primitives for 90+ coaching exercises across Parachute, Jetstream, and Basecamp.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: `0 ${space[5]}px`, display: "flex", gap: 6, flexWrap: "wrap", marginBottom: space[6] }}>
        {PRIMITIVES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            style={{
              padding: "8px 16px", fontSize: 12, fontWeight: 600, fontFamily: display, letterSpacing: "0.01em",
              border: activeId === p.id ? "none" : `1px solid ${colors.borderDefault}`,
              borderRadius: radii.full,
              backgroundColor: activeId === p.id ? colors.coral : "transparent",
              color: activeId === p.id ? colors.bgDeep : colors.textSecondary,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Active demo */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: `0 ${space[5]}px ${space[8]}px` }}>
        {/* Exercise label */}
        <div style={{ marginBottom: space[5], padding: `${space[3]}px ${space[4]}px`, backgroundColor: colors.bgSurface, borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}` }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, fontFamily: display, letterSpacing: "0.04em", margin: "0 0 4px 0" }}>DEMO EXERCISE</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, fontFamily: body, margin: 0 }}>
            {PRIMITIVES.find((p) => p.id === activeId)?.exercise}
          </p>
        </div>

        {/* ── 1. Wheel ── */}
        {activeId === "wheel" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Rate each disruption 1–10. Click a segment to change its value. The plum overlay shows your Day 24 reassessment for comparison.</p>
            <WheelChart categories={DISRUPTION_CATEGORIES} values={wheelValues} comparisonValues={wheelComparison} onChange={(i, v) => { const next = [...wheelValues]; next[i] = v; setWheelValues(next); }} />
          </div>
        )}

        {/* ── 2. Timeline ── */}
        {activeId === "timeline" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Map the last 6–12 months. Add events, tag emotions, and note the subtext underneath.</p>
            <TimelineRiver events={timelineEvents} onAddEvent={(e) => setTimelineEvents((prev) => [...prev, e])} onEditEvent={(id, updates) => setTimelineEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)))} onRemoveEvent={(id) => setTimelineEvents((prev) => prev.filter((e) => e.id !== id))} />
          </div>
        )}

        {/* ── 3. Card Sort ── */}
        {activeId === "cardsort" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Drag your inner critic patterns into categories. Which saboteurs are loudest right now?</p>
            <CardSort cards={SABOTEUR_CARDS_DATA} buckets={SABOTEUR_BUCKETS} allowAdd onAddCard={(card) => console.log("Added:", card)} onSort={(bucket, ids) => console.log("Sorted:", bucket, ids)} />
          </div>
        )}

        {/* ── 4. Spectrum ── */}
        {activeId === "spectrum" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Place yourself on the acceptance spectrum. Not where you should be — where you actually are.</p>
            <SpectrumSlider labels={ACCEPTANCE_STAGES} value={spectrumValue} onChange={setSpectrumValue} description="Healthy grief oscillates. Getting stuck in one position is the risk — not being in any particular position." />
          </div>
        )}

        {/* ── 5. Bubble Sort ── */}
        {activeId === "bubble" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>When two values conflict, which wins? Click the one that matters more.</p>
            <BubbleSort items={VALUES_FOR_RANKING} question="Which value matters more to you?" onComplete={(ranked) => console.log("Final ranking:", ranked)} />
          </div>
        )}

        {/* ── 6. Dot Grid ── */}
        {activeId === "dotgrid" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Separate financial facts from financial fear. Drag each item to where it belongs.</p>
            <DotGrid items={dotItems} axisLabels={{ top: "Fact", bottom: "Fear", left: "Not in my control", right: "In my control" }} onChange={setDotItems} title="Financial Ground Truth" />
          </div>
        )}

        {/* ── 7. Word Cloud ── */}
        {activeId === "wordcloud" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Type the values that emerged from your stories. Click a word to strengthen it.</p>
            <WordCloudBuilder words={cloudWords} onAddWord={(word) => setCloudWords((prev) => [...prev, { text: word, weight: 1 }])} onRemoveWord={(word) => setCloudWords((prev) => prev.filter((w) => w.text !== word))} onWeightChange={(word, weight) => setCloudWords((prev) => prev.map((w) => (w.text === word ? { ...w, weight } : w)))} placeholder="Type a value and press Enter..." />
          </div>
        )}

        {/* ── 8. Emotion Wheel ── */}
        {activeId === "emotion" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>What are you feeling right now? Click segments to select. Outer ring = mild, inner ring = intense.</p>
            <EmotionWheel selected={selectedEmotions} onSelect={(emotion, intensity) => { setSelectedEmotions((prev) => { const exists = prev.find((e) => e.emotion === emotion && e.intensity === intensity); if (exists) return prev.filter((e) => !(e.emotion === emotion && e.intensity === intensity)); return [...prev, { emotion, intensity }]; }); }} />
          </div>
        )}

        {/* ── 9. Before / After ── */}
        {activeId === "beforeafter" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Compare your Day 1 disruption scores with Day 24. Movement is data.</p>
            <BeforeAfterComparison title="Seven Disruptions: Day 1 → Day 24" dataPoints={BEFORE_AFTER_DATA} periods={["Day 1", "Day 24"]} maxValue={10} />
          </div>
        )}

        {/* ── 10. Narrative Triptych ── */}
        {activeId === "triptych" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Write three versions of the same story. Which is closest to true?</p>
            <NarrativeTriptych panels={triptychPanels} onChange={(panelId, content) => { setTriptychPanels((prev) => prev.map((p) => (p.id === panelId ? { ...p, content } : p))); }} />
          </div>
        )}

        {/* ── 11. Forced Choice ── */}
        {activeId === "forcedchoice" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Real scenarios, real cost. How do your values guide decisions when there is something to lose?</p>
            <ForcedChoiceMatrix scenarios={SCENARIO_DATA} choices={scenarioChoices} onChange={(id, choice) => setScenarioChoices((prev) => ({ ...prev, [id]: choice }))} onComplete={(results) => console.log("Values results:", results)} />
          </div>
        )}

        {/* ── 12. Progress River ── */}
        {activeId === "progressriver" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Your journey across the full program. The river widens when ratings are high and narrows when things feel harder.</p>
            <ProgressRiver days={PROGRESS_RIVER_DAYS} currentDay={12} programName="PARACHUTE" weekNames={["GROUND", "DIG", "BUILD", "INTEGRATE"]} />
          </div>
        )}

        {/* ── 13. Venn Overlap ── */}
        {activeId === "venn" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Who were you in that role? Who are you without it? Place traits where they belong.</p>
            <VennOverlap leftLabel="Old Role" rightLabel="Emerging Self" items={vennItems} placements={vennPlacements} onChange={(id, zone) => setVennPlacements((prev) => ({ ...prev, [id]: zone }))} onAddItem={(item) => setVennItems((prev) => [...prev, item])} />
          </div>
        )}

        {/* ── 14. Heatmap Tracker ── */}
        {activeId === "heatmap" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Track your saboteurs across the week. Click a cell to set intensity (0-5). Right-click to add a note.</p>
            <HeatmapTracker title="Saboteur Activity This Week" rows={HEATMAP_ROWS} columns={HEATMAP_COLS} cells={heatmapCells} onChange={(rowId, colId, value) => { setHeatmapCells((prev) => { const existing = prev.find((c) => c.rowId === rowId && c.colId === colId); if (existing) return prev.map((c) => c.rowId === rowId && c.colId === colId ? { ...c, value } : c); return [...prev, { rowId, colId, value }]; }); }} onNoteChange={(rowId, colId, note) => { setHeatmapCells((prev) => { const existing = prev.find((c) => c.rowId === rowId && c.colId === colId); if (existing) return prev.map((c) => c.rowId === rowId && c.colId === colId ? { ...c, note } : c); return [...prev, { rowId, colId, value: 1, note }]; }); }} />
          </div>
        )}

        {/* ── 15. Stakeholder Map ── */}
        {activeId === "stakeholder" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Map the people around you. Drag them closer or farther based on the relationship. Color by ally, neutral, or blocker.</p>
            <StakeholderMap nodes={stakeholderNodes} onChange={setStakeholderNodes} onAddNode={(node) => setStakeholderNodes((prev) => [...prev, node])} />
          </div>
        )}

        {/* ── 16. Multi-Spectrum Compare ── */}
        {activeId === "multispectrum" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Map your style against the new culture and your old one. Where are the biggest gaps?</p>
            <MultiSpectrumCompare dimensions={CULTURAL_DIMENSIONS} markers={culturalMarkers} legend={CULTURAL_LEGEND} onChange={(markerId, dimensionId, value) => { setCulturalMarkers((prev) => prev.map((m) => m.markerId === markerId && m.dimensionId === dimensionId ? { ...m, value } : m)); }} />
          </div>
        )}

        {/* ── 17. Body Map ── */}
        {activeId === "bodymap" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Where do you carry stress? Click a body zone to mark a sensation. Your body keeps the score before your mind catches up.</p>
            <BodyMap markers={bodyMarkers} onChange={setBodyMarkers} title="Somatic Awareness Map" />
          </div>
        )}

        {/* ── 18. Saboteur Card ── */}
        {activeId === "saboteurcard" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Build a character profile for your inner critic. Know it well enough to recognize it instantly.</p>
            <SaboteurCard saboteur={saboteurData} onChange={setSaboteurData} expanded onToggleExpand={() => {}} />
          </div>
        )}

        {/* ── 19. Split Annotator ── */}
        {activeId === "splitannotator" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Left column: what was actually said. Right column: the story your mind built around it. Tag the distortions.</p>
            <SplitAnnotator leftColumnLabel="What the PIP Says" rightColumnLabel="What My Mind Adds" rows={splitRows} availableTags={SPLIT_TAGS} onChange={setSplitRows} onAddRow={() => setSplitRows((prev) => [...prev, { id: String(Date.now()), leftText: "", rightText: "", tags: [] }])} />
          </div>
        )}

        {/* ── 20. Dialogue Sequence ── */}
        {activeId === "dialogue" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Have a conversation between your inner critic and your Self. Listen to both. Neither is wrong — both carry information.</p>
            <DialogueSequence title="Inner Critic ↔ Self Dialogue" voices={DIALOGUE_VOICES} turns={dialogueTurns} onChange={setDialogueTurns} onAddTurn={(voiceId) => setDialogueTurns((prev) => [...prev, { id: String(Date.now()), voice: voiceId, content: "" }])} />
          </div>
        )}

        {/* ── 21. Hierarchical Branch ── */}
        {activeId === "hierarchy" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Dig beneath the surface. What goal are you blocked on? What hidden commitment competes with it? What assumption holds it all in place?</p>
            <HierarchicalBranch title="Immunity to Change Map" levels={immunityLevels} onChange={(levelId, content) => setImmunityLevels((prev) => prev.map((l) => l.id === levelId ? { ...l, content } : l))} />
          </div>
        )}

        {/* ── 22. Emotional Arc ── */}
        {activeId === "emotionalarc" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Track an emotion through its full arc. It rises, peaks, and falls. Your job is to stay with it — not stop it.</p>
            <EmotionalArc title="Emotion Wave" emotionLabel="Anger" phases={arcPhases} onChange={(phaseId, content) => setArcPhases((prev) => prev.map((p) => p.id === phaseId ? { ...p, content } : p))} onIntensityChange={(phaseId, intensity) => setArcPhases((prev) => prev.map((p) => p.id === phaseId ? { ...p, intensity } : p))} />
          </div>
        )}

        {/* ── 23. Zoned Spectrum ── */}
        {activeId === "zonedspectrum" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>Where are you on the nervous system spectrum right now? Different zones need different tools.</p>
            <ZonedSpectrum title="Window of Tolerance" zones={WINDOW_ZONES} value={windowValue} onChange={setWindowValue} leftLabel="Shutdown" rightLabel="Overwhelm" />
          </div>
        )}

        {/* ── 24. Force Field ── */}
        {activeId === "forcefield" && (
          <div>
            <p style={{ fontSize: 14, color: colors.textSecondary, marginBottom: space[4], lineHeight: 1.6 }}>What forces are pushing you toward change? What forces are holding you back? Map the tension.</p>
            <ForceFieldDiagram centerLabel="Meeting the PIP" drivingForces={drivingForces} restrainingForces={restrainingForces} onAddDriving={(f) => setDrivingForces((prev) => [...prev, f])} onAddRestraining={(f) => setRestrainingForces((prev) => [...prev, f])} onStrengthChange={(id, side, strength) => { if (side === "driving") setDrivingForces((prev) => prev.map((f) => f.id === id ? { ...f, strength } : f)); else setRestrainingForces((prev) => prev.map((f) => f.id === id ? { ...f, strength } : f)); }} onRemove={(id, side) => { if (side === "driving") setDrivingForces((prev) => prev.filter((f) => f.id !== id)); else setRestrainingForces((prev) => prev.filter((f) => f.id !== id)); }} />
          </div>
        )}
      </div>
    </div>
  );
}
