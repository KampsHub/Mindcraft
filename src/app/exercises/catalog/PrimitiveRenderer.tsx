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

function WheelDemo() {
  const [v, setV] = useState([5, 4, 6, 3, 7, 5, 4]);
  return <WheelChart categories={["Area 1","Area 2","Area 3","Area 4","Area 5","Area 6","Area 7"]} values={v} onChange={(i, val) => { const n = [...v]; n[i] = val; setV(n); }} />;
}

function TimelineDemo() {
  const [events, setEvents] = useState<{ id: string; label: string; date?: string; emotion?: string; detail?: string }[]>([
    { id: "1", label: "Event 1", date: "3 months ago", emotion: "anxiety" },
    { id: "2", label: "Event 2", date: "1 month ago", emotion: "sadness" },
  ]);
  return <TimelineRiver events={events} onAddEvent={(e) => setEvents((p) => [...p, e])} onEditEvent={(id, u) => setEvents((p) => p.map((e) => e.id === id ? { ...e, ...u } : e))} onRemoveEvent={(id) => setEvents((p) => p.filter((e) => e.id !== id))} />;
}

function CardSortDemo() {
  return <CardSort cards={[{ id: "1", label: "Item A" }, { id: "2", label: "Item B" }, { id: "3", label: "Item C" }, { id: "4", label: "Item D" }]} buckets={[{ id: "yes", label: "Yes", color: colors.coral }, { id: "no", label: "No", color: colors.plum }, { id: "maybe", label: "Maybe", color: colors.textMuted }]} allowAdd onSort={() => {}} />;
}

function SpectrumDemo() {
  const [v, setV] = useState(50);
  return <SpectrumSlider labels={["Low", "Medium-Low", "Medium", "Medium-High", "High"]} value={v} onChange={setV} />;
}

function BubbleSortDemo() {
  return <BubbleSort items={["Option A", "Option B", "Option C", "Option D"]} question="Which matters more?" onComplete={() => {}} />;
}

function DotGridDemo() {
  const [items, setItems] = useState([
    { id: "1", label: "Factor A", x: 30, y: 40 },
    { id: "2", label: "Factor B", x: 70, y: 60 },
    { id: "3", label: "Factor C", x: 50, y: 25 },
  ]);
  return <DotGrid items={items} axisLabels={{ top: "High", bottom: "Low", left: "Internal", right: "External" }} onChange={setItems} />;
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

function VennDemo() {
  const [placements, setPlacements] = useState<Record<string, "left" | "overlap" | "right" | "unplaced">>({});
  const [items, setItems] = useState([{ id: "1", label: "Trait A" }, { id: "2", label: "Trait B" }, { id: "3", label: "Trait C" }]);
  return <VennOverlap leftLabel="Before" rightLabel="After" items={items} placements={placements} onChange={(id, z) => setPlacements((p) => ({ ...p, [id]: z }))} onAddItem={(item) => setItems((p) => [...p, item])} />;
}

function HeatmapDemo() {
  const [cells, setCells] = useState([{ rowId: "r1", colId: "c1", value: 3 }, { rowId: "r2", colId: "c2", value: 4 }]);
  return <HeatmapTracker rows={[{ id: "r1", label: "Pattern A" }, { id: "r2", label: "Pattern B" }]} columns={[{ id: "c1", label: "Mon" }, { id: "c2", label: "Tue" }, { id: "c3", label: "Wed" }, { id: "c4", label: "Thu" }, { id: "c5", label: "Fri" }]} cells={cells} onChange={(r, c, v) => setCells((p) => { const ex = p.find((x) => x.rowId === r && x.colId === c); if (ex) return p.map((x) => x.rowId === r && x.colId === c ? { ...x, value: v } : x); return [...p, { rowId: r, colId: c, value: v }]; })} />;
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

function BodyMapDemo() {
  const [markers, setMarkers] = useState<{ id: string; zone: string; sensation: string; intensity: number; label?: string; note?: string }[]>([]);
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

function SplitAnnotatorDemo() {
  const [rows, setRows] = useState([{ id: "1", leftText: "What actually happened", rightText: "What my mind added", tags: [] as string[] }]);
  return <SplitAnnotator leftColumnLabel="Facts" rightColumnLabel="Interpretation" rows={rows} availableTags={[{ id: "distortion", label: "Distortion", color: colors.coral }, { id: "assumption", label: "Assumption", color: colors.plum }]} onChange={setRows} onAddRow={() => setRows((p) => [...p, { id: String(Date.now()), leftText: "", rightText: "", tags: [] }])} />;
}

function DialogueDemo() {
  const [turns, setTurns] = useState<{ id: string; voice: string; prompt?: string; content: string }[]>([
    { id: "1", voice: "a", prompt: "Speak from the first perspective.", content: "" },
    { id: "2", voice: "b", prompt: "Respond from the second perspective.", content: "" },
  ]);
  return <DialogueSequence voices={[{ id: "a", label: "Voice A", color: colors.plum }, { id: "b", label: "Voice B", color: colors.coral }]} turns={turns} onChange={setTurns} onAddTurn={(v) => setTurns((p) => [...p, { id: String(Date.now()), voice: v, content: "" }])} />;
}

function HierarchyDemo() {
  const [levels, setLevels] = useState([
    { id: "1", label: "Surface", prompt: "What do you see?", content: "", color: colors.coral },
    { id: "2", label: "Beneath", prompt: "What's underneath that?", content: "", color: colors.coralPressed },
    { id: "3", label: "Root", prompt: "What's at the very bottom?", content: "", color: colors.plum },
  ]);
  return <HierarchicalBranch levels={levels} onChange={(id, c) => setLevels((p) => p.map((l) => l.id === id ? { ...l, content: c } : l))} />;
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

function ForceFieldDemo() {
  const [driving, setDriving] = useState([{ id: "d1", label: "Motivation", strength: 3 }]);
  const [restraining, setRestraining] = useState([{ id: "r1", label: "Fear", strength: 4 }]);
  return <ForceFieldDiagram centerLabel="Change" drivingForces={driving} restrainingForces={restraining} onAddDriving={(f) => setDriving((p) => [...p, f])} onAddRestraining={(f) => setRestraining((p) => [...p, f])} onStrengthChange={(id, side, s) => { if (side === "driving") setDriving((p) => p.map((f) => f.id === id ? { ...f, strength: s } : f)); else setRestraining((p) => p.map((f) => f.id === id ? { ...f, strength: s } : f)); }} onRemove={(id, side) => { if (side === "driving") setDriving((p) => p.filter((f) => f.id !== id)); else setRestraining((p) => p.filter((f) => f.id !== id)); }} />;
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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PrimitiveRenderer({ primitive, prePopulated }: { primitive: string; prePopulated?: Record<string, any> }) {
  const Component = RENDERERS[primitive];
  if (!Component) return <GuidedExercise />;
  return <Component {...(prePopulated || {})} />;
}
