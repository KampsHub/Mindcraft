"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, space, radii } from "@/lib/theme";
import BreathingCircle from "./BreathingCircle";
import ZonedSpectrum from "@/components/exercises/primitives/ZonedSpectrum";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── NS Window Zones (same as page.tsx) ── */
const WINDOW_ZONES = [
  { id: "hypo", label: "Shutdown", fromPercent: 0, toPercent: 25, color: colors.plum, guidance: "Dorsal vagal state — your nervous system has pulled the emergency brake. You may feel numb, foggy, flat, or unable to think clearly." },
  { id: "window", label: "Window of Tolerance", fromPercent: 25, toPercent: 65, color: colors.success, guidance: "Ventral vagal state — you're regulated. You can think, feel, and connect without being hijacked by either extreme." },
  { id: "activated", label: "Activated", fromPercent: 65, toPercent: 85, color: colors.warning, guidance: "Sympathetic activation — your nervous system is ramping up. Heart rate elevated, thoughts may race or loop." },
  { id: "hyper", label: "Fight or Flight", fromPercent: 85, toPercent: 100, color: colors.error, guidance: "Full sympathetic flood — your body is in survival mode. Rational thinking is offline." },
];

function findZone(v: number) {
  return WINDOW_ZONES.find((z) => v >= z.fromPercent && v < z.toPercent)
    ?? WINDOW_ZONES.find((z) => v === z.toPercent && z.toPercent === 100);
}

/* ── Category colors ── */
const CATEGORY_COLORS: Record<string, string> = {
  FAST: colors.coral,
  CALM: colors.success,
  GROUND: colors.plum,
};

/* ── Exercise data ── */
interface ExerciseData {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "FAST" | "CALM" | "GROUND";
  icon: React.ReactNode;
}

/* ── SVG Icons (28x28, simple paths) ── */
function LungsIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M14 4v10" stroke={colors.textPrimary} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 14c-3 0-5 2-6 5s-1 5 1 5h5" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M14 14c3 0 5 2 6 5s1 5-1 5h-5" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M10 14V8a1.5 1.5 0 013 0v6" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 12V7a1.5 1.5 0 013 0v7" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 13V9a1.5 1.5 0 013 0v5" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 14v-2a1.5 1.5 0 013 0v4c0 4-3 8-8 8H13c-3 0-5-2-5-5v-3a1.5 1.5 0 013 0v2" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FeetIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <ellipse cx="10" cy="12" rx="4" ry="6" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="5" r="1.5" fill={colors.textPrimary} opacity="0.6" />
      <ellipse cx="18" cy="12" rx="4" ry="6" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="5" r="1.5" fill={colors.textPrimary} opacity="0.6" />
      <path d="M6 22h16" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M14 24s-8-5-8-11a5 5 0 0110 0 5 5 0 0110 0c0 6-8 11-8 11h-4z" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowsLRIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M4 14h20" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 10l-4 4 4 4" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 10l4 4-4 4" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function SnowflakeIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M14 3v22M3 14h22M7 7l14 14M21 7L7 21" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" fill={colors.textPrimary} opacity="0.3" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M3 14c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M3 20c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <path d="M2 14s4-7 12-7 12 7 12 7-4 7-12 7S2 14 2 14z" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="14" r="3" stroke={colors.textPrimary} strokeWidth="1.5" fill="none" />
      <circle cx="14" cy="14" r="1" fill={colors.textPrimary} />
    </svg>
  );
}

/* ── Exercise definitions ── */
const EXERCISES: ExerciseData[] = [
  { id: "breathing", title: "Box Breathing", description: "4 sec in · 4 hold · 4 out · 4 hold. Activates parasympathetic response.", duration: "4min", category: "CALM", icon: <LungsIcon /> },
  { id: "grounding", title: "5-4-3-2-1 Grounding", description: "Anchor attention to present sensory reality through five senses.", duration: "2min", category: "GROUND", icon: <HandIcon /> },
  { id: "somatic", title: "Somatic Grounding", description: "Feet on floor, feel the ground push back. Slow breaths.", duration: "1min", category: "GROUND", icon: <FeetIcon /> },
  { id: "relational", title: "Relational Grounding", description: "Picture one person whose presence settles your nervous system.", duration: "2min", category: "CALM", icon: <HeartIcon /> },
  { id: "bilateral", title: "Bilateral Stimulation", description: "Alternate tapping knees left-right for 60 seconds. EMDR mechanism.", duration: "60s", category: "FAST", icon: <ArrowsLRIcon /> },
  { id: "cold", title: "Cold Water Reset", description: "Cold water on wrists for 30 seconds. Dive reflex activates vagus nerve.", duration: "30s", category: "FAST", icon: <SnowflakeIcon /> },
  { id: "humming", title: "Vagal Toning", description: "Hum a low note for 10 seconds, repeat 5 times. Vagus nerve stimulation.", duration: "60s", category: "CALM", icon: <WaveIcon /> },
  { id: "orienting", title: "Orienting Response", description: "Slowly look around the room. Primal safety signal to your NS.", duration: "1min", category: "GROUND", icon: <EyeIcon /> },
];

/* ── NS-based ordering ── */
function getOrderedExercises(nsValue: number): ExerciseData[] {
  const orderMap: Record<string, number> = {};
  let orderedIds: string[];

  if (nsValue > 75) {
    orderedIds = ["cold", "bilateral", "breathing", "humming", "somatic", "grounding", "orienting", "relational"];
  } else if (nsValue > 65) {
    orderedIds = ["bilateral", "cold", "breathing", "somatic", "humming", "grounding", "orienting", "relational"];
  } else if (nsValue < 25) {
    orderedIds = ["somatic", "orienting", "humming", "relational", "grounding", "breathing", "bilateral", "cold"];
  } else {
    return EXERCISES;
  }

  orderedIds.forEach((id, i) => { orderMap[id] = i; });
  return [...EXERCISES].sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99));
}

function getRecommendedIds(nsValue: number): Set<string> {
  const ordered = getOrderedExercises(nsValue);
  return new Set([ordered[0].id, ordered[1].id]);
}

/* ── Props ── */
interface ResetExercisesV2Props {
  nervousSystemValue: number;
  onNervousSystemChange?: (value: number) => void;
}

/* ═══════════════════════════════════════════════════════════════
   Individual Exercise Pacers
   ═══════════════════════════════════════════════════════════════ */

/* ── Grounding 5-4-3-2-1 Pacer ── */
function GroundingPacer({ onComplete }: { onComplete: () => void }) {
  const senses = [
    { count: 5, sense: "SEE", prompt: "Look around slowly. Name 5 things you can see right now." },
    { count: 4, sense: "HEAR", prompt: "Listen closely — even to the quiet sounds. Name 4 things you hear." },
    { count: 3, sense: "TOUCH", prompt: "Reach out. Feel their texture. Name 3 things you can touch." },
    { count: 2, sense: "SMELL", prompt: "Breathe in gently. Name 2 things you smell." },
    { count: 1, sense: "TASTE", prompt: "Notice what's present in your mouth. Name 1 thing you taste." },
  ];

  const [step, setStep] = useState(0);

  function handleNext() {
    if (step < senses.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  }

  const current = senses[step];

  return (
    <div style={{ padding: space[4], textAlign: "center" }}>
      <div style={{ fontFamily: display, fontSize: 48, fontWeight: 700, color: colors.coral, marginBottom: space[2] }}>
        {current.count}
      </div>
      <div style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: space[3], textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Things you {current.sense}
      </div>
      <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, margin: `0 0 ${space[5]}px 0`, lineHeight: 1.6 }}>
        {current.prompt}
      </p>
      <div style={{ display: "flex", gap: space[2], justifyContent: "center", marginBottom: space[4] }}>
        {senses.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: radii.full,
            backgroundColor: i <= step ? colors.coral : colors.bgElevated,
            transition: "background-color 0.3s",
          }} />
        ))}
      </div>
      <button onClick={handleNext} style={{
        padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
        borderRadius: radii.full, border: "none",
        backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
      }}>
        {step < senses.length - 1 ? `Next sense \u2192` : "Done"}
      </button>
    </div>
  );
}

/* ── Bilateral Stimulation Pacer ── */
function BilateralPacer({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [side, setSide] = useState<"left" | "right">("left");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setActive(true);
    setTimeLeft(60);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (sideRef.current) clearInterval(sideRef.current);
          onComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    sideRef.current = setInterval(() => {
      setSide((s) => s === "left" ? "right" : "left");
    }, 500); // 1Hz = alternate every 500ms
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (sideRef.current) clearInterval(sideRef.current);
    };
  }, []);

  if (!active) {
    return (
      <div style={{ padding: space[4], textAlign: "center" }}>
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, margin: `0 0 ${space[4]}px 0` }}>
          Sit comfortably. Place your hands on your knees. Tap left-right, following the visual pacer.
        </p>
        <button onClick={start} style={{
          padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
          borderRadius: radii.full, border: "none",
          backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
        }}>
          Start
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: space[4], textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, marginBottom: space[5] }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          backgroundColor: side === "left" ? colors.coral : colors.bgElevated,
          border: `2px solid ${side === "left" ? colors.coral : colors.borderDefault}`,
          transition: "all 0.15s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: side === "left" ? colors.bgDeep : colors.textMuted }}>L</span>
        </div>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          backgroundColor: side === "right" ? colors.coral : colors.bgElevated,
          border: `2px solid ${side === "right" ? colors.coral : colors.borderDefault}`,
          transition: "all 0.15s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: side === "right" ? colors.bgDeep : colors.textMuted }}>R</span>
        </div>
      </div>
      <div style={{ fontFamily: display, fontSize: 32, fontWeight: 700, color: colors.textPrimary, marginBottom: space[2] }}>
        {timeLeft}s
      </div>
      <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0 }}>
        Follow the rhythm with your hands
      </p>
    </div>
  );
}

/* ── Cold Water Reset Pacer ── */
function ColdWaterPacer({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setActive(true);
    setTimeLeft(30);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [onComplete]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const progress = active ? (30 - timeLeft) / 30 : 0;
  const circumference = 2 * Math.PI * 55;
  const strokeDashoffset = circumference * (1 - progress);

  if (!active) {
    return (
      <div style={{ padding: space[4], textAlign: "center" }}>
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, margin: `0 0 ${space[4]}px 0` }}>
          Go to a sink. Turn the water to cold. Run it over your wrists or splash your face.
        </p>
        <button onClick={start} style={{
          padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
          borderRadius: radii.full, border: "none",
          backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
        }}>
          Start 30s Timer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: space[4], textAlign: "center" }}>
      <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto", marginBottom: space[4] }}>
        <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="65" cy="65" r="55" stroke={colors.bgElevated} strokeWidth="6" fill="none" />
          <circle cx="65" cy="65" r="55"
            stroke={colors.plumLight}
            strokeWidth="6" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontFamily: display, fontSize: 32, fontWeight: 700, color: colors.textPrimary,
        }}>
          {timeLeft}
        </div>
      </div>
      <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0 }}>
        Cold water on your wrists
      </p>
    </div>
  );
}

/* ── Humming / Vagal Toning Pacer ── */
function HummingPacer({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState(false);
  const [rep, setRep] = useState(1);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const CYCLE_DURATION = 10000; // 10 sec per rep
  const TOTAL_REPS = 5;

  const start = useCallback(() => {
    setActive(true);
    setRep(1);
    setProgress(0);
    startRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / CYCLE_DURATION, 1);
      setProgress(p);

      if (p >= 1) {
        setRep((r) => {
          if (r >= TOTAL_REPS) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onComplete();
            return r;
          }
          startRef.current = Date.now();
          setProgress(0);
          return r + 1;
        });
      }
    }, 50);
  }, [onComplete]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  if (!active) {
    return (
      <div style={{ padding: space[4], textAlign: "center" }}>
        <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, margin: `0 0 ${space[4]}px 0` }}>
          Take a deep breath in, then hum a low steady note as you exhale. 10 seconds per hum, 5 reps.
        </p>
        <button onClick={start} style={{
          padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
          borderRadius: radii.full, border: "none",
          backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
        }}>
          Start
        </button>
      </div>
    );
  }

  // Expanding circle: scale from 0.5 to 1.0 based on progress (breathe out = expand)
  const scale = 0.5 + 0.5 * progress;

  return (
    <div style={{ padding: space[4], textAlign: "center" }}>
      <div style={{ width: 120, height: 120, margin: "0 auto", marginBottom: space[3], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          backgroundColor: `${colors.success}22`,
          border: `2px solid ${colors.success}`,
          transform: `scale(${scale})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column",
        }}>
          <span style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
            Hummm
          </span>
        </div>
      </div>
      <div style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textSecondary, marginBottom: space[2] }}>
        Rep {rep} of {TOTAL_REPS}
      </div>
      <div style={{
        width: "100%", height: 4, backgroundColor: colors.bgElevated, borderRadius: radii.full,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${progress * 100}%`, height: "100%",
          backgroundColor: colors.success, borderRadius: radii.full,
          transition: "width 0.1s linear",
        }} />
      </div>
    </div>
  );
}

/* ── Guided Flow Pacer (for somatic, relational, orienting) ── */
function GuidedFlowPacer({
  steps,
  timedSteps,
  onComplete,
}: {
  steps: { instruction: string; countdown?: number }[];
  timedSteps?: Record<number, number>; // step index -> seconds for breathing timer
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const cd = steps[step]?.countdown;
    if (cd && cd > 0) {
      setCountdown(cd);
      intervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c !== null && c <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return c !== null ? c - 1 : null;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [step, steps]);

  // Also handle timed steps (breathing timer)
  const [breathTimer, setBreathTimer] = useState<number | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timedSteps && timedSteps[step] !== undefined) {
      setBreathTimer(timedSteps[step]);
      breathRef.current = setInterval(() => {
        setBreathTimer((t) => {
          if (t !== null && t <= 1) {
            if (breathRef.current) clearInterval(breathRef.current);
            return 0;
          }
          return t !== null ? t - 1 : null;
        });
      }, 1000);
    } else {
      setBreathTimer(null);
    }
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [step, timedSteps]);

  function handleNext() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  }

  const current = steps[step];

  return (
    <div style={{ padding: space[4], textAlign: "center" }}>
      <div style={{ display: "flex", gap: space[1], justifyContent: "center", marginBottom: space[4] }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: radii.full, maxWidth: 40,
            backgroundColor: i <= step ? colors.coral : colors.bgElevated,
            transition: "background-color 0.3s",
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: body, fontSize: 15, color: colors.textPrimary,
        margin: `0 0 ${space[4]}px 0`, lineHeight: 1.7, minHeight: 60,
      }}>
        {current.instruction}
      </p>
      {countdown !== null && countdown > 0 && (
        <div style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.coral, marginBottom: space[3] }}>
          {countdown}
        </div>
      )}
      {breathTimer !== null && breathTimer > 0 && (
        <div style={{ marginBottom: space[3] }}>
          <div style={{ fontFamily: display, fontSize: 20, fontWeight: 600, color: colors.plumLight, marginBottom: space[1] }}>
            {breathTimer}s
          </div>
          <p style={{ fontFamily: body, fontSize: 11, color: colors.textMuted, margin: 0 }}>
            Breathe slowly
          </p>
        </div>
      )}
      <button onClick={handleNext} style={{
        padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
        borderRadius: radii.full, border: "none",
        backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
      }}>
        {step < steps.length - 1 ? `Next step \u2192` : "Done"}
      </button>
    </div>
  );
}

/* ── Orienting Pacer (with countdowns) ── */
function OrientingPacer({ onComplete }: { onComplete: () => void }) {
  return (
    <GuidedFlowPacer
      steps={[
        { instruction: "Slowly turn your head to the left. Let your eyes land on something. Really look at it \u2014 color, shape, texture.", countdown: 3 },
        { instruction: "Now slowly turn to the right. Let your eyes settle on something that catches your attention.", countdown: 3 },
        { instruction: "Look up. Look down. Take your time. You\u2019re activating your orienting reflex \u2014 a primal signal that says \u2018I am safe enough to look around.\u2019", countdown: 3 },
        { instruction: "Notice if your breathing has changed. Your shoulders may have dropped. This is regulation happening without you forcing it." },
      ]}
      onComplete={onComplete}
    />
  );
}

/* ── Somatic Grounding Pacer ── */
function SomaticPacer({ onComplete }: { onComplete: () => void }) {
  return (
    <GuidedFlowPacer
      steps={[
        { instruction: "Place both feet flat on the floor. Notice the contact." },
        { instruction: "Press down gently. Feel the ground pressing back." },
        { instruction: "Three slow breaths. Let each exhale be longer than the inhale." },
        { instruction: "Notice one sensation in your body \u2014 without trying to change it." },
      ]}
      timedSteps={{ 2: 12 }}
      onComplete={onComplete}
    />
  );
}

/* ── Relational Grounding Pacer ── */
function RelationalPacer({ onComplete }: { onComplete: () => void }) {
  return (
    <GuidedFlowPacer
      steps={[
        { instruction: "Think of one person whose presence settles your nervous system. Someone safe." },
        { instruction: "Picture their face. Let the image become clear." },
        { instruction: "Imagine what they would say to you right now. Hear their voice." },
        { instruction: "Let yourself feel the warmth of that connection \u2014 even though they\u2019re not here. Your nervous system can\u2019t tell the difference." },
      ]}
      onComplete={onComplete}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   NS Re-Check Panel
   ═══════════════════════════════════════════════════════════════ */

function NSReCheck({
  beforeValue,
  onDone,
  onNervousSystemChange,
}: {
  beforeValue: number;
  onDone: (newValue: number) => void;
  onNervousSystemChange?: (value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(beforeValue);

  const beforeZone = findZone(beforeValue);
  const afterZone = findZone(localValue);
  const diff = beforeValue - localValue;
  const improved = diff > 0;

  function handleChange(v: number) {
    setLocalValue(v);
  }

  function handleDone() {
    onNervousSystemChange?.(localValue);
    onDone(localValue);
  }

  return (
    <div style={{ padding: space[4] }}>
      <p style={{
        fontFamily: display, fontSize: 15, fontWeight: 600,
        color: colors.textPrimary, textAlign: "center", margin: `0 0 ${space[4]}px 0`,
      }}>
        How does your nervous system feel now?
      </p>

      <ZonedSpectrum
        zones={WINDOW_ZONES}
        value={localValue}
        onChange={handleChange}
        leftLabel="Shutdown"
        rightLabel="Fight/Flight"
      />

      {localValue !== beforeValue && (
        <div style={{
          marginTop: space[4], padding: space[3],
          backgroundColor: improved ? colors.successWash : colors.warningWash,
          borderRadius: radii.sm, textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: space[2],
        }}>
          {improved && (
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="9" fill={colors.success} />
              <path d="M5 9l3 3 5-5" stroke={colors.bgDeep} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary }}>
            You shifted from <strong>{beforeZone?.label ?? "Unknown"}</strong> to <strong>{afterZone?.label ?? "Unknown"}</strong>.
            That&apos;s a {Math.abs(diff)}-point {improved ? "drop" : "increase"}.
          </span>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: space[4] }}>
        <button onClick={handleDone} style={{
          padding: "10px 28px", fontSize: 13, fontWeight: 600, fontFamily: display,
          borderRadius: radii.full, border: "none",
          backgroundColor: colors.coral, color: colors.bgDeep, cursor: "pointer",
        }}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Component: ResetExercisesV2
   ═══════════════════════════════════════════════════════════════ */

export default function ResetExercisesV2({ nervousSystemValue, onNervousSystemChange }: ResetExercisesV2Props) {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [exercisePhase, setExercisePhase] = useState<"pacer" | "recheck">("pacer");
  const [beforeNS, setBeforeNS] = useState(nervousSystemValue);
  const [showGrid, setShowGrid] = useState(nervousSystemValue <= 85);
  const [localNS, setLocalNS] = useState(nervousSystemValue);

  // Update local NS when prop changes
  useEffect(() => {
    setLocalNS(nervousSystemValue);
    if (nervousSystemValue <= 85) setShowGrid(true);
  }, [nervousSystemValue]);

  const isEmergency = localNS > 85 && !showGrid;

  const orderedExercises = getOrderedExercises(localNS);
  const recommendedIds = getRecommendedIds(localNS);

  function handleOpenExercise(id: string) {
    setBeforeNS(localNS);
    setActiveExercise(id);
    setExercisePhase("pacer");
  }

  function handleExerciseComplete() {
    setExercisePhase("recheck");
  }

  function handleRecheckDone(newValue: number) {
    setLocalNS(newValue);
    onNervousSystemChange?.(newValue);
    setActiveExercise(null);
    setExercisePhase("pacer");
    if (newValue <= 85) setShowGrid(true);
  }

  function handleDoneWithoutRecheck() {
    setExercisePhase("recheck");
  }

  /* ── Exercise Pacer Renderer ── */
  function renderPacer(exerciseId: string) {
    switch (exerciseId) {
      case "breathing":
        return (
          <div>
            <BreathingCircle />
            <div style={{ textAlign: "center", marginTop: space[3] }}>
              <button onClick={handleDoneWithoutRecheck} style={{
                padding: "8px 20px", fontSize: 12, fontWeight: 600, fontFamily: display,
                borderRadius: radii.full, border: `1px solid ${colors.borderDefault}`,
                backgroundColor: "transparent", color: colors.textSecondary, cursor: "pointer",
              }}>
                I&apos;m done
              </button>
            </div>
          </div>
        );
      case "grounding":
        return <GroundingPacer onComplete={handleExerciseComplete} />;
      case "bilateral":
        return <BilateralPacer onComplete={handleExerciseComplete} />;
      case "cold":
        return <ColdWaterPacer onComplete={handleExerciseComplete} />;
      case "humming":
        return <HummingPacer onComplete={handleExerciseComplete} />;
      case "somatic":
        return <SomaticPacer onComplete={handleExerciseComplete} />;
      case "relational":
        return <RelationalPacer onComplete={handleExerciseComplete} />;
      case "orienting":
        return <OrientingPacer onComplete={handleExerciseComplete} />;
      default:
        return null;
    }
  }

  /* ── Emergency Mode ── */
  if (isEmergency) {
    const topExercise = orderedExercises[0];
    return (
      <div style={{ marginTop: space[7] }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: space[5],
            backgroundColor: colors.errorWash,
            border: `1px solid ${colors.error}`,
            borderRadius: radii.lg,
          }}
        >
          <p style={{
            fontFamily: display, fontSize: 16, fontWeight: 700,
            color: colors.error, margin: `0 0 ${space[2]}px 0`, textAlign: "center",
          }}>
            Your nervous system needs help right now.
          </p>
          <p style={{
            fontFamily: body, fontSize: 13, color: colors.textSecondary,
            margin: `0 0 ${space[5]}px 0`, textAlign: "center",
          }}>
            {topExercise.description}
          </p>

          <AnimatePresence mode="wait">
            {activeExercise === topExercise.id ? (
              <motion.div
                key="active-emergency"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                {exercisePhase === "pacer"
                  ? renderPacer(topExercise.id)
                  : <NSReCheck beforeValue={beforeNS} onDone={handleRecheckDone} onNervousSystemChange={onNervousSystemChange} />
                }
              </motion.div>
            ) : (
              <motion.div key="start-btn" style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", margin: "0 auto",
                  marginBottom: space[3], display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`,
                }}>
                  {topExercise.icon}
                </div>
                <p style={{ fontFamily: display, fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: `0 0 ${space[4]}px 0` }}>
                  {topExercise.title}
                </p>
                <button
                  onClick={() => handleOpenExercise(topExercise.id)}
                  style={{
                    padding: "14px 40px", fontSize: 15, fontWeight: 700, fontFamily: display,
                    borderRadius: radii.full, border: "none",
                    backgroundColor: colors.error, color: colors.textPrimary, cursor: "pointer",
                  }}
                >
                  Start
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ textAlign: "center", marginTop: space[4] }}>
            <button
              onClick={() => setShowGrid(true)}
              style={{
                fontSize: 12, color: colors.textMuted, backgroundColor: "transparent",
                border: "none", cursor: "pointer", textDecoration: "underline",
                fontFamily: body,
              }}
            >
              Show all exercises
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Normal Grid Mode ── */
  return (
    <div style={{ marginTop: space[7] }}>
      <p style={{
        fontFamily: display, fontSize: 12, fontWeight: 600,
        color: colors.textMuted, margin: `0 0 ${space[3]}px 0`,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        Quick Reset Exercises
      </p>

      {/* Card Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: space[2],
      }}>
        {orderedExercises.map((ex, index) => {
          const isRecommended = recommendedIds.has(ex.id);
          const isActive = activeExercise === ex.id;
          const categoryColor = CATEGORY_COLORS[ex.category];

          return (
            <motion.button
              key={ex.id}
              layoutId={`card-${ex.id}`}
              onClick={() => {
                if (isActive) {
                  setActiveExercise(null);
                  setExercisePhase("pacer");
                } else {
                  handleOpenExercise(ex.id);
                }
              }}
              animate={isRecommended && !isActive ? {
                borderColor: [colors.borderSubtle, colors.coral, colors.borderSubtle],
              } : {}}
              transition={isRecommended && !isActive ? {
                borderColor: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              } : { layout: { type: "spring", stiffness: 300, damping: 30 } }}
              style={{
                position: "relative",
                padding: `${space[3]}px`,
                backgroundColor: isActive ? colors.bgRecessed : colors.bgSurface,
                border: `1px solid ${isActive ? colors.coral : colors.borderSubtle}`,
                borderRadius: radii.md,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: space[1],
                minHeight: 90,
              }}
            >
              {/* Duration badge */}
              <span style={{
                position: "absolute", top: 6, right: 6,
                padding: "2px 6px",
                backgroundColor: colors.bgElevated,
                borderRadius: radii.full,
                fontFamily: display, fontSize: 9, fontWeight: 600,
                color: colors.textMuted,
              }}>
                {ex.duration}
              </span>

              {/* Icon */}
              <div style={{ marginBottom: 2 }}>
                {ex.icon}
              </div>

              {/* Title */}
              <span style={{
                fontFamily: display, fontSize: 13, fontWeight: 700,
                color: colors.textPrimary, lineHeight: 1.2,
                paddingRight: 30,
              }}>
                {ex.title}
              </span>

              {/* Category tag */}
              <span style={{
                fontFamily: display, fontSize: 9, fontWeight: 600,
                color: categoryColor,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {ex.category}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Exercise Panel */}
      <AnimatePresence>
        {activeExercise && (
          <motion.div
            key={`panel-${activeExercise}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              overflow: "hidden",
              marginTop: space[2],
              backgroundColor: colors.bgSurface,
              border: `1px solid ${colors.borderSubtle}`,
              borderRadius: radii.md,
            }}
          >
            {/* Panel header */}
            <div style={{
              padding: `${space[3]}px ${space[4]}px`,
              borderBottom: `1px solid ${colors.borderSubtle}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: display, fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                {EXERCISES.find((e) => e.id === activeExercise)?.title}
              </span>
              <button
                onClick={() => { setActiveExercise(null); setExercisePhase("pacer"); }}
                style={{
                  width: 28, height: 28, borderRadius: radii.full,
                  backgroundColor: colors.bgElevated, border: "none",
                  color: colors.textMuted, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontFamily: display,
                }}
              >
                &times;
              </button>
            </div>

            {/* Pacer or Re-check */}
            {exercisePhase === "pacer"
              ? renderPacer(activeExercise)
              : <NSReCheck beforeValue={beforeNS} onDone={handleRecheckDone} onNervousSystemChange={onNervousSystemChange} />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
