"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import PillButton from "@/components/PillButton";
import { colors, fonts, radii, space } from "@/lib/theme";
import StreakDots from "@/components/StreakDots";
import GuidedExerciseCard from "@/components/GuidedExerciseCard";
import BodyMap from "@/components/exercises/primitives/BodyMap";
import ZonedSpectrum from "@/components/exercises/primitives/ZonedSpectrum";
import HierarchicalBranch from "@/components/exercises/primitives/HierarchicalBranch";
import NVCEmotionWheel from "./NVCEmotionWheel";
import NeedsPicker from "./NeedsPicker";
import BreathingCircle from "./BreathingCircle";
import { NEEDS, FEELINGS_SATISFIED, FEELINGS_UNSATISFIED } from "./nvc-data";
import { useJournalHistory } from "./useJournalHistory";
import ResetExercisesV2 from "./ResetExercisesV2";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Nervous system zones ── */
const WINDOW_ZONES = [
  { id: "hypo", label: "Shutdown", fromPercent: 0, toPercent: 25, color: colors.plum, guidance: "Dorsal vagal state — your nervous system has pulled the emergency brake. You may feel numb, foggy, flat, or unable to think clearly. Energy feels absent. This is your body's oldest protection: playing dead." },
  { id: "window", label: "Window of Tolerance", fromPercent: 25, toPercent: 65, color: colors.success, guidance: "Ventral vagal state — you're regulated. You can think, feel, and connect without being hijacked by either extreme. Stress may be present, but it's manageable. This is where your best processing, decision-making, and relational capacity live." },
  { id: "activated", label: "Activated", fromPercent: 65, toPercent: 85, color: colors.warning, guidance: "Sympathetic activation — your nervous system is ramping up. Heart rate elevated, thoughts may race or loop, muscles tensing. You might feel restless, irritable, or hyper-focused on threat. This is mobilization energy — useful in short bursts, costly when sustained." },
  { id: "hyper", label: "Fight or Flight", fromPercent: 85, toPercent: 100, color: colors.error, guidance: "Full sympathetic flood — your body is in survival mode. Adrenaline and cortisol are high. You may feel panicked, enraged, or like you need to escape. Rational thinking is offline — the prefrontal cortex goes dim when the amygdala takes over. This is not a failure, it's biology." },
];

/* ── 5-4-3-2-1 grounding levels ── */
const GROUNDING_LEVELS = [
  { id: "see", label: "5 Things You See", prompt: "Look around slowly. Name five things you can see right now.", content: "", color: colors.coral },
  { id: "hear", label: "4 Things You Hear", prompt: "Listen closely \u2014 even to the quiet sounds.", content: "", color: colors.coralPressed },
  { id: "touch", label: "3 Things You Can Touch", prompt: "Reach out. Feel their texture.", content: "", color: colors.plum },
  { id: "smell", label: "2 Things You Smell", prompt: "Breathe in gently. What\u2019s in the air?", content: "", color: colors.plumPressed },
  { id: "taste", label: "1 Thing You Taste", prompt: "Notice what\u2019s present in your mouth. You\u2019re here.", content: "", color: colors.plumDeep },
];

/* ── Somatic grounding icon ── */
const INK = "#E4DDE2";
const INK_DIM = "#99929B";

function SomaticIcon() {
  const s = 28;
  return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M14 4v10" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M14 14Q10 14 8 18Q6 22 8 24L12 24Q14 24 14 20" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M14 14Q18 14 20 18Q22 22 20 24L16 24Q14 24 14 20" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="3" r="1.5" fill={INK_DIM} />
    </svg>
  );
}

/* ── Reset Exercises ── */
const RESET_EXERCISES = [
  { id: "breathing", title: "Box Breathing", description: "4 seconds in · 4 hold · 4 out · 4 hold. Activates the parasympathetic nervous system within 90 seconds.", type: "interactive" as const },
  { id: "grounding", title: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Anchors attention to present sensory reality.", type: "interactive" as const },
  { id: "somatic", title: "Somatic Grounding", description: "Feet on floor, press down, feel the ground push back. Three slow breaths, exhale longer than inhale.", type: "guided" as const },
  { id: "relational", title: "Relational Grounding", description: "Picture one person whose presence settles your nervous system. See their face. Hear what they'd say. Let yourself feel the warmth.", type: "guided" as const },
  { id: "bilateral", title: "Bilateral Stimulation", description: "Alternate tapping your knees left-right for 60 seconds. This engages both hemispheres and reduces amygdala activation — the same mechanism behind EMDR.", type: "guided" as const },
  { id: "cold", title: "Cold Water Reset", description: "Run cold water over your wrists for 30 seconds, or splash your face. The dive reflex activates your vagus nerve and drops heart rate within seconds.", type: "guided" as const },
  { id: "humming", title: "Vagal Toning (Humming)", description: "Hum a low note for 10 seconds. Repeat 5 times. Humming vibrates the vagus nerve where it passes through the throat, shifting you toward ventral vagal (calm, connected) state.", type: "guided" as const },
  { id: "orienting", title: "Orienting Response", description: "Slowly turn your head left to right, looking around the room as if seeing it for the first time. Let your eyes land on anything that catches your attention. This activates your orienting reflex — a primal signal to your nervous system that you are safe.", type: "guided" as const },
];

/* Exercises highlighted when activated (> 65) */
const ACTIVATED_HIGHLIGHT = new Set(["bilateral", "cold", "breathing"]);
/* Exercises highlighted when shutdown (< 25) */
const SHUTDOWN_HIGHLIGHT = new Set(["somatic", "orienting", "humming"]);

/* ── Feeling → somatic suggestion map (Improvement #4) ── */
const FEELING_SOMATIC_MAP: Record<string, string[]> = {
  Constriction: ["tense", "anxious", "stressed", "nervous", "edgy"],
  "Whole Body": ["tired", "exhausted", "depleted", "weary", "fatigued"],
  "Mind States": ["numb", "disconnected", "detached", "withdrawn"],
  Pain: ["pain", "hurt", "anguished"],
};

function getSomaticSuggestions(emotions: { emotion: string }[]): string[] {
  const lower = new Set(emotions.map((e) => e.emotion.toLowerCase()));
  const suggestions: string[] = [];
  for (const [category, feelings] of Object.entries(FEELING_SOMATIC_MAP)) {
    if (feelings.some((f) => lower.has(f))) {
      suggestions.push(category);
    }
  }
  return suggestions;
}

/* ── Step slide animation variants ── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

/* ── Step Indicator Dots ── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: space[5] }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === current ? 24 : 8,
            height: 8,
            borderRadius: radii.full,
            backgroundColor: i + 1 === current ? colors.coral : i + 1 < current ? colors.coralPressed : colors.bgElevated,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ── Nervous System Sparkline (Improvement #3) ── */
function NervousSystemSparkline({ entries }: { entries: { nervousSystem: number; date: string }[] }) {
  if (entries.length < 2) return null;

  const width = 120;
  const height = 40;
  const padding = 4;
  const last7 = entries.slice(0, 7).reverse();

  const xStep = (width - padding * 2) / Math.max(last7.length - 1, 1);

  function getZoneColor(val: number): string {
    if (val < 25) return colors.plum;
    if (val < 65) return colors.success;
    if (val < 85) return colors.warning;
    return colors.error;
  }

  const points = last7.map((e, i) => {
    const x = padding + i * xStep;
    const y = padding + (1 - e.nervousSystem / 100) * (height - padding * 2);
    return { x, y, val: e.nervousSystem };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ marginTop: space[3] }}>
      <p style={{ fontFamily: display, fontSize: 10, color: colors.textMuted, margin: `0 0 ${space[1]}px 0`, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Last {last7.length} check-ins
      </p>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
        <polyline
          points={polyline}
          fill="none"
          stroke={colors.borderDefault}
          strokeWidth={1.5}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={getZoneColor(p.val)} />
        ))}
      </svg>
    </div>
  );
}

/* ── Week Comparison Card (Improvement #5) ── */
function WeekComparisonCard({ weekComparison }: {
  weekComparison: {
    thisWeek: { avgNervousSystem: number; topEmotions: string[]; topNeeds: string[] };
    lastWeek: { avgNervousSystem: number; topEmotions: string[]; topNeeds: string[] } | null;
  };
}) {
  if (!weekComparison.lastWeek) return null;

  const diff = weekComparison.thisWeek.avgNervousSystem - weekComparison.lastWeek.avgNervousSystem;
  const arrow = diff > 0 ? "\u2191" : diff < 0 ? "\u2193" : "\u2192";
  const arrowColor = diff > 5 ? colors.warning : diff < -5 ? colors.success : colors.textMuted;

  return (
    <div style={{
      marginTop: space[3],
      padding: `${space[2]}px ${space[3]}px`,
      backgroundColor: colors.bgRecessed,
      borderRadius: radii.sm,
      border: `1px solid ${colors.borderSubtle}`,
    }}>
      <p style={{ fontFamily: display, fontSize: 10, fontWeight: 600, color: colors.textMuted, margin: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        This week vs last week
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: display, fontSize: 13, fontWeight: 700, color: arrowColor }}>
          {arrow} {weekComparison.thisWeek.avgNervousSystem}
        </span>
        <span style={{ fontFamily: body, fontSize: 11, color: colors.textMuted }}>
          avg nervous system (was {weekComparison.lastWeek.avgNervousSystem})
        </span>
      </div>
      {weekComparison.thisWeek.topEmotions.length > 0 && (
        <p style={{ fontFamily: body, fontSize: 11, color: colors.textSecondary, margin: "4px 0 0 0" }}>
          Top feelings: {weekComparison.thisWeek.topEmotions.join(", ")}
        </p>
      )}
    </div>
  );
}

/* ── Toast component ── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            backgroundColor: colors.bgElevated,
            border: `1px solid ${colors.coral}`,
            borderRadius: radii.full,
            color: colors.textPrimary,
            fontFamily: body,
            fontSize: 13,
            zIndex: 1000,
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Reset Exercises (collapsible section) ── */
function ResetExercises({ groundingResponses, setGroundingResponses, nervousSystemValue, forceOpen }: {
  groundingResponses: { id: string; label: string; prompt: string; content: string; color: string }[];
  setGroundingResponses: React.Dispatch<React.SetStateAction<{ id: string; label: string; prompt: string; content: string; color: string }[]>>;
  nervousSystemValue: number;
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(forceOpen);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const isActivated = nervousSystemValue > 65;
  const isShutdown = nervousSystemValue < 25;
  const highlightSet = isActivated ? ACTIVATED_HIGHLIGHT : isShutdown ? SHUTDOWN_HIGHLIGHT : null;

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <FadeIn preset="fade" delay={0.2} triggerOnMount>
      <div style={{ marginTop: 48 }}>
        {/* Improvement #6: Regulation banner */}
        {isActivated && (
          <div style={{
            padding: `${space[2]}px ${space[3]}px`,
            backgroundColor: colors.coralWash,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${colors.coral}`,
            marginBottom: space[3],
          }}>
            <p style={{ fontFamily: body, fontSize: 13, color: colors.coral, margin: 0 }}>
              Your nervous system is activated. These exercises can help right now.
            </p>
          </div>
        )}
        {isShutdown && (
          <div style={{
            padding: `${space[2]}px ${space[3]}px`,
            backgroundColor: colors.plumWash,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${colors.plumLight}`,
            marginBottom: space[3],
          }}>
            <p style={{ fontFamily: body, fontSize: 13, color: colors.plumLight, margin: 0 }}>
              You&apos;re in a shutdown state. Gentle movement and warmth can help.
            </p>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textMuted, margin: 0,
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            Need a quick reset?
          </p>
          <span style={{
            fontSize: 14, color: colors.textMuted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            ▾
          </span>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: body }}>
            {RESET_EXERCISES.length} exercises
          </span>
        </button>

        {open && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {RESET_EXERCISES.map((ex) => {
              const isActive = activeExercise === ex.id;
              const isHighlighted = highlightSet?.has(ex.id) ?? false;
              return (
                <div key={ex.id}>
                  <button
                    onClick={() => setActiveExercise(isActive ? null : ex.id)}
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "10px 14px",
                      backgroundColor: isActive ? colors.bgRecessed : colors.bgSurface,
                      border: `1px solid ${isActive ? colors.coral : colors.borderSubtle}`,
                      borderRadius: radii.md,
                      borderLeft: isHighlighted ? `3px solid ${colors.coral}` : undefined,
                      cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                        {ex.title}
                      </span>
                      <p style={{ fontFamily: body, fontSize: 11, color: colors.textMuted, margin: "4px 0 0 0", lineHeight: 1.4 }}>
                        {ex.description}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: colors.textMuted, flexShrink: 0, marginLeft: 8 }}>
                      {isActive ? "\u2212" : "+"}
                    </span>
                  </button>

                  {isActive && ex.id === "breathing" && (
                    <div style={{ marginTop: 8 }}><BreathingCircle /></div>
                  )}
                  {isActive && ex.id === "grounding" && (
                    <div style={{ marginTop: 8 }}>
                      <HierarchicalBranch
                        title="5-4-3-2-1 Grounding"
                        levels={groundingResponses}
                        onChange={(id, content) => setGroundingResponses((prev) => prev.map((l) => l.id === id ? { ...l, content } : l))}
                      />
                    </div>
                  )}
                  {isActive && ex.id === "somatic" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Somatic Grounding" icon={<SomaticIcon />} steps={[
                        { instruction: "Place both feet flat on the floor. Notice the contact.", type: "text" },
                        { instruction: "Press down gently. Feel the ground pressing back.", type: "text" },
                        { instruction: "Three slow breaths. Let each exhale be longer than the inhale.", type: "breathe", duration: 12 },
                        { instruction: "Notice one sensation in your body \u2014 without trying to change it.", type: "text" },
                      ]} />
                    </div>
                  )}
                  {isActive && ex.id === "relational" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Relational Grounding" icon={<SomaticIcon />} steps={[
                        { instruction: "Think of one person whose presence settles your nervous system. Someone safe.", type: "text" },
                        { instruction: "Picture their face. Let the image become clear.", type: "text" },
                        { instruction: "Imagine what they would say to you right now. Hear their voice.", type: "text" },
                        { instruction: "Let yourself feel the warmth of that connection \u2014 even though they\u2019re not here. Your nervous system can\u2019t tell the difference.", type: "text" },
                      ]} />
                    </div>
                  )}
                  {isActive && ex.id === "bilateral" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Bilateral Stimulation" icon={<SomaticIcon />} steps={[
                        { instruction: "Sit comfortably. Place your hands on your knees, palms down.", type: "text" },
                        { instruction: "Begin alternating: tap your left knee with your left hand, then your right knee with your right hand. Slow, steady rhythm.", type: "text" },
                        { instruction: "Continue for 60 seconds. Let your eyes follow your hands or close them. Focus on the rhythm, not on thinking.", type: "breathe", duration: 60 },
                        { instruction: "Stop. Notice what shifted. The bilateral movement engages both hemispheres and lowers amygdala activation \u2014 the same mechanism behind EMDR.", type: "text" },
                      ]} />
                    </div>
                  )}
                  {isActive && ex.id === "cold" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Cold Water Reset" icon={<SomaticIcon />} steps={[
                        { instruction: "Go to a sink. Turn the water to cold.", type: "text" },
                        { instruction: "Run cold water over the insides of your wrists for 30 seconds. Or splash your face with cold water.", type: "breathe", duration: 30 },
                        { instruction: "Notice the dive reflex \u2014 your heart rate drops, breathing slows. This is your vagus nerve activating.", type: "text" },
                        { instruction: "Dry off. Take one slow breath. Notice how different you feel from 60 seconds ago.", type: "text" },
                      ]} />
                    </div>
                  )}
                  {isActive && ex.id === "humming" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Vagal Toning" icon={<SomaticIcon />} steps={[
                        { instruction: "Take a deep breath in through your nose.", type: "text" },
                        { instruction: "As you exhale, hum a low, steady note. Feel the vibration in your throat and chest.", type: "breathe", duration: 10 },
                        { instruction: "Repeat 5 times. Each hum stimulates the vagus nerve where it passes through your throat, shifting your nervous system toward ventral vagal \u2014 calm, connected, present.", type: "breathe", duration: 50 },
                        { instruction: "Sit quietly for a moment. Notice any shift in your body \u2014 warmth, tingling, settling.", type: "text" },
                      ]} />
                    </div>
                  )}
                  {isActive && ex.id === "orienting" && (
                    <div style={{ marginTop: 8 }}>
                      <GuidedExerciseCard title="Orienting Response" icon={<SomaticIcon />} steps={[
                        { instruction: "Slowly turn your head to the left. Let your eyes land on something. Really look at it \u2014 color, shape, texture.", type: "text" },
                        { instruction: "Now slowly turn to the right. Same thing. Let your eyes settle on something that catches your attention.", type: "text" },
                        { instruction: "Look up. Look down. Take your time. You\u2019re activating your orienting reflex \u2014 a primal signal to your nervous system that says \u2018I am safe enough to look around.\u2019", type: "text" },
                        { instruction: "Notice if your breathing has changed. Your shoulders may have dropped. This is regulation happening without you forcing it.", type: "text" },
                      ]} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FadeIn>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Page Component
   ════════════════════════════════════════════════════════════════ */

export default function MindfulJournalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entry, setEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"writing" | "saved">("writing");
  const [savedStats, setSavedStats] = useState({ words: 0, emotions: 0, needs: 0, bodyZones: 0 });
  const [error, setError] = useState("");

  /* Step flow (Improvement #1) */
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const TOTAL_STEPS = 5;

  /* Emotion wheel */
  const [selectedEmotions, setSelectedEmotions] = useState<{ emotion: string; intensity: string }[]>([]);

  /* Needs */
  const [checkedNeeds, setCheckedNeeds] = useState<Set<string>>(new Set());

  /* Body map */
  const [bodyMarkers, setBodyMarkers] = useState<{ id: string; zone: string; sensation: string; intensity: number; label?: string; note?: string }[]>([]);

  /* Nervous system */
  const [nervousSystemValue, setNervousSystemValue] = useState(45);

  /* Grounding responses */
  const [groundingResponses, setGroundingResponses] = useState(GROUNDING_LEVELS);

  /* Voice recording state */
  const [micListening, setMicListening] = useState(false);
  const micRecognitionRef = useRef<any>(null);
  const micIntentRef = useRef(false);

  /* AI Mirror (Improvement #2) */
  const [mirrorText, setMirrorText] = useState<string | null>(null);

  /* Toast (Improvement #7) */
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supabase = createClient();
  const router = useRouter();

  /* Journal history (Improvements #3, #5) */
  const { entries: historyEntries, weekComparison } = useJournalHistory(user?.id ?? null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
    });
  }, [supabase.auth, router]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000);
  }

  const toggleEmotion = useCallback((emotion: string, intensity: "mild" | "moderate" | "intense") => {
    setSelectedEmotions((prev) => {
      const exists = prev.some((s) => s.emotion === emotion && s.intensity === intensity);
      if (exists) return prev.filter((s) => !(s.emotion === emotion && s.intensity === intensity));
      return [...prev, { emotion, intensity }];
    });
  }, []);

  function toggleNeed(need: string) {
    setCheckedNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(need)) next.delete(need);
      else next.add(need);
      return next;
    });
  }

  /* Improvement #7: Voice → NLP parser */
  const autoSelectFromText = useCallback((text: string) => {
    const lower = text.toLowerCase();
    let count = 0;

    for (const [cat, feelings] of Object.entries(FEELINGS_SATISFIED)) {
      if (lower.includes(cat.toLowerCase())) {
        toggleEmotion(cat.toLowerCase(), "moderate");
        count++;
      }
      for (const f of feelings) {
        if (lower.includes(f)) {
          toggleEmotion(f, "moderate");
          count++;
        }
      }
    }
    for (const [cat, feelings] of Object.entries(FEELINGS_UNSATISFIED)) {
      if (lower.includes(cat.toLowerCase())) {
        toggleEmotion(cat.toLowerCase(), "moderate");
        count++;
      }
      for (const f of feelings) {
        if (lower.includes(f)) {
          toggleEmotion(f, "moderate");
          count++;
        }
      }
    }

    return count;
  }, [toggleEmotion]);

  /* Find current nervous system zone */
  function currentZone() {
    return WINDOW_ZONES.find((z) => nervousSystemValue >= z.fromPercent && nervousSystemValue < z.toPercent)
      ?? WINDOW_ZONES.find((z) => nervousSystemValue === z.toPercent && z.toPercent === 100);
  }

  /* Step navigation */
  function goNext() {
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  function skipStep() {
    goNext();
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setError("");

    const { data: inserted, error: insertError } = await supabase
      .from("entries")
      .insert({
        client_id: user.id,
        coach_id: user.id,
        type: "journal",
        content: entry,
        theme_tags: [],
        date: new Date().toISOString().split("T")[0],
        metadata: {
          source: "mindful_journal",
          nvc_checklist: {
            emotions: selectedEmotions,
            needs: Array.from(checkedNeeds),
            body_markers: bodyMarkers,
            nervous_system: nervousSystemValue,
          },
        },
      })
      .select("id")
      .single();

    if (insertError) {
      setError("Failed to save entry. Please try again.");
      setLoading(false);
      return;
    }

    /* Embed for RAG (non-blocking) */
    if (inserted) {
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: inserted.id }),
      }).catch(() => {});
    }

    /* Improvement #2: AI emotional mirror */
    try {
      const mirrorRes = await fetch("/api/emotional-mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotions: selectedEmotions.map((e) => e.emotion),
          needs: Array.from(checkedNeeds),
          bodyMarkers: bodyMarkers.map((m) => ({ zone: m.zone, sensation: m.sensation, intensity: m.intensity })),
          nervousSystem: nervousSystemValue,
          journalExcerpt: entry.substring(0, 200),
        }),
      });
      if (mirrorRes.ok) {
        const mirrorData = await mirrorRes.json();
        if (mirrorData.mirror) setMirrorText(mirrorData.mirror);
      }
    } catch {
      /* skip mirror gracefully */
    }

    setSavedStats({
      words: wordCount,
      emotions: selectedEmotions.length,
      needs: checkedNeeds.size,
      bodyZones: bodyMarkers.length,
    });
    setPhase("saved");
    setLoading(false);
  }

  function handleWriteAnother() {
    setEntry("");
    setSelectedEmotions([]);
    setCheckedNeeds(new Set());
    setBodyMarkers([]);
    setNervousSystemValue(45);
    setGroundingResponses(GROUNDING_LEVELS);
    setMirrorText(null);
    setStep(1);
    setDirection(1);
    setPhase("writing");
  }

  const wordCount = entry.split(/\s+/).filter(Boolean).length;

  /* Improvement #4: somatic suggestions */
  const somaticSuggestions = getSomaticSuggestions(selectedEmotions);

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: colors.bgDeep }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: colors.textPrimary, fontFamily: body }}>
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <PageShell blobVariant="journal">
      {/* ── Header ── */}
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            Reset Journal
          </h1>
          <p style={{ fontSize: 14, color: colors.textPrimary, margin: 0, fontFamily: body }}>
            Come back here anytime throughout the day — even after your session is done. Everything you write here gets pulled into tomorrow&apos;s themes.
          </p>
        </div>
      </FadeIn>

      {/* ── Streak Dots ── */}
      <FadeIn preset="fade" delay={0.04} triggerOnMount>
        <StreakDots userId={user.id} supabase={supabase} />
      </FadeIn>

      {/* ── Step Flow ── */}
      <AnimatePresence mode="wait">
        {phase === "writing" ? (
          <motion.div
            key="writing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step indicator dots */}
            <StepDots current={step} total={TOTAL_STEPS} />

            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <AnimatePresence mode="wait" custom={direction}>
                {/* ──────── STEP 1: What's going on? ──────── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, position: "relative", zIndex: 100 }}>
                      <h2 style={{
                        fontFamily: display, fontSize: 20, fontWeight: 600,
                        color: colors.textPrimary, margin: 0,
                      }}>
                        What&apos;s going on?
                      </h2>
                      <div style={{ position: "relative", display: "inline-flex" }} className="info-tooltip-wrap">
                        <span
                          style={{
                            width: 20, height: 20, borderRadius: "50%",
                            border: `1.5px solid ${colors.textMuted}`,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: colors.textMuted,
                            cursor: "help", fontFamily: body, lineHeight: 1, flexShrink: 0,
                          }}
                        >
                          i
                        </span>
                        <div className="info-tooltip-body" style={{
                          position: "absolute", left: "50%", transform: "translateX(-50%)",
                          top: "calc(100% + 8px)", width: 280, padding: "12px 14px",
                          backgroundColor: colors.bgElevated, border: `1px solid ${colors.borderDefault}`,
                          borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                          color: colors.textBody, fontFamily: body, zIndex: 50,
                          pointerEvents: "none", opacity: 0, transition: "opacity 0.15s",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                        }}>
                          Naming your feelings, needs, and body sensations activates the prefrontal cortex and calms the amygdala — the brain&apos;s alarm system. Research shows that simply labelling an emotion reduces its intensity. Checking in with your body adds another layer of grounding.
                        </div>
                      </div>
                      <style>{`
                        .info-tooltip-wrap:hover .info-tooltip-body { opacity: 1 !important; pointer-events: auto !important; }
                      `}</style>
                    </div>

                    <div style={{ position: "relative" }}>
                      <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        placeholder="Write freely. What's present for you right now?"
                        rows={8}
                        style={{
                          width: "100%", padding: "18px 50px 18px 18px", fontSize: 15, lineHeight: 1.7,
                          border: `1px solid ${colors.borderDefault}`, borderRadius: 14,
                          resize: "vertical", outline: "none", boxSizing: "border-box",
                          fontFamily: body, backgroundColor: colors.bgInput,
                          color: colors.textPrimary, transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                        onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
                        disabled={loading}
                      />
                      {/* Voice input button */}
                      {!loading && (
                        <button
                          type="button"
                          onClick={() => {
                            if (micListening) {
                              // User explicitly stops — clear intent
                              micIntentRef.current = false;
                              if (micRecognitionRef.current) {
                                try { micRecognitionRef.current.stop(); } catch { /* */ }
                                micRecognitionRef.current = null;
                              }
                              setMicListening(false);
                              return;
                            }
                            try {
                              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                              if (!SpeechRecognition) { alert("Voice not supported in this browser"); return; }
                              const recognition = new SpeechRecognition();
                              recognition.continuous = true;
                              recognition.interimResults = true;
                              recognition.lang = "en-US";
                              recognition.onresult = (event: any) => {
                                for (let i = event.resultIndex; i < event.results.length; i++) {
                                  if (event.results[i].isFinal) {
                                    const transcript = event.results[i][0].transcript;
                                    setEntry((prev) => prev ? prev + " " + transcript : transcript);
                                    const detected = autoSelectFromText(transcript);
                                    if (detected > 0) {
                                      showToast(`Auto-detected ${detected} feeling${detected !== 1 ? "s" : ""} from your voice entry.`);
                                    }
                                  }
                                }
                              };
                              recognition.onerror = () => { /* handled by onend */ };
                              recognition.onend = () => {
                                // Auto-restart if user hasn't explicitly stopped
                                if (micIntentRef.current && micRecognitionRef.current) {
                                  try { recognition.start(); return; } catch { /* fall through */ }
                                }
                                setMicListening(false);
                                micRecognitionRef.current = null;
                              };
                              micIntentRef.current = true;
                              micRecognitionRef.current = recognition;
                              recognition.start();
                              setMicListening(true);
                            } catch { /* ignore */ }
                          }}
                          title={micListening ? "Stop recording" : "Use voice input"}
                          style={{
                            position: "absolute", right: 12, bottom: 12,
                            width: 36, height: 36, borderRadius: "50%",
                            border: "none",
                            backgroundColor: micListening ? colors.error : colors.bgElevated,
                            color: micListening ? colors.textPrimary : colors.textMuted,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: micListening ? `0 0 16px ${colors.errorWash}` : "none",
                            transition: "all 0.2s",
                          }}
                        >
                          {micListening ? (
                            <svg width={14} height={14} viewBox="0 0 24 24" fill={colors.textPrimary}>
                              <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                          ) : (
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                              <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: body }}>
                        {entry.length > 0 ? `${wordCount} words` : ""}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* ──────── STEP 2: What are you feeling? ──────── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                        What are you feeling?
                      </p>
                      <p style={{ fontFamily: body, fontSize: 12, color: colors.textSecondary, margin: "4px 0 0 0" }}>
                        Tap the wheel to name your emotions and their intensity.
                      </p>
                    </div>
                    <NVCEmotionWheel
                      selected={selectedEmotions}
                      onSelect={(emotion, intensity) => toggleEmotion(emotion, intensity)}
                    />
                  </motion.div>
                )}

                {/* ──────── STEP 3: What do you need? ──────── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                        What do you need?
                      </p>
                      <p style={{ fontFamily: body, fontSize: 12, color: colors.textSecondary, margin: "4px 0 0 0" }}>
                        Identify the unmet needs beneath your feelings.
                      </p>
                    </div>
                    <NeedsPicker
                      categories={NEEDS}
                      selected={checkedNeeds}
                      onToggle={toggleNeed}
                      maxSelections={4}
                    />
                  </motion.div>
                )}

                {/* ──────── STEP 4: Body + Nervous System ──────── */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                        Where do you feel it?
                      </p>
                      <p style={{ fontFamily: body, fontSize: 12, color: colors.textSecondary, margin: "4px 0 0 0" }}>
                        Tap body zones to mark sensations.
                      </p>
                    </div>

                    {/* Improvement #4: somatic suggestion banner */}
                    {somaticSuggestions.length > 0 && (
                      <div style={{
                        padding: `${space[2]}px ${space[3]}px`,
                        backgroundColor: colors.bgRecessed,
                        borderRadius: radii.sm,
                        border: `1px solid ${colors.borderSubtle}`,
                        marginBottom: space[3],
                      }}>
                        <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0 }}>
                          Based on what you&apos;re feeling, you might notice{" "}
                          {somaticSuggestions.map((s, i) => (
                            <span key={s}>
                              <strong style={{ color: colors.coral }}>{s}</strong>
                              {i < somaticSuggestions.length - 1 ? " or " : ""}
                            </span>
                          ))}{" "}
                          sensations.
                        </p>
                      </div>
                    )}

                    <BodyMap markers={bodyMarkers} onChange={setBodyMarkers} />

                    {/* Nervous System slider */}
                    <div style={{ marginTop: 28, marginBottom: 14 }}>
                      <p style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                        Where is your nervous system?
                      </p>
                      <p style={{ fontFamily: body, fontSize: 12, color: colors.textSecondary, margin: "4px 0 0 0" }}>
                        Drag the slider to where you are right now.
                      </p>
                    </div>

                    <ZonedSpectrum
                      zones={WINDOW_ZONES}
                      value={nervousSystemValue}
                      onChange={setNervousSystemValue}
                      leftLabel="Shutdown"
                      rightLabel="Overwhelm"
                    />

                    {/* Improvement #3: Sparkline */}
                    <NervousSystemSparkline entries={historyEntries.map((e) => ({ nervousSystem: e.nervousSystem, date: e.date }))} />

                    {/* Improvement #5: Week comparison */}
                    {weekComparison && (
                      <WeekComparisonCard weekComparison={weekComparison} />
                    )}
                  </motion.div>
                )}

                {/* ──────── STEP 5: Save + Results ──────── */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <p style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: colors.textPrimary, margin: 0 }}>
                        Ready to save?
                      </p>
                      <p style={{ fontFamily: body, fontSize: 12, color: colors.textSecondary, margin: "4px 0 0 0" }}>
                        Review what you&apos;ve checked in with.
                      </p>
                    </div>

                    {/* Summary of what's been captured */}
                    <div style={{
                      backgroundColor: colors.bgSurface,
                      borderRadius: radii.md,
                      border: `1px solid ${colors.borderDefault}`,
                      padding: `${space[3]}px ${space[4]}px`,
                      marginBottom: space[4],
                    }}>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {wordCount > 0 && (
                          <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: colors.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                            {wordCount} words
                          </span>
                        )}
                        {selectedEmotions.length > 0 && (
                          <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: colors.coral, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                            {selectedEmotions.length} emotion{selectedEmotions.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {checkedNeeds.size > 0 && (
                          <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: colors.coral, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.coral, display: "inline-block" }} />
                            {checkedNeeds.size} need{checkedNeeds.size !== 1 ? "s" : ""}
                          </span>
                        )}
                        {bodyMarkers.length > 0 && (
                          <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: colors.warning, display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: colors.warning, display: "inline-block" }} />
                            {bodyMarkers.length} body zone{bodyMarkers.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        {(() => {
                          const zone = currentZone();
                          return zone ? (
                            <span style={{ fontSize: 12, fontFamily: body, fontWeight: 600, color: zone.color, display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: zone.color, display: "inline-block" }} />
                              {zone.label}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <PillButton onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save entry"}
                      </PillButton>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            marginTop: 18, padding: "12px 18px",
                            backgroundColor: colors.errorWash,
                            border: `1px solid ${colors.error}`,
                            borderRadius: 12, color: colors.error,
                            fontSize: 14, fontFamily: body,
                          }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Step Navigation ── */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: space[5], paddingTop: space[3],
                borderTop: `1px solid ${colors.borderSubtle}`,
              }}>
                {step > 1 ? (
                  <button
                    onClick={goBack}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontFamily: display, fontSize: 13, color: colors.textMuted,
                      padding: "6px 0",
                    }}
                  >
                    &larr; Back
                  </button>
                ) : (
                  <span />
                )}

                {step < TOTAL_STEPS ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                      onClick={skipStep}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: display, fontSize: 12, color: colors.textMuted,
                        padding: "6px 0",
                      }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={goNext}
                      style={{
                        padding: "8px 24px",
                        fontSize: 13, fontWeight: 600, fontFamily: display,
                        borderRadius: radii.full, cursor: "pointer",
                        border: "none",
                        backgroundColor: colors.coral,
                        color: colors.bgDeep,
                      }}
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <span />
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ──────── SAVED PHASE ──────── */
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "48px 24px",
              backgroundColor: colors.bgSurface,
              borderRadius: 16,
              border: `1px solid ${colors.coral}`,
            }}
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.coral}, ${colors.coral})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2.5} strokeLinecap="round">
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </svg>
            </motion.div>

            {/* Improvement #2: AI mirror sentence */}
            {mirrorText && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{
                  fontSize: 16, fontWeight: 500, fontFamily: fonts.serif,
                  color: colors.textPrimary, margin: "0 0 24px 0",
                  textAlign: "center", fontStyle: "italic",
                  lineHeight: 1.6, maxWidth: 420,
                }}
              >
                {mirrorText}
              </motion.p>
            )}

            {/* Stats */}
            <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {savedStats.words > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>{savedStats.words}</p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>words</p>
                </motion.div>
              )}
              {savedStats.emotions > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>{savedStats.emotions}</p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>emotions</p>
                </motion.div>
              )}
              {savedStats.needs > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.coral, margin: 0 }}>{savedStats.needs}</p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>needs</p>
                </motion.div>
              )}
              {savedStats.bodyZones > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: display, color: colors.warning, margin: 0 }}>{savedStats.bodyZones}</p>
                  <p style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, margin: 0, letterSpacing: "0.04em" }}>body zones</p>
                </motion.div>
              )}
            </div>

            {/* Motivational line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: 16, fontWeight: 600, fontFamily: display,
                color: colors.textPrimary, margin: "0 0 24px 0",
                letterSpacing: "-0.01em",
              }}
            >
              Noticed. Named. Grounded.
            </motion.p>

            {/* Write another */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWriteAnother}
              style={{
                padding: "10px 28px", fontSize: 13, fontWeight: 600,
                fontFamily: display, borderRadius: 100, cursor: "pointer",
                border: `1px solid ${colors.borderDefault}`,
                backgroundColor: "transparent", color: colors.textSecondary,
              }}
            >
              Write another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reset exercises (Improvement #6: auto-expand if activated/shutdown) ── */}
      <ResetExercisesV2
        nervousSystemValue={nervousSystemValue}
        onNervousSystemChange={setNervousSystemValue}
      />

      {/* ── Attribution ── */}
      <FadeIn preset="fade" delay={0.4} triggerOnMount>
        <div style={{
          marginTop: 40, paddingTop: 32,
          borderTop: `1px solid ${colors.borderSubtle}`,
          textAlign: "center",
          maxWidth: 500, marginLeft: "auto", marginRight: "auto",
        }}>
          <p style={{
            fontSize: 12, color: colors.textMuted, fontFamily: body,
            lineHeight: 1.6, margin: 0,
          }}>
            Feelings and Needs inventories adapted from the work of Marshall B. Rosenberg and practitioners at the Center for Nonviolent Communication (CNVC). Used with gratitude.
          </p>
        </div>
      </FadeIn>

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </PageShell>
  );
}
