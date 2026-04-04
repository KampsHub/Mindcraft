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
import PatternTracker from "@/components/exercises/primitives/PatternTracker";
import RetrievalCheck from "@/components/exercises/primitives/RetrievalCheck";
import AISimulation from "@/components/exercises/primitives/AISimulation";
import EmotionalArc from "@/components/exercises/primitives/EmotionalArc";
import ZonedSpectrum from "@/components/exercises/primitives/ZonedSpectrum";
import ForceFieldDiagram from "@/components/exercises/primitives/ForceFieldDiagram";

const body = fonts.bodyAlt;

// ── Guided text exercise (journal/meditation) ──
function GuidedExercise() {
  const [text, setText] = useState("");
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Begin writing here..."
        style={{
          width: "100%", minHeight: 160, padding: space[4],
          fontSize: 15, fontFamily: fonts.serif, lineHeight: 1.7,
          backgroundColor: colors.bgInput, color: colors.textPrimary,
          border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
          outline: "none", resize: "vertical", boxSizing: "border-box",
        }}
      />
      <p style={{ fontSize: 12, color: colors.textMuted, marginTop: space[2], fontFamily: body }}>
        {text.split(/\s+/).filter(Boolean).length} words
      </p>
    </div>
  );
}

// ── Wrapper for each primitive with self-contained state ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function WheelDemo(props?: Record<string, any>) {
  const categories = props?.categories || ["Area 1","Area 2","Area 3","Area 4","Area 5","Area 6","Area 7"];
  const [v, setV] = useState(props?.values || [5, 4, 6, 3, 7, 5, 4]);
  return <WheelChart categories={categories} values={v} onChange={(i, val) => { const n = [...v]; n[i] = val; setV(n); }} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TimelineDemo(props?: Record<string, any>) {
  const defaultEvents = [
    { id: "1", label: "Event 1", date: "3 months ago", emotion: "anxiety" },
    { id: "2", label: "Event 2", date: "1 month ago", emotion: "sadness" },
  ];
  const [events, setEvents] = useState<{ id: string; label: string; date?: string; emotion?: string; detail?: string }[]>(props?.events || defaultEvents);
  return <TimelineRiver events={events} onAddEvent={(e) => setEvents((p) => [...p, e])} onEditEvent={(id, u) => setEvents((p) => p.map((e) => e.id === id ? { ...e, ...u } : e))} onRemoveEvent={(id) => setEvents((p) => p.filter((e) => e.id !== id))} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CardSortDemo(props?: Record<string, any>) {
  const cards = props?.cards || [{ id: "1", label: "Item A" }, { id: "2", label: "Item B" }, { id: "3", label: "Item C" }, { id: "4", label: "Item D" }];
  const buckets = props?.buckets || [{ id: "yes", label: "Yes", color: colors.coral }, { id: "no", label: "No", color: colors.plum }, { id: "maybe", label: "Maybe", color: colors.textMuted }];
  return <CardSort cards={cards} buckets={buckets} allowAdd={props?.allowAdd !== false} onSort={() => {}} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SpectrumDemo(props?: Record<string, any>) {
  const [v, setV] = useState(props?.value || 50);
  const labels = props?.labels || ["Low", "Medium-Low", "Medium", "Medium-High", "High"];
  return <SpectrumSlider labels={labels} value={v} onChange={setV} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BubbleSortDemo(props?: Record<string, any>) {
  const items = props?.items || ["Option A", "Option B", "Option C", "Option D"];
  const question = props?.question || "Which matters more?";
  return <BubbleSort items={items} question={question} onComplete={() => {}} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DotGridDemo(props?: Record<string, any>) {
  const defaultItems = [
    { id: "1", label: "Factor A", x: 30, y: 40 },
    { id: "2", label: "Factor B", x: 70, y: 60 },
    { id: "3", label: "Factor C", x: 50, y: 25 },
  ];
  const axisLabels = props?.axisLabels || { top: "High", bottom: "Low", left: "Internal", right: "External" };
  const [items, setItems] = useState(props?.items || defaultItems);
  return <DotGrid items={items} axisLabels={axisLabels} onChange={setItems} />;
}

function WordCloudDemo() {
  const [words, setWords] = useState([{ text: "theme", weight: 2 }, { text: "pattern", weight: 3 }]);
  return <WordCloudBuilder words={words} onAddWord={(w) => setWords((p) => [...p, { text: w, weight: 1 }])} onRemoveWord={(w) => setWords((p) => p.filter((x) => x.text !== w))} onWeightChange={(w, wt) => setWords((p) => p.map((x) => x.text === w ? { ...x, weight: wt } : x))} placeholder="Type and press Enter..." />;
}

function EmotionWheelDemo() {
  const [sel, setSel] = useState<{ emotion: string; intensity: string }[]>([]);
  return <EmotionWheel selected={sel} onSelect={(e, i) => setSel((p) => { const ex = p.find((x) => x.emotion === e && x.intensity === i); if (ex) return p.filter((x) => !(x.emotion === e && x.intensity === i)); return [...p, { emotion: e, intensity: i }]; })} />;
}

function BeforeAfterDemo() {
  return <BeforeAfterComparison title="Before → After" dataPoints={[{ label: "Dimension 1", values: [{ period: "Before", value: 7 }, { period: "After", value: 4 }] }, { label: "Dimension 2", values: [{ period: "Before", value: 3 }, { period: "After", value: 6 }] }, { label: "Dimension 3", values: [{ period: "Before", value: 8 }, { period: "After", value: 5 }] }]} periods={["Before", "After"]} maxValue={10} />;
}

function TriptychDemo() {
  const [panels, setPanels] = useState([
    { id: "a", title: "Version A", subtitle: "First perspective", placeholder: "Write here...", content: "" },
    { id: "b", title: "Version B", subtitle: "Second perspective", placeholder: "Write here...", content: "" },
    { id: "c", title: "Version C", subtitle: "Third perspective", placeholder: "Write here...", content: "" },
  ]);
  return <NarrativeTriptych panels={panels} onChange={(id, c) => setPanels((p) => p.map((x) => x.id === id ? { ...x, content: c } : x))} />;
}

function ForcedChoiceDemo() {
  const [choices, setChoices] = useState<Record<string, "a" | "b">>({});
  return <ForcedChoiceMatrix scenarios={[{ id: "1", description: "A scenario that tests your values under pressure.", choiceA: "Option A", choiceB: "Option B", valueAtStake: "Value X vs. Value Y" }]} choices={choices} onChange={(id, c) => setChoices((p) => ({ ...p, [id]: c }))} />;
}

function ProgressRiverDemo() {
  return <ProgressRiver days={Array.from({ length: 30 }, (_, i) => ({ day: i + 1, completed: i < 8, rating: i < 8 ? [6, 5, 7, 4, 6, 5, 8, 6][i] : undefined, exerciseName: `Day ${i + 1}` }))} currentDay={8} programName="Program" weekNames={["Week 1", "Week 2", "Week 3", "Week 4"]} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function VennDemo(props?: Record<string, any>) {
  const defaultItems = [{ id: "1", label: "Trait A" }, { id: "2", label: "Trait B" }, { id: "3", label: "Trait C" }];
  const [placements, setPlacements] = useState<Record<string, "left" | "overlap" | "right" | "unplaced">>({});
  const [items, setItems] = useState<{id: string; label: string}[]>(props?.items || defaultItems);
  return <VennOverlap leftLabel={props?.leftLabel || "Before"} rightLabel={props?.rightLabel || "After"} items={items} placements={placements} onChange={(id, z) => setPlacements((p) => ({ ...p, [id]: z }))} onAddItem={(item) => setItems((p: {id: string; label: string}[]) => [...p, item])} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeatmapDemo(props?: Record<string, any>) {
  const defaultRows = [{ id: "r1", label: "Pattern A" }, { id: "r2", label: "Pattern B" }];
  const defaultCols = [{ id: "c1", label: "Mon" }, { id: "c2", label: "Tue" }, { id: "c3", label: "Wed" }, { id: "c4", label: "Thu" }, { id: "c5", label: "Fri" }];
  const [cells, setCells] = useState(props?.cells || []);
  return <HeatmapTracker rows={props?.rows || defaultRows} columns={props?.columns || defaultCols} cells={cells} onChange={(r, c, v) => setCells((p: {rowId: string; colId: string; value: number}[]) => { const ex = p.find((x) => x.rowId === r && x.colId === c); if (ex) return p.map((x) => x.rowId === r && x.colId === c ? { ...x, value: v } : x); return [...p, { rowId: r, colId: c, value: v }]; })} />;
}

function StakeholderDemo() {
  const [nodes, setNodes] = useState<{ id: string; name: string; role?: string; type: "ally" | "neutral" | "blocker" | "unknown"; x: number; y: number; notes?: string }[]>([
    { id: "1", name: "Person A", type: "ally", x: 35, y: 30 },
    { id: "2", name: "Person B", type: "neutral", x: 65, y: 50 },
  ]);
  return <StakeholderMap nodes={nodes} onChange={setNodes} onAddNode={(n) => setNodes((p) => [...p, n])} />;
}

function MultiSpectrumDemo() {
  const [markers, setMarkers] = useState([
    { dimensionId: "d1", markerId: "self", label: "You", value: 60, color: colors.coral },
    { dimensionId: "d1", markerId: "other", label: "Other", value: 35, color: colors.plum },
    { dimensionId: "d2", markerId: "self", label: "You", value: 70, color: colors.coral },
    { dimensionId: "d2", markerId: "other", label: "Other", value: 45, color: colors.plum },
  ]);
  return <MultiSpectrumCompare dimensions={[{ id: "d1", label: "Dimension 1", leftLabel: "Low", rightLabel: "High" }, { id: "d2", label: "Dimension 2", leftLabel: "Indirect", rightLabel: "Direct" }]} markers={markers} legend={[{ id: "self", label: "You", color: colors.coral }, { id: "other", label: "Other", color: colors.plum }]} onChange={(mid, did, v) => setMarkers((p) => p.map((m) => m.markerId === mid && m.dimensionId === did ? { ...m, value: v } : m))} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BodyMapDemo(props?: Record<string, any>) {
  const [markers, setMarkers] = useState<{ id: string; zone: string; sensation: string; intensity: number; label?: string; note?: string }[]>(props?.markers || []);
  return <BodyMap markers={markers} onChange={setMarkers} />;
}

function SaboteurCardDemo() {
  const [data, setData] = useState<{ id: string; name: string; archetype?: string; triggerPattern: string; exactWords: string; protectsFrom: string; activationHistory?: { day: number; intensity: number }[] }>({
    id: "demo", name: "The Pattern", archetype: "Inner Critic",
    triggerPattern: "When you feel evaluated or exposed.",
    exactWords: "You're not good enough for this.",
    protectsFrom: "The vulnerability of being seen as incompetent.",
    activationHistory: [{ day: 1, intensity: 3 }, { day: 3, intensity: 5 }, { day: 5, intensity: 2 }, { day: 7, intensity: 4 }],
  });
  return <SaboteurCard saboteur={data} onChange={setData} expanded />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SplitAnnotatorDemo(props?: Record<string, any>) {
  const defaultRows = [{ id: "1", leftText: "What actually happened", rightText: "What my mind added", tags: [] as string[] }];
  const defaultTags = [{ id: "distortion", label: "Distortion", color: colors.coral }, { id: "assumption", label: "Assumption", color: colors.plum }];
  const [rows, setRows] = useState<{id: string; leftText: string; rightText: string; tags: string[]}[]>(props?.rows || defaultRows);
  return <SplitAnnotator leftColumnLabel={props?.leftColumnLabel || "Facts"} rightColumnLabel={props?.rightColumnLabel || "Interpretation"} rows={rows} availableTags={props?.availableTags || defaultTags} onChange={setRows} onAddRow={() => setRows((p: {id: string; leftText: string; rightText: string; tags: string[]}[]) => [...p, { id: String(Date.now()), leftText: "", rightText: "", tags: [] }])} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DialogueDemo(props?: Record<string, any>) {
  const defaultVoices = [{ id: "a", label: "Voice A", color: colors.plum }, { id: "b", label: "Voice B", color: colors.coral }];
  const defaultTurns = [
    { id: "1", voice: "a", prompt: "Speak from the first perspective.", content: "" },
    { id: "2", voice: "b", prompt: "Respond from the second perspective.", content: "" },
  ];
  const voices = props?.voices || defaultVoices;
  const [turns, setTurns] = useState<{ id: string; voice: string; prompt?: string; content: string }[]>(props?.turns || defaultTurns);
  return <DialogueSequence voices={voices} turns={turns} onChange={setTurns} onAddTurn={(v) => setTurns((p) => [...p, { id: String(Date.now()), voice: v, content: "" }])} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HierarchyDemo(props?: Record<string, any>) {
  const defaultLevels = [
    { id: "1", label: "Surface", prompt: "What do you see?", content: "", color: colors.coral },
    { id: "2", label: "Beneath", prompt: "What's underneath that?", content: "", color: colors.coralPressed },
    { id: "3", label: "Root", prompt: "What's at the very bottom?", content: "", color: colors.plum },
  ];
  const [levels, setLevels] = useState(props?.levels || defaultLevels);
  return <HierarchicalBranch levels={levels} onChange={(id, c) => setLevels((p: {id: string; label: string; prompt: string; content: string; color: string}[]) => p.map((l) => l.id === id ? { ...l, content: c } : l))} />;
}

function EmotionalArcDemo() {
  const [phases, setPhases] = useState([
    { id: "rise", label: "Rising", prompt: "What triggered it?", content: "", intensity: 30 },
    { id: "peak", label: "Peak", prompt: "What does it feel like at the top?", content: "", intensity: 90 },
    { id: "fall", label: "Falling", prompt: "What shifts as it passes?", content: "", intensity: 40 },
    { id: "rest", label: "Integration", prompt: "What did you learn?", content: "", intensity: 15 },
  ]);
  return <EmotionalArc phases={phases} onChange={(id, c) => setPhases((p) => p.map((x) => x.id === id ? { ...x, content: c } : x))} onIntensityChange={(id, i) => setPhases((p) => p.map((x) => x.id === id ? { ...x, intensity: i } : x))} emotionLabel="Emotion" />;
}

function ZonedSpectrumDemo() {
  const [v, setV] = useState(45);
  return <ZonedSpectrum zones={[{ id: "low", label: "Low", fromPercent: 0, toPercent: 33, color: colors.plum, guidance: "You're in the lower zone. This is a place of stillness or disconnection." }, { id: "mid", label: "Balanced", fromPercent: 33, toPercent: 66, color: colors.success, guidance: "You're in the balanced zone. Clear thinking and grounded presence." }, { id: "high", label: "Activated", fromPercent: 66, toPercent: 100, color: colors.error, guidance: "You're activated. Use regulation tools to find your way back." }]} value={v} onChange={setV} leftLabel="Low" rightLabel="High" />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ForceFieldDemo(props?: Record<string, any>) {
  const defaultDriving = [{ id: "d1", label: "Motivation", strength: 3 }];
  const defaultRestraining = [{ id: "r1", label: "Fear", strength: 4 }];
  const [driving, setDriving] = useState(props?.drivingForces || defaultDriving);
  const [restraining, setRestraining] = useState(props?.restrainingForces || defaultRestraining);
  return <ForceFieldDiagram centerLabel={props?.centerLabel || "Change"} drivingForces={driving} restrainingForces={restraining} onAddDriving={(f) => setDriving((p: {id: string; label: string; strength: number}[]) => [...p, f])} onAddRestraining={(f) => setRestraining((p: {id: string; label: string; strength: number}[]) => [...p, f])} onStrengthChange={(id, side, s) => { if (side === "driving") setDriving((p: {id: string; label: string; strength: number}[]) => p.map((f) => f.id === id ? { ...f, strength: s } : f)); else setRestraining((p: {id: string; label: string; strength: number}[]) => p.map((f) => f.id === id ? { ...f, strength: s } : f)); }} onRemove={(id, side) => { if (side === "driving") setDriving((p: {id: string; label: string; strength: number}[]) => p.filter((f) => f.id !== id)); else setRestraining((p: {id: string; label: string; strength: number}[]) => p.filter((f) => f.id !== id)); }} />;
}

// ── New primitives ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PatternTrackerDemo(props?: Record<string, any>) {
  const defaultPatterns = [
    { id: "p1", label: "Pattern A", color: colors.coral },
    { id: "p2", label: "Pattern B", color: colors.plumLight },
  ];
  const [entries, setEntries] = useState<{day: number; patternId: string; intensity: number}[]>(props?.entries || []);
  return <PatternTracker patterns={props?.patterns || defaultPatterns} days={props?.days || 7} entries={entries} onChange={setEntries} currentDay={props?.currentDay || 1} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RetrievalCheckDemo(props?: Record<string, any>) {
  const defaultCards = [
    { id: "c1", prompt: "What is a saboteur?", answer: "An automatic pattern that was once protective but now works against you.", category: "Saboteurs" },
    { id: "c2", prompt: "Name the four NVC steps.", answer: "Observation, Feeling, Need, Request.", category: "NVC" },
  ];
  return <RetrievalCheck cards={props?.cards || defaultCards} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AISimulationDemo(props?: Record<string, any>) {
  return <AISimulation
    scenario={props?.scenario || "A difficult conversation practice"}
    aiRole={props?.aiRole || "The other person"}
    userRole={props?.userRole || "You (practicing)"}
    initialMessage={props?.initialMessage || "Let's begin. I'd like to discuss something that's been on my mind."}
    coachingNudges={props?.coachingNudges !== false}
  />;
}

// ── Main renderer ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RENDERERS: Record<string, (props?: Record<string, any>) => React.JSX.Element> = {
  wheelChart: WheelDemo,
  timelineRiver: TimelineDemo,
  cardSort: CardSortDemo,
  spectrumSlider: SpectrumDemo,
  bubbleSort: BubbleSortDemo,
  dotGrid: DotGridDemo,
  wordCloud: WordCloudDemo,
  emotionWheel: EmotionWheelDemo,
  beforeAfter: BeforeAfterDemo,
  narrativeTriptych: TriptychDemo,
  forcedChoice: ForcedChoiceDemo,
  progressRiver: ProgressRiverDemo,
  vennOverlap: VennDemo,
  heatmap: HeatmapDemo,
  stakeholderMap: StakeholderDemo,
  multiSpectrum: MultiSpectrumDemo,
  bodyMap: BodyMapDemo,
  saboteurCard: SaboteurCardDemo,
  splitAnnotator: SplitAnnotatorDemo,
  dialogueSequence: DialogueDemo,
  hierarchicalBranch: HierarchyDemo,
  emotionalArc: EmotionalArcDemo,
  zonedSpectrum: ZonedSpectrumDemo,
  forceField: ForceFieldDemo,
  guided: GuidedExercise,
  patternTracker: PatternTrackerDemo,
  retrievalCheck: RetrievalCheckDemo,
  aiSimulation: AISimulationDemo,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PrimitiveRenderer({ primitive, prePopulated }: { primitive: string; prePopulated?: Record<string, any> }) {
  const Component = RENDERERS[primitive];
  if (!Component) return <GuidedExercise />;
  return <Component {...(prePopulated || {})} />;
}
