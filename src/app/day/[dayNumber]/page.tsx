"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/PageShell";
import DailyStep from "@/components/DailyStep";
import ExerciseCard from "@/components/ExerciseCard";
import FreeFlowCapture from "@/components/FreeFlowCapture";
import FadeIn from "@/components/FadeIn";
import CrisisBanner from "@/components/CrisisBanner";
import CommitmentCheckIn, { type CommitmentCheckInItem } from "@/components/CommitmentCheckIn";
import ForTomorrowCard from "@/components/ForTomorrowCard";
import ActivePatternChallenge, { type PatternChallengeData } from "@/components/ActivePatternChallenge";
import { colors, fonts } from "@/lib/theme";
import FlagButton from "@/components/FlagButton";
import VoiceCoach from "@/components/VoiceCoach";
import ChatCoach from "@/components/ChatCoach";
import ViewModeToggle from "@/components/ViewModeToggle";

/* ── Design tokens ── */
const display = fonts.display;
const body = fonts.bodyAlt;

// ── Types ──

interface ProgramDay {
  id: string;
  day_number: number;
  week_number: number;
  title: string;
  territory: string;
  seed_prompts: { prompt: string; purpose: string; context?: string }[];
  coaching_exercises: { name: string; duration_min: number; custom_framing: string }[];
  overflow_defaults: { name: string; originator: string; source: string; modality: string; duration_min: number }[];
  micro_content: string;
  system_notes: string;
  is_onboarding: boolean;
}

interface Enrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  programs: { name: string; slug: string };
}

interface DailySession {
  id: string;
  enrollment_id: string;
  day_number: number;
  step_2_journal: string;
  step_1_themes: Record<string, unknown>;
  step_3_analysis: Record<string, unknown>;
  step_5_summary: Record<string, unknown>;
  completed_steps: number[];
  day_rating: number | null;
  day_feedback: string | null;
  completed_at: string | null;
}

interface ThemesResult {
  thread?: string;
  themes: string[];
  summary: string;
  personal_prompt?: { prompt: string; context: string };
  follow_up?: {
    commitments: string[];
    coaching_questions: string[];
    highlight: string;
  };
  patterns: { observation: string; days_observed: number; connection: string }[];
  carry_forward: string;
  // Commitment tracking data (passthrough from API)
  yesterday_commitments?: string[];
  yesterday_committed_actions?: string[];
  yesterday_for_tomorrow?: { watch_for?: string; try_this?: string; sit_with?: string } | null;
  active_pattern_challenges?: PatternChallengeData[];
}

interface OverflowExercise {
  framework_name: string;
  framework_id: string;
  modality: string;
  why_selected: string;
  custom_framing: string;
  estimated_minutes: number;
  originator: string;
  source_work: string;
  why_this_works?: string;
}

interface StateAnalysis {
  // New prose format
  reading?: string;
  // Legacy category format (backwards compatible)
  emotional_state?: string;
  cognitive_patterns?: string;
  somatic_signals?: string;
  key_themes: string[];
  urgency_level: string;
  goal_connections: string[];
}

interface FrameworkAnalysis {
  framework_name: string;
  framework_id: string;
  originator: string;
  source_work: string;
  explanation: string;
  application: string;
  reflection_prompt: string;
}

interface SummaryResult {
  today_themes: string[];
  summary: string;
  exercise_insights: { exercise_name: string; insight: string }[];
  goal_progress: { goal_text: string; observation: string }[];
  tomorrow_preview: { title: string; territory: string; connection: string };
  pattern_note: string | null;
  micro_content: string;
  mini_actions?: string[];
  committed_actions?: string[];
}

// ── Component ──

export default function DailyFlowPageWrapper() {
  return (
    <Suspense fallback={null}>
      <DailyFlowPage />
    </Suspense>
  );
}

function DailyFlowPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const dayNumber = parseInt(params.dayNumber as string, 10);
  const enrollmentParam = searchParams.get("enrollment");

  // State
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [programDay, setProgramDay] = useState<ProgramDay | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  // Step 1
  const [themes, setThemes] = useState<ThemesResult | null>(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [commitmentResponses, setCommitmentResponses] = useState<CommitmentCheckInItem[]>([]);

  // Step 2
  const [journalContent, setJournalContent] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalMode, setJournalMode] = useState<"type" | "voice">("type");

  // Step 3
  const [step3Mode, setStep3Mode] = useState<"form" | "chat">("form");
  const [stateAnalysis, setStateAnalysis] = useState<StateAnalysis | null>(null);
  const [overflowExercises, setOverflowExercises] = useState<OverflowExercise[]>([]);
  const [coachingQuestions, setCoachingQuestions] = useState<string[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<number, string>>({});
  const [savingResponses, setSavingResponses] = useState(false);
  const [responsesSaved, setResponsesSaved] = useState(false);
  const [reframe, setReframe] = useState<{ old_thought: string; new_thought: string; source_quote: string } | null>(null);
  const [patternChallenge, setPatternChallenge] = useState<{ pattern: string; challenge: string; counter_move: string } | null>(null);
  const [sequenceSuggestion, setSequenceSuggestion] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Step 4
  const [frameworkAnalysis, setFrameworkAnalysis] = useState<FrameworkAnalysis | null>(null);
  const [loadingFramework, setLoadingFramework] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  // Step 5
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [dayFeedback, setDayFeedback] = useState("");
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [customAction, setCustomAction] = useState("");

  // Review prompt
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // Crisis banner
  const [crisisDetectedStep3, setCrisisDetectedStep3] = useState(false);
  const [crisisDetectedStep5, setCrisisDetectedStep5] = useState(false);
  const [crisisDismissedStep3, setCrisisDismissedStep3] = useState(false);
  const [crisisDismissedStep5, setCrisisDismissedStep5] = useState(false);

  // ── Load initial data ──
  const loadData = useCallback(async (userId: string) => {
    // Fetch enrollment — use query param if provided, otherwise most recent
    let enr;
    if (enrollmentParam) {
      const { data } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("id", enrollmentParam)
        .eq("client_id", userId)
        .single();
      enr = data;
    } else {
      const { data: enrollments } = await supabase
        .from("program_enrollments")
        .select("*, programs(*)")
        .eq("client_id", userId)
        .in("status", ["active", "onboarding", "pre_start"])
        .order("created_at", { ascending: false })
        .limit(1);
      enr = enrollments?.[0];
    }

    if (!enr) {
      setLoading(false);
      return;
    }
    setEnrollment(enr);

    // Fetch program day
    const { data: pd } = await supabase
      .from("program_days")
      .select("*")
      .eq("program_id", enr.program_id)
      .eq("day_number", dayNumber)
      .single();

    if (pd) setProgramDay(pd);

    // Fetch or create daily session
    const { data: existingSession } = await supabase
      .from("daily_sessions")
      .select("*")
      .eq("enrollment_id", enr.id)
      .eq("day_number", dayNumber)
      .single();

    if (existingSession) {
      setSession(existingSession);
      setJournalContent(existingSession.step_2_journal || "");
      const steps = existingSession.completed_steps || [];
      if (steps.includes(1)) setThemes(existingSession.step_1_themes as unknown as ThemesResult);
      if (steps.includes(3)) {
        const analysis = existingSession.step_3_analysis as Record<string, unknown>;
        const restoredAnalysis = analysis?.state_analysis as StateAnalysis;
        setStateAnalysis(restoredAnalysis);
        setOverflowExercises((analysis?.overflow_exercises || []) as OverflowExercise[]);
        setCoachingQuestions((analysis?.coaching_questions || []) as string[]);
        setReframe((analysis?.reframe || null) as { old_thought: string; new_thought: string; source_quote: string } | null);
        setPatternChallenge((analysis?.pattern_challenge || null) as { pattern: string; challenge: string; counter_move: string } | null);
        setSequenceSuggestion((analysis?.sequence_suggestion || null) as string | null);
        if (restoredAnalysis?.urgency_level === "high") {
          setCrisisDetectedStep3(true);
        }
      }
      if (steps.includes(5)) {
        const restoredSummary = existingSession.step_5_summary as unknown as SummaryResult;
        setSummaryResult(restoredSummary);
        const summaryText = (restoredSummary?.summary || "") + (restoredSummary?.pattern_note || "");
        if (
          summaryText.includes("988") ||
          summaryText.includes("741741") ||
          summaryText.includes("Crisis Lifeline") ||
          summaryText.includes("beyond what exercises can hold")
        ) {
          setCrisisDetectedStep5(true);
        }
      }
      // On Day 1, auto-complete step 1 (welcome — no themes to review)
      if (dayNumber === 1 && !steps.includes(1)) {
        steps.push(1);
        supabase.from("daily_sessions")
          .update({ completed_steps: steps })
          .eq("id", existingSession.id)
          .then(() => {});
      }
      // Set active step to the next incomplete one
      const nextStep = [1, 2, 3, 4, 5].find((s) => !steps.includes(s)) || 5;
      setActiveStep(nextStep);
      if (steps.includes(2)) setJournalSaved(true);
    } else {
      // Create new session
      const { data: newSession } = await supabase
        .from("daily_sessions")
        .insert({
          enrollment_id: enr.id,
          day_number: dayNumber,
          date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (newSession) setSession(newSession);
    }

    setLoading(false);
  }, [supabase, dayNumber]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }
      setUser(user);
      loadData(user.id);
    });
  }, [supabase.auth, router, loadData]);

  // ── Step 1: Load themes (check cache first, then API) ──
  async function loadThemes() {
    if (!enrollment || !session) return;
    setLoadingThemes(true);
    setThemesError(null);

    try {
      // Check if themes were prefetched (cached in step_1_themes by dashboard)
      if (session.step_1_themes && typeof session.step_1_themes === "object" && "thread" in (session.step_1_themes as Record<string, unknown>)) {
        setThemes(session.step_1_themes as unknown as ThemesResult);
        if (!session.completed_steps?.includes(1)) {
          await supabase
            .from("daily_sessions")
            .update({ completed_steps: [...(session.completed_steps || []), 1] })
            .eq("id", session.id);
          setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
        }
        setActiveStep(2);
        setLoadingThemes(false);
        return;
      }

      // No cache — call API
      const res = await fetch("/api/daily-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id, dayNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        setThemes(data);

        // Save to session and mark step complete
        await supabase
          .from("daily_sessions")
          .update({
            step_1_themes: data,
            completed_steps: [...(session.completed_steps || []), 1],
          })
          .eq("id", session.id);

        setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
        setActiveStep(2);
      } else {
        const errData = await res.json().catch(() => ({}));
        setThemesError(errData.error || `Request failed (${res.status})`);
      }
    } catch (err) {
      console.error("Failed to load themes:", err);
      setThemesError("Could not connect. Please try again.");
    }
    setLoadingThemes(false);
  }

  // ── Step 2: Save journal ──
  async function saveJournal() {
    if (!session || !journalContent.trim()) return;
    setSavingJournal(true);

    await supabase
      .from("daily_sessions")
      .update({
        step_2_journal: journalContent,
        completed_steps: [...new Set([...(session.completed_steps || []), 2])],
      })
      .eq("id", session.id);

    setSession((prev) => prev ? {
      ...prev,
      step_2_journal: journalContent,
      completed_steps: [...new Set([...(prev.completed_steps || []), 2])],
    } : prev);
    setJournalSaved(true);
    setSavingJournal(false);
    setActiveStep(3);

    // Fire-and-forget sentiment analysis
    if (session?.id) {
      fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, content: journalContent }),
      }).catch(() => {}); // non-blocking
    }

    // Auto-trigger Step 3 processing
    processJournal();
  }

  // ── Step 3: Process journal — adaptive exercise selection ──
  async function processJournal() {
    if (!enrollment || !session) {
      setProcessError("Session not ready. Please refresh the page and try again.");
      return;
    }
    if (!journalContent.trim()) {
      setProcessError("Write something in your journal first.");
      return;
    }
    setProcessing(true);
    setProcessError(null);

    try {
      const res = await fetch("/api/process-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          dayNumber,
          journalContent,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setProcessError(err.error || `Processing failed (${res.status}). Try again.`);
        setProcessing(false);
        return;
      }

      const data = await res.json();
      setStateAnalysis(data.state_analysis);
      setOverflowExercises(data.overflow_exercises || []);
      setCoachingQuestions(data.coaching_questions || []);
      setReframe(data.reframe || null);
      setPatternChallenge(data.pattern_challenge || null);
      setSequenceSuggestion(data.sequence_suggestion || null);

      // Crisis detection -- check urgency_level
      const isHighUrgency = data.state_analysis?.urgency_level === "high";
      if (isHighUrgency) {
        setCrisisDetectedStep3(true);
        // Fire crisis notification (non-blocking)
        fetch("/api/crisis-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            dayNumber,
            source: "process-journal",
            action: "detected",
          }),
        }).catch(() => {});
      }

      // Save analysis to session
      await supabase
        .from("daily_sessions")
        .update({
          step_3_analysis: data,
          completed_steps: [...new Set([...(session.completed_steps || []), 3])],
        })
        .eq("id", session.id);

      setSession((prev) => prev ? {
        ...prev,
        step_3_analysis: data,
        completed_steps: [...new Set([...(prev.completed_steps || []), 3])],
      } : prev);
      setActiveStep(4);

      // Also trigger framework analysis (skip if crisis)
      if (!isHighUrgency) {
        loadFrameworkAnalysis();
      }
    } catch (err) {
      console.error("Journal processing failed:", err);
      setProcessError("Something went wrong. Please try again.");
    }
    setProcessing(false);
  }

  // ── Save coaching question responses ──
  async function saveQuestionResponses() {
    if (!session || Object.values(questionResponses).every((r) => !r.trim())) return;
    setSavingResponses(true);
    try {
      const content = coachingQuestions
        .map((q, i) => `Q: ${q}\nA: ${questionResponses[i] || "(no response)"}`)
        .join("\n\n");
      await supabase.from("entries").insert({
        client_id: user?.id,
        content,
        date: new Date().toISOString().split("T")[0],
        theme_tags: ["coaching-questions"],
        metadata: { source: "coaching_questions", day_number: dayNumber, enrollment_id: enrollment?.id },
      });
      setResponsesSaved(true);
    } catch (err) {
      console.error("Failed to save question responses:", err);
    }
    setSavingResponses(false);
  }

  // ── Step 4: Framework analysis ──
  async function loadFrameworkAnalysis() {
    if (!enrollment) return;
    setLoadingFramework(true);

    try {
      const res = await fetch("/api/framework-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id, dayNumber }),
      });

      if (res.ok) {
        const data = await res.json();
        setFrameworkAnalysis(data);
      }
    } catch (err) {
      console.error("Framework analysis failed:", err);
    }
    setLoadingFramework(false);
  }

  // ── Save exercise completion ──
  async function handleExerciseComplete(
    name: string,
    type: "coaching_plan" | "overflow" | "framework_analysis",
    modality: string | undefined,
    responses: Record<string, string>,
    rating: number | null,
    customFraming?: string,
    frameworkId?: string
  ) {
    if (!session || !enrollment) return;

    await supabase.from("exercise_completions").insert({
      daily_session_id: session.id,
      enrollment_id: enrollment.id,
      framework_name: name,
      framework_id: frameworkId || null,
      exercise_type: type,
      modality: modality || null,
      custom_framing: customFraming || null,
      responses,
      star_rating: rating,
    });

    setCompletedExercises((prev) => new Set(prev).add(name));
  }

  // ── Step 5: Generate summary ──
  async function generateSummary() {
    if (!enrollment || !session) return;
    setLoadingSummary(true);

    try {
      const res = await fetch("/api/daily-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          dayNumber,
          sessionId: session.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryResult(data);

        // Crisis detection in summary -- check for crisis resource text
        const summaryText = (data.summary || "") + (data.pattern_note || "");
        const hasCrisisContent =
          summaryText.includes("988") ||
          summaryText.includes("741741") ||
          summaryText.includes("Crisis Lifeline") ||
          summaryText.includes("beyond what exercises can hold");
        if (hasCrisisContent) {
          setCrisisDetectedStep5(true);
          // Fire crisis notification (non-blocking)
          fetch("/api/crisis-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enrollmentId: enrollment.id,
              dayNumber,
              source: "daily-summary",
              action: "detected",
            }),
          }).catch(() => {});
        }

        // Save to session
        await supabase
          .from("daily_sessions")
          .update({
            step_5_summary: data,
            completed_steps: [...new Set([...(session.completed_steps || []), 4, 5])],
          })
          .eq("id", session.id);

        setSession((prev) => prev ? {
          ...prev,
          completed_steps: [...new Set([...(prev.completed_steps || []), 4, 5])],
        } : prev);
        setActiveStep(5);
      }
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
    setLoadingSummary(false);
  }

  // ── Complete day ──
  const REVIEW_DAYS = [7, 14, 21, 30];

  async function completeDay() {
    if (!session || !enrollment) return;

    await supabase
      .from("daily_sessions")
      .update({
        completed_at: new Date().toISOString(),
        day_rating: dayRating,
        day_feedback: dayFeedback || null,
      })
      .eq("id", session.id);

    // Advance enrollment day and ensure status is active
    await supabase
      .from("program_enrollments")
      .update({
        current_day: Math.max(enrollment.current_day, dayNumber + 1),
        status: enrollment.status === "pre_start" || enrollment.status === "onboarding"
          ? "active"
          : enrollment.status,
      })
      .eq("id", enrollment.id);

    if (REVIEW_DAYS.includes(dayNumber)) {
      setShowReviewPrompt(true);
    } else {
      router.push("/dashboard");
    }
  }

  // ── Helpers ──
  const completedSteps = session?.completed_steps || [];
  const weekNames = ["GROUND", "DIG", "BUILD", "ORIENT"];

  // ── Loading ──
  if (loading) {
    return (
      <PageShell>
        <p style={{ color: "#ffffff", fontFamily: body }}>Loading your session...</p>
      </PageShell>
    );
  }

  if (!enrollment || !programDay) {
    return (
      <PageShell>
        <FadeIn preset="fade" triggerOnMount>
          <h1 style={{
            fontFamily: display, fontSize: 32, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 10px 0",
          }}>
            Day not available
          </h1>
          <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.6, marginBottom: 24, fontFamily: body }}>
            This day isn&apos;t available yet. Make sure you have an active program enrollment.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "14px 32px", fontSize: 16, fontWeight: 600,
              color: colors.bgDeep, backgroundColor: colors.coral,
              border: "none", borderRadius: 100, cursor: "pointer",
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Back to Dashboard
          </motion.button>
        </FadeIn>
      </PageShell>
    );
  }

  // Auto-loader for Yesterday's Themes — starts loading automatically and allows skip
  function ThemesAutoLoader({ loading, error, isActive, onLoad, onSkip }: {
    loading: boolean; error: string | null; isActive: boolean;
    onLoad: () => void; onSkip: () => void;
  }) {
    useEffect(() => {
      if (isActive && !loading && !error) {
        onLoad();
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    return (
      <div style={{
        backgroundColor: colors.bgSurface, borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`, padding: 22,
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${colors.borderDefault}`, borderTopColor: colors.coral,
              }}
            />
            <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
              Loading yesterday&apos;s themes...
            </p>
          </div>
        ) : error ? (
          <div>
            <p style={{ fontSize: 14, color: "#f87171", margin: "0 0 12px 0", fontFamily: body }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLoad}
                style={{
                  padding: "10px 20px", fontSize: 14, fontWeight: 600,
                  color: colors.bgDeep, backgroundColor: colors.coral,
                  border: "none", borderRadius: 100, cursor: "pointer",
                  fontFamily: display,
                }}
              >
                Retry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSkip}
                style={{
                  padding: "10px 20px", fontSize: 14, fontWeight: 600,
                  color: "#ffffff", backgroundColor: "transparent",
                  border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                  cursor: "pointer", fontFamily: display,
                }}
              >
                Skip to journal →
              </motion.button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
            Loading...
          </p>
        )}
      </div>
    );
  }

  return (
    <PageShell>
      {/* Day header */}
      <FadeIn preset="fade" triggerOnMount>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{
              display: "inline-block", background: colors.coralWash, color: colors.coral,
              fontFamily: display, fontWeight: 700, fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              Week {programDay.week_number} — {weekNames[programDay.week_number - 1] || ""}
            </span>
            <span style={{
              display: "inline-block", background: colors.bgSurface, color: colors.textPrimary,
              fontFamily: display, fontWeight: 700, fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "5px 14px", borderRadius: 100,
            }}>
              {enrollment.programs?.name}
            </span>
          </div>
          <h1 style={{
            fontFamily: display, fontSize: 30, fontWeight: 700,
            letterSpacing: "-0.03em", color: colors.textPrimary, margin: "0 0 6px 0",
          }}>
            Day {dayNumber}: {programDay.title}
          </h1>
          <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.55, fontFamily: body }}>
            {programDay.territory}
          </p>
        </div>
      </FadeIn>

      {/* Progress bar */}
      <FadeIn preset="fade" delay={0.1} triggerOnMount>
        <div style={{ display: "flex", gap: 5, marginBottom: 36 }}>
          {[1, 2, 3, 4, 5].map((step) => (
            <motion.div
              key={step}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: step * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 100,
                backgroundColor: completedSteps.includes(step)
                  ? colors.coral
                  : step === activeStep
                  ? colors.coral
                  : colors.bgElevated,
                transition: "background-color 0.4s",
                transformOrigin: "left",
              }}
            />
          ))}
        </div>
      </FadeIn>

      {/* ═══════ STEP 1: Yesterday's Themes ═══════ */}
      <DailyStep
        stepNumber={1}
        title={dayNumber === 1 ? "Welcome" : "Yesterday's Themes"}
        subtitle={dayNumber === 1 ? "Your program starts here" : "What surfaced yesterday"}
        isActive={activeStep === 1}
        isCompleted={completedSteps.includes(1)}
        estimatedTime="2 min"
      >
        {dayNumber === 1 ? (
          completedSteps.includes(1) ? (
            <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
              Day 1 — no prior themes.
            </p>
          ) : (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22,
          }}>
            <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 18px 0", lineHeight: 1.65, fontFamily: body }}>
              Welcome to Day 1 of your program. There are no themes to review yet — today is where it begins.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setThemes({ themes: [], summary: "Day 1 — no prior themes.", patterns: [], carry_forward: "" });
                setActiveStep(2);
                if (session) {
                  supabase.from("daily_sessions")
                    .update({ completed_steps: [...(session.completed_steps || []), 1] })
                    .eq("id", session.id)
                    .then(() => {
                      setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
                    });
                }
              }}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: colors.bgDeep, backgroundColor: colors.coral,
                border: "none", borderRadius: 100, cursor: "pointer",
                fontFamily: display, letterSpacing: "0.01em",
              }}
            >
              Begin Day 1
            </motion.button>
          </div>
          )
        ) : !themes ? (
          <ThemesAutoLoader
            loading={loadingThemes}
            error={themesError}
            isActive={activeStep === 1}
            onLoad={loadThemes}
            onSkip={() => {
              setThemes({ themes: [], summary: "Skipped — no themes loaded.", patterns: [], carry_forward: "" });
              setActiveStep(2);
              if (session) {
                supabase.from("daily_sessions")
                  .update({ completed_steps: [...(session.completed_steps || []), 1] })
                  .eq("id", session.id)
                  .then(() => {
                    setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
                  });
              }
            }}
          />
        ) : (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22,
          }}>
            {/* Thread — primary content (narrative prose) */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
              <FlagButton outputType="themes" dailySessionId={session?.id} />
            </div>
            {themes.thread ? (
              <div style={{ marginBottom: 18 }}>
                {themes.thread.split("\n\n").map((para, i) => (
                  <p key={i} style={{
                    fontSize: 16, color: "#ffffff", lineHeight: 1.75,
                    margin: i === 0 ? "0 0 12px 0" : "12px 0",
                    fontFamily: body,
                  }}>
                    {para}
                  </p>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.65, margin: "0 0 14px 0", fontFamily: body }}>
                {themes.summary}
              </p>
            )}

            {/* Follow-Up — commitments, coaching questions, highlight */}
            {themes.follow_up && (themes.follow_up.commitments?.length > 0 || themes.follow_up.coaching_questions?.length > 0 || themes.follow_up.highlight) && (
              <div style={{
                padding: "16px 18px",
                backgroundColor: colors.coralWash,
                borderRadius: 12,
                borderLeft: `3px solid ${colors.coral}`,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: colors.coral, margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: display }}>
                  Carrying forward
                </p>

                {themes.follow_up.commitments?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: "#ffffff", margin: "0 0 6px 0", fontFamily: body }}>You said you would:</p>
                    {themes.follow_up.commitments.map((c, i) => (
                      <p key={i} style={{ fontSize: 16, color: "#ffffff", margin: "4px 0", fontFamily: body, paddingLeft: 12 }}>
                        &bull; {c}
                      </p>
                    ))}
                  </div>
                )}

                {themes.follow_up.coaching_questions?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, color: "#ffffff", margin: "0 0 6px 0", fontFamily: body }}>From last time:</p>
                    {themes.follow_up.coaching_questions.map((q, i) => (
                      <p key={i} style={{ fontSize: 16, color: "#ffffff", margin: "4px 0", fontFamily: body, fontStyle: "italic", paddingLeft: 12 }}>
                        {q}
                      </p>
                    ))}
                  </div>
                )}

                {themes.follow_up.highlight && (
                  <p style={{ fontSize: 16, color: "#ffffff", margin: "8px 0 0 0", fontFamily: body, fontStyle: "italic" }}>
                    {themes.follow_up.highlight}
                  </p>
                )}
              </div>
            )}

            {/* Yesterday's committed mini-actions follow-up */}
            {themes.yesterday_committed_actions && themes.yesterday_committed_actions.length > 0 && (
              <div style={{
                padding: "16px 18px",
                backgroundColor: "rgba(224, 149, 133, 0.06)",
                borderRadius: 12,
                borderLeft: `3px solid ${colors.coral}`,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: colors.coral, margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: display }}>
                  Yesterday&apos;s mini-actions
                </p>
                <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 10px 0", fontFamily: body }}>
                  You committed to these. How did they go?
                </p>
                {themes.yesterday_committed_actions.map((action, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", margin: "0 0 4px 0", fontFamily: body }}>
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Theme tags */}
            {themes.themes.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {themes.themes.map((t, i) => (
                  <span key={i} style={{
                    padding: "4px 12px", fontSize: 12, fontWeight: 600,
                    backgroundColor: colors.plumWash, color: colors.plum,
                    borderRadius: 100, fontFamily: display,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Patterns (collapsed below themes) */}
            {themes.patterns.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {themes.patterns.map((p, i) => (
                  <div key={i} style={{
                    padding: "12px 16px",
                    backgroundColor: colors.bgElevated,
                    borderRadius: 12,
                    borderLeft: `3px solid ${colors.plum}`,
                    marginBottom: 8,
                  }}>
                    <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.55, fontFamily: body }}>
                      {p.observation}
                    </p>
                    <p style={{ fontSize: 12, color: "#ffffff", margin: "4px 0 0 0", fontFamily: body }}>
                      Seen across {p.days_observed} days • {p.connection}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {themes.carry_forward && (
              <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontStyle: "italic", fontFamily: body }}>
                {themes.carry_forward}
              </p>
            )}

            {/* Auto-advance to journal when themes load */}
          </div>
        )}
      </DailyStep>

      {/* ═══════ STEP 2: Free-Flow Journal ═══════ */}
      <DailyStep
        stepNumber={2}
        title="Free-Flow Journal"
        subtitle="Write what's alive. Prompts are optional scaffolding."
        isActive={activeStep === 2}
        isCompleted={completedSteps.includes(2)}
        estimatedTime="5-10 min"
      >
        <div style={{
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
          padding: 22,
        }}>
          {/* Coaching question prompts from themes */}

          {/* Seed prompts */}
          {programDay.seed_prompts && programDay.seed_prompts.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                margin: "0 0 10px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Thought Inspiration
              </p>
              {programDay.seed_prompts.map((sp, i) => (
                <div key={i} style={{
                  padding: "14px 18px",
                  backgroundColor: colors.bgElevated,
                  borderRadius: 12,
                  marginBottom: 8,
                }}>
                  <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.55, fontFamily: body }}>
                    {sp.prompt}
                  </p>
                  {sp.context && (
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "8px 0 0 0", lineHeight: 1.5, fontFamily: body, fontStyle: "italic" }}>
                      {sp.context}
                    </p>
                  )}
                  {sp.purpose && !sp.context && (
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0 0", fontFamily: body }}>
                      {sp.purpose}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Journal mode toggle */}
          {!journalSaved && (
            <div style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: 100, backgroundColor: colors.bgElevated, border: `1px solid ${colors.borderDefault}`, marginBottom: 14 }}>
              <button
                onClick={() => setJournalMode("type")}
                style={{
                  fontFamily: display, fontSize: 11, fontWeight: 600,
                  padding: "6px 14px", borderRadius: 100,
                  backgroundColor: journalMode === "type" ? colors.bgSurface : "transparent",
                  color: journalMode === "type" ? colors.coral : colors.textMuted,
                  border: journalMode === "type" ? `1px solid rgba(224, 149, 133, 0.3)` : "1px solid transparent",
                  cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" as const,
                  transition: "all 0.2s",
                }}
              >
                Type
              </button>
              <button
                onClick={() => setJournalMode("voice")}
                style={{
                  fontFamily: display, fontSize: 11, fontWeight: 600,
                  padding: "6px 14px", borderRadius: 100,
                  backgroundColor: journalMode === "voice" ? colors.bgSurface : "transparent",
                  color: journalMode === "voice" ? colors.coral : colors.textMuted,
                  border: journalMode === "voice" ? `1px solid rgba(224, 149, 133, 0.3)` : "1px solid transparent",
                  cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" as const,
                  transition: "all 0.2s",
                }}
              >
                Voice
              </button>
            </div>
          )}

          {/* Journal input — textarea or voice */}
          {journalMode === "type" ? (
            <textarea
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
              disabled={journalSaved}
              placeholder="Write freely. What's coming up? What are you noticing? There's no wrong way to do this."
              style={{
                width: "100%",
                minHeight: 200,
                padding: 18,
                fontSize: 16,
                lineHeight: 1.7,
                border: journalSaved
                  ? `1px solid ${colors.coral}`
                  : `1px solid ${colors.borderDefault}`,
                borderRadius: 14,
                resize: "vertical",
                outline: "none",
                fontFamily: body,
                boxSizing: "border-box",
                color: colors.textPrimary,
                backgroundColor: journalSaved ? "rgba(224, 149, 133, 0.08)" : colors.bgInput,
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              onFocus={(e) => { if (!journalSaved) e.target.style.borderColor = colors.coral; }}
              onBlur={(e) => { if (!journalSaved) e.target.style.borderColor = colors.borderDefault; }}
            />
          ) : (
            <VoiceCoach
              onTranscript={(text) => setJournalContent((prev) => prev ? prev + "\n" + text : text)}
            />
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ fontSize: 12, color: "#ffffff", fontFamily: body }}>
              {journalContent.length > 0 ? `${journalContent.split(/\s+/).filter(Boolean).length} words` : ""}
            </span>

            {!journalSaved ? (
              <motion.button
                whileHover={journalContent.trim() && !savingJournal ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}}
                whileTap={journalContent.trim() && !savingJournal ? { scale: 0.97 } : {}}
                onClick={saveJournal}
                disabled={!journalContent.trim() || savingJournal}
                style={{
                  padding: "12px 28px", fontSize: 14, fontWeight: 600,
                  color: !journalContent.trim() || savingJournal ? "#ffffff" : colors.bgDeep,
                  backgroundColor: !journalContent.trim() || savingJournal ? colors.bgElevated : colors.coral,
                  border: "none", borderRadius: 100,
                  cursor: !journalContent.trim() || savingJournal ? "not-allowed" : "pointer",
                  fontFamily: display, letterSpacing: "0.01em",
                  transition: "background-color 0.2s",
                }}
              >
                {savingJournal ? "Saving..." : "Save & Continue"}
              </motion.button>
            ) : (
              <span style={{
                fontSize: 14, color: colors.coral, fontWeight: 600,
                fontFamily: display, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  backgroundColor: colors.coral,
                  color: colors.bgDeep,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                }}>✓</span>
                Journal saved
              </span>
            )}
          </div>
        </div>
      </DailyStep>

      {/* ═══════ STEP 3: System Processing ═══════ */}
      <DailyStep
        stepNumber={3}
        title="Processing Your Journal"
        subtitle="Your coach's AI reads what you wrote and selects exercises"
        isActive={activeStep === 3}
        isCompleted={completedSteps.includes(3)}
        estimatedTime="~15 sec"
      >
        {processing ? (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 28, textAlign: "center",
          }}>
            {/* Progress bar */}
            <div style={{
              width: "100%", height: 4, borderRadius: 2,
              backgroundColor: colors.bgElevated, marginBottom: 24,
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "85%" }}
                transition={{ duration: 12, ease: "easeOut" }}
                style={{
                  height: "100%", borderRadius: 2,
                  backgroundColor: colors.coral,
                }}
              />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `3px solid ${colors.borderDefault}`,
                borderTopColor: colors.coral,
                margin: "0 auto 18px auto",
              }}
            />
            <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
              Reading your journal and matching exercises to what surfaced...
            </p>
          </div>
        ) : stateAnalysis ? (
          <div>
            {/* View mode toggle — Read vs Chat */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <ViewModeToggle mode={step3Mode} onChange={setStep3Mode} />
            </div>

            {step3Mode === "chat" ? (
              <ChatCoach
                initialMessage={stateAnalysis?.reading || "Let me read your journal..."}
                onSend={async (message) => {
                  const res = await fetch("/api/reflect", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ entry: message, stream: false }),
                  });
                  const data = await res.json();
                  return data.reflection || data.error || "Let me think about that...";
                }}
                placeholder="Ask your coach anything..."
                showComplete={true}
                completeLabel="Back to overview"
                onComplete={() => setStep3Mode("form")}
              />
            ) : (
            <>
            {/* Crisis Banner -- shown above analysis when urgency is high */}
            {crisisDetectedStep3 && !crisisDismissedStep3 && enrollment && (
              <CrisisBanner
                onDismiss={() => setCrisisDismissedStep3(true)}
                enrollmentId={enrollment.id}
                dayNumber={dayNumber}
                source="process-journal"
              />
            )}
          <div style={{
            ...(crisisDetectedStep3 && !crisisDismissedStep3
              ? { filter: "blur(3px)", opacity: 0.5, pointerEvents: "none" as const, transition: "filter 0.4s, opacity 0.4s" }
              : { filter: "none", opacity: 1, transition: "filter 0.4s, opacity 0.4s" }),
            display: "flex", flexDirection: "column", gap: 16,
          }}>

            {/* ── Card 1: Reading ── */}
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14, padding: 22,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    backgroundColor: colors.coralWash,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <p style={{
                    fontSize: 12, fontWeight: 700, color: colors.coral,
                    margin: 0, textTransform: "uppercase",
                    letterSpacing: "0.08em", fontFamily: display,
                  }}>
                    What your journal reveals
                  </p>
                </div>
                <FlagButton outputType="reflection" dailySessionId={session?.id} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stateAnalysis.reading ? (
                  stateAnalysis.reading.split("\n\n").map((para, i) => (
                    <p key={i} style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.7, fontFamily: body }}>
                      {para}
                    </p>
                  ))
                ) : (
                  <>
                    {stateAnalysis.emotional_state && (
                      <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.6, fontFamily: body }}>
                        {stateAnalysis.emotional_state}
                      </p>
                    )}
                    {stateAnalysis.cognitive_patterns && (
                      <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.6, fontFamily: body }}>
                        {stateAnalysis.cognitive_patterns}
                      </p>
                    )}
                    {stateAnalysis.somatic_signals && (
                      <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.6, fontFamily: body }}>
                        {stateAnalysis.somatic_signals}
                      </p>
                    )}
                  </>
                )}
              </div>
              {stateAnalysis.goal_connections.length > 0 && (
                <div style={{
                  padding: "10px 14px", marginTop: 16,
                  backgroundColor: colors.plumWash,
                  borderRadius: 10,
                }}>
                  <p style={{ fontSize: 14, color: colors.plumLight, margin: 0, fontFamily: body, fontWeight: 500 }}>
                    <span style={{ fontWeight: 700 }}>Goal connections:</span> {stateAnalysis.goal_connections.join(" • ")}
                  </p>
                </div>
              )}
            </div>

            {/* ── Card 2: Coaching Questions ── */}
            {coachingQuestions.length > 0 && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14, padding: 22,
                borderLeft: `3px solid ${colors.plum}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    backgroundColor: colors.plumWash,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.plum} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.plum, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: display }}>
                    Questions to sit with
                  </p>
                </div>
                {coachingQuestions.map((q, i) => (
                  <div key={i} style={{ marginBottom: i < coachingQuestions.length - 1 ? 20 : 0 }}>
                    <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 10px 0", lineHeight: 1.6, fontFamily: body, fontStyle: "italic" }}>
                      {q}
                    </p>
                    <textarea
                      value={questionResponses[i] || ""}
                      onChange={(e) => setQuestionResponses((prev) => ({ ...prev, [i]: e.target.value }))}
                      placeholder="Your thoughts..."
                      rows={2}
                      disabled={responsesSaved}
                      style={{
                        width: "100%", padding: "12px 16px", fontSize: 16, fontFamily: body,
                        border: `1px solid ${colors.borderDefault}`, borderRadius: 12,
                        backgroundColor: colors.bgRecessed, color: "#ffffff",
                        resize: "vertical", minHeight: 70, boxSizing: "border-box",
                        outline: "none", opacity: responsesSaved ? 0.6 : 1,
                      }}
                    />
                  </div>
                ))}
                {!responsesSaved ? (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={saveQuestionResponses}
                    disabled={savingResponses || Object.values(questionResponses).every((r) => !r.trim())}
                    style={{
                      marginTop: 16, padding: "10px 24px", fontSize: 14, fontWeight: 600,
                      color: colors.bgDeep, backgroundColor: colors.plum,
                      border: "none", borderRadius: 100, cursor: "pointer",
                      fontFamily: display, letterSpacing: "0.01em",
                      opacity: savingResponses || Object.values(questionResponses).every((r) => !r.trim()) ? 0.5 : 1,
                    }}
                  >
                    {savingResponses ? "Saving..." : "Save Responses"}
                  </motion.button>
                ) : (
                  <p style={{ marginTop: 12, fontSize: 14, color: colors.plum, fontWeight: 600, fontFamily: display }}>
                    ✓ Responses saved
                  </p>
                )}
              </div>
            )}

            {/* ── Card 3: Reframe ── */}
            {reframe && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14, padding: 22,
                borderLeft: `3px solid ${colors.coral}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      backgroundColor: colors.coralWash,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6" /><path d="M2.5 22v-6h6" /><path d="M21.34 15.57a10 10 0 0 1-17.68 2.86" /><path d="M2.66 8.43a10 10 0 0 1 17.68-2.86" />
                      </svg>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: colors.coral, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: display }}>
                      Reframe
                    </p>
                  </div>
                  <FlagButton outputType="reframe" dailySessionId={session?.id} />
                </div>
                <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 12px 0", fontFamily: body, fontStyle: "italic", lineHeight: 1.6 }}>
                  &ldquo;{reframe.source_quote}&rdquo;
                </p>
                <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body, textDecoration: "line-through", opacity: 0.7, lineHeight: 1.6 }}>
                  {reframe.old_thought}
                </p>
                <p style={{ fontSize: 16, color: "#ffffff", margin: "8px 0 0 0", fontFamily: body, fontWeight: 600, lineHeight: 1.6 }}>
                  {reframe.new_thought}
                </p>
              </div>
            )}

            {/* ── Card 4: Pattern Challenge ── */}
            {patternChallenge && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14, padding: 22,
                borderLeft: `3px solid ${colors.warning}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    backgroundColor: "rgba(251, 191, 36, 0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: colors.warning, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: display }}>
                    Pattern challenge
                  </p>
                </div>
                <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 8px 0", lineHeight: 1.55, fontFamily: body }}>
                  {patternChallenge.pattern}
                </p>
                <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 4px 0", fontWeight: 600, fontFamily: body }}>
                  {patternChallenge.challenge}
                </p>
                <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body, fontStyle: "italic" }}>
                  Counter-move: {patternChallenge.counter_move}
                </p>
              </div>
            )}

            {/* Sequence suggestion */}
            {sequenceSuggestion && (
              <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 14px 0", fontFamily: body, fontStyle: "italic" }}>
                {sequenceSuggestion}
              </p>
            )}

            <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 18px 0", fontFamily: body }}>
              {(() => {
                const total = (programDay?.coaching_exercises?.length || 0) + overflowExercises.length;
                return `${total} exercise${total !== 1 ? "s" : ""} ready for you today.`;
              })()}
            </p>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveStep(4)}
                style={{
                  padding: "12px 28px", fontSize: 14, fontWeight: 600,
                  color: colors.bgDeep, backgroundColor: colors.coral,
                  border: "none", borderRadius: 100, cursor: "pointer",
                  fontFamily: display, letterSpacing: "0.01em",
                }}
              >
                Continue to Exercises
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setStateAnalysis(null);
                  setOverflowExercises([]);
                  setCoachingQuestions([]);
                  setReframe(null);
                  setPatternChallenge(null);
                  processJournal();
                }}
                style={{
                  padding: "10px 20px", fontSize: 14, fontWeight: 600,
                  color: "#ffffff", backgroundColor: "transparent",
                  border: `1px solid ${colors.borderDefault}`, borderRadius: 100,
                  cursor: "pointer", fontFamily: display,
                }}
              >
                Reprocess
              </motion.button>
            </div>
          </div>
          </>
          )}
          </div>
        ) : (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22, textAlign: "center",
          }}>
            <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 18px 0", lineHeight: 1.65, fontFamily: body }}>
              Your journal is ready to be processed. Your coaching AI will read what you wrote and select exercises matched to what surfaced.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={processJournal}
              style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 600,
                color: colors.bgDeep, backgroundColor: colors.coral,
                border: "none", borderRadius: 100, cursor: "pointer",
                fontFamily: display, letterSpacing: "0.01em",
              }}
            >
              Process My Journal
            </motion.button>
            {processError && (
              <p style={{ fontSize: 14, color: "#f87171", margin: "14px 0 0 0", fontFamily: body }}>
                {processError}
              </p>
            )}
          </div>
        )}
      </DailyStep>

      {/* ═══════ STEP 4: Exercises + Framework Analysis ═══════ */}
      <DailyStep
        stepNumber={4}
        title={dayNumber <= 3 ? "Exercises & Intake" : "Exercises & Framework Analysis"}
        subtitle={dayNumber <= 3 ? "Onboarding exercises that also serve as your intake" : "Today's exercises — structured and matched to your journal"}
        isActive={activeStep === 4}
        isCompleted={completedSteps.includes(4)}
        estimatedTime="15-30 min"
      >
        <div style={{
          ...(crisisDetectedStep3 && !crisisDismissedStep3
            ? { filter: "blur(3px)", opacity: 0.5, pointerEvents: "none" as const, transition: "filter 0.4s, opacity 0.4s" }
            : { filter: "none", opacity: 1, transition: "filter 0.4s, opacity 0.4s" }),
        }}>
        {/* Coaching Plan Exercises (Required) */}
        {programDay.coaching_exercises && programDay.coaching_exercises.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: "#ffffff",
              margin: "0 0 12px 0", textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: display,
            }}>
              {dayNumber <= 3 ? "Today's Exercise" : "From Your Coaching Plan"}
            </p>
            {programDay.coaching_exercises.map((ex, i) => (
              <ExerciseCard
                key={`cp-${i}`}
                name={ex.name}
                type="coaching_plan"
                customFraming={ex.custom_framing}
                estimatedMinutes={ex.duration_min}
                isRequired={true}
                isCompleted={completedExercises.has(ex.name)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(ex.name, "coaching_plan", undefined, responses, rating, ex.custom_framing)
                }
              />
            ))}
          </div>
        )}

        {/* Overflow Exercises (from journal analysis) */}
        {overflowExercises.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: "#ffffff",
              margin: "0 0 12px 0", textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: display,
            }}>
              {dayNumber <= 3 ? "Based on What You Wrote" : "Matched to Your Journal"}
            </p>
            {overflowExercises.map((ex, i) => (
              <ExerciseCard
                key={`of-${i}`}
                name={ex.framework_name}
                type="overflow"
                modality={ex.modality}
                originator={ex.originator}
                sourceWork={ex.source_work}
                customFraming={ex.custom_framing}
                whySelected={ex.why_selected}
                whyThisWorks={ex.why_this_works}
                estimatedMinutes={ex.estimated_minutes}
                isCompleted={completedExercises.has(ex.framework_name)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(
                    ex.framework_name, "overflow", ex.modality,
                    responses, rating, ex.custom_framing, ex.framework_id
                  )
                }
              />
            ))}
          </div>
        )}

        {/* Framework Analysis */}
        {loadingFramework ? (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 22, textAlign: "center",
          }}>
            <p style={{ fontSize: 14, color: "#ffffff", fontFamily: body }}>Loading framework analysis...</p>
          </div>
        ) : frameworkAnalysis ? (
          <div style={{ marginBottom: 22 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: "#ffffff",
              margin: "0 0 12px 0", textTransform: "uppercase",
              letterSpacing: "0.08em", fontFamily: display,
            }}>
              Framework Analysis
            </p>
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
              borderLeft: `3px solid ${colors.plum}`,
            }}>
              <h3 style={{
                fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: "0 0 4px 0",
                fontFamily: display, letterSpacing: "-0.02em",
              }}>
                {frameworkAnalysis.framework_name}
              </h3>
              <p style={{ fontSize: 12, color: "#ffffff", margin: "0 0 16px 0", fontFamily: body }}>
                {frameworkAnalysis.originator} — {frameworkAnalysis.source_work}
              </p>

              <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.65, margin: "0 0 16px 0", fontFamily: body }}>
                {frameworkAnalysis.explanation}
              </p>

              <div style={{
                padding: "14px 18px",
                backgroundColor: colors.bgElevated,
                borderRadius: 12,
                marginBottom: 16,
              }}>
                <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.65, margin: 0, fontFamily: body }}>
                  {frameworkAnalysis.application}
                </p>
              </div>

              <p style={{
                fontSize: 14, color: colors.plumLight, fontWeight: 600,
                fontStyle: "italic", margin: "0 0 16px 0", fontFamily: body,
              }}>
                {frameworkAnalysis.reflection_prompt}
              </p>

              {/* Optional response area for framework analysis */}
              <ExerciseCard
                name={`Reflect: ${frameworkAnalysis.framework_name}`}
                type="framework_analysis"
                instructions="Write what comes up as you sit with this framework and the reflection question above."
                isCompleted={completedExercises.has(`Reflect: ${frameworkAnalysis.framework_name}`)}
                dailySessionId={session?.id}
                onComplete={(responses, rating) =>
                  handleExerciseComplete(
                    `Reflect: ${frameworkAnalysis.framework_name}`,
                    "framework_analysis", undefined,
                    responses, rating, undefined, frameworkAnalysis.framework_id
                  )
                }
              />
            </div>
          </div>
        ) : null}

        {/* Continue to Summary */}
        <motion.button
          whileHover={!loadingSummary ? { scale: 1.04, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" } : {}}
          whileTap={!loadingSummary ? { scale: 0.97 } : {}}
          onClick={generateSummary}
          disabled={loadingSummary}
          style={{
            padding: "12px 28px", fontSize: 14, fontWeight: 600,
            color: loadingSummary ? "#ffffff" : colors.bgDeep,
            backgroundColor: loadingSummary ? colors.bgElevated : colors.coral,
            border: "none", borderRadius: 100,
            cursor: loadingSummary ? "not-allowed" : "pointer",
            fontFamily: display, letterSpacing: "0.01em",
            marginTop: 6,
          }}
        >
          {loadingSummary ? "Generating summary..." : "Complete Exercises & Continue"}
        </motion.button>
        </div>
      </DailyStep>

      {/* ═══════ STEP 5: Daily Summary ═══════ */}
      <DailyStep
        stepNumber={5}
        title="Daily Summary"
        subtitle="What surfaced today + tomorrow's preview"
        isActive={activeStep === 5}
        isCompleted={!!summaryResult && !!session?.completed_at}
        estimatedTime="2-5 min"
      >
        {loadingSummary ? (
          <div style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 14,
            border: `1px solid ${colors.borderDefault}`,
            padding: 28, textAlign: "center",
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `3px solid ${colors.borderDefault}`,
                borderTopColor: colors.coral,
                margin: "0 auto 18px auto",
              }}
            />
            <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontFamily: body }}>
              Generating your daily summary...
            </p>
          </div>
        ) : summaryResult ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Crisis Banner -- shown above summary when crisis detected */}
            {crisisDetectedStep5 && !crisisDismissedStep5 && enrollment && (
              <CrisisBanner
                onDismiss={() => setCrisisDismissedStep5(true)}
                enrollmentId={enrollment.id}
                dayNumber={dayNumber}
                source="daily-summary"
              />
            )}
            {/* Summary */}
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                <FlagButton outputType="summary" dailySessionId={session?.id} />
              </div>
              <p style={{ fontSize: 16, color: "#ffffff", lineHeight: 1.7, margin: "0 0 14px 0", fontFamily: body }}>
                {summaryResult.summary}
              </p>

              {summaryResult.today_themes.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {summaryResult.today_themes.map((t, i) => (
                    <span key={i} style={{
                      padding: "4px 12px", fontSize: 12, fontWeight: 600,
                      backgroundColor: colors.plumWash, color: colors.plumLight,
                      borderRadius: 100, fontFamily: display,
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {summaryResult.pattern_note && (
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: colors.bgElevated,
                  borderRadius: 12,
                  borderLeft: `3px solid ${colors.plum}`,
                }}>
                  <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.55, fontFamily: body }}>
                    <span style={{ fontWeight: 700 }}>Pattern forming:</span> {summaryResult.pattern_note}
                  </p>
                </div>
              )}
            </div>

            {/* Exercise insights */}
            {summaryResult.exercise_insights.length > 0 && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: 22,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: "#ffffff",
                  margin: "0 0 12px 0", textTransform: "uppercase",
                  letterSpacing: "0.08em", fontFamily: display,
                }}>
                  Exercise Insights
                </p>
                {summaryResult.exercise_insights.map((ei, i) => (
                  <p key={i} style={{ fontSize: 16, color: "#ffffff", margin: "0 0 10px 0", lineHeight: 1.55, fontFamily: body }}>
                    <span style={{ fontWeight: 600, color: colors.textPrimary }}>{ei.exercise_name}:</span> {ei.insight}
                  </p>
                ))}
              </div>
            )}

            {/* Goal progress */}
            {summaryResult.goal_progress.length > 0 && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: 22,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: "#ffffff",
                  margin: "0 0 12px 0", textTransform: "uppercase",
                  letterSpacing: "0.08em", fontFamily: display,
                }}>
                  Goal Progress
                </p>
                {summaryResult.goal_progress.map((gp, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: 0, fontFamily: body }}>
                      {gp.goal_text}
                    </p>
                    <p style={{ fontSize: 16, color: "#ffffff", margin: "3px 0 0 0", fontFamily: body, lineHeight: 1.5 }}>
                      {gp.observation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tomorrow preview */}
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
              background: `linear-gradient(135deg, ${colors.bgSurface} 0%, ${colors.plumDeep} 100%)`,
              borderColor: "rgba(123,82,120,0.25)",
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: colors.plumLight,
                margin: "0 0 8px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                Tomorrow
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: "0 0 4px 0", fontFamily: display, letterSpacing: "-0.02em" }}>
                Day {dayNumber + 1}: {summaryResult.tomorrow_preview.title}
              </p>
              <p style={{ fontSize: 16, color: "#ffffff", margin: "0 0 8px 0", fontFamily: body }}>
                {summaryResult.tomorrow_preview.territory}
              </p>
              <p style={{ fontSize: 16, color: "#ffffff", margin: 0, fontStyle: "italic", fontFamily: body, lineHeight: 1.55 }}>
                {summaryResult.tomorrow_preview.connection}
              </p>
            </div>

            {/* Micro-content */}
            {summaryResult.micro_content && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: 22,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: "#ffffff",
                  margin: "0 0 10px 0", textTransform: "uppercase",
                  letterSpacing: "0.08em", fontFamily: display,
                }}>
                  Today&apos;s Insight
                </p>
                <p style={{ fontSize: 16, color: "#ffffff", margin: 0, lineHeight: 1.65, fontFamily: body }}>
                  {summaryResult.micro_content}
                </p>
              </div>
            )}

            {/* Mini-actions */}
            {summaryResult.mini_actions && summaryResult.mini_actions.length > 0 && (
              <div style={{
                backgroundColor: colors.bgSurface,
                borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                padding: 22,
              }}>
                <p style={{
                  fontSize: 12, fontWeight: 700, color: colors.coral,
                  margin: "0 0 6px 0", textTransform: "uppercase",
                  letterSpacing: "0.08em", fontFamily: display,
                }}>
                  Pick a Mini-Action for Today
                </p>
                <p style={{ fontSize: 14, color: "#ffffff", margin: "0 0 14px 0", fontFamily: body, lineHeight: 1.5 }}>
                  Each takes under 5 minutes. Choose one (or more) to carry into the rest of your day.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {summaryResult.mini_actions.map((action, i) => {
                    const isSelected = selectedActions.has(i);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedActions((prev) => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i); else next.add(i);
                            return next;
                          });
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                          border: `1px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                          backgroundColor: isSelected ? colors.coralWash : colors.bgElevated,
                          textAlign: "left", transition: "all 0.2s",
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                          border: `2px solid ${isSelected ? colors.coral : colors.borderDefault}`,
                          backgroundColor: isSelected ? colors.coral : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: colors.bgDeep, fontSize: 12, fontWeight: 700,
                        }}>
                          {isSelected ? "\u2713" : ""}
                        </div>
                        <span style={{ fontSize: 14, color: "#ffffff", fontFamily: body, lineHeight: 1.45 }}>
                          {action}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    placeholder="Or write your own..."
                    style={{
                      flex: 1, padding: "10px 14px", fontSize: 14, fontFamily: body,
                      border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
                      backgroundColor: colors.bgInput, color: colors.textPrimary,
                      outline: "none",
                    }}
                  />
                </div>
                {(selectedActions.size > 0 || customAction.trim()) && (
                  <button
                    onClick={async () => {
                      const actions: string[] = [];
                      selectedActions.forEach((i) => {
                        if (summaryResult.mini_actions?.[i]) actions.push(summaryResult.mini_actions[i]);
                      });
                      if (customAction.trim()) actions.push(customAction.trim());
                      // Save committed actions to session
                      if (session?.id) {
                        const updatedSummary = { ...summaryResult, committed_actions: actions };
                        await supabase
                          .from("daily_sessions")
                          .update({ step_5_summary: updatedSummary })
                          .eq("id", session.id);
                        setSummaryResult(updatedSummary);
                      }
                    }}
                    style={{
                      marginTop: 12, fontFamily: display, fontSize: 13, fontWeight: 600,
                      padding: "10px 24px", borderRadius: 100,
                      backgroundColor: colors.coral, color: colors.bgDeep,
                      border: "none", cursor: "pointer",
                    }}
                  >
                    Commit to {selectedActions.size + (customAction.trim() ? 1 : 0)} action{(selectedActions.size + (customAction.trim() ? 1 : 0)) !== 1 ? "s" : ""}
                  </button>
                )}
                {summaryResult.committed_actions && summaryResult.committed_actions.length > 0 && (
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, backgroundColor: colors.bgElevated }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: colors.coral, margin: "0 0 6px 0", fontFamily: display }}>
                      Committed
                    </p>
                    {summaryResult.committed_actions.map((a, i) => (
                      <p key={i} style={{ fontSize: 14, color: "#ffffff", margin: "0 0 4px 0", fontFamily: body }}>
                        \u2713 {a}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Day rating + feedback */}
            <div style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
              padding: 22,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#ffffff",
                margin: "0 0 14px 0", textTransform: "uppercase",
                letterSpacing: "0.08em", fontFamily: display,
              }}>
                How did you show up today?
              </p>

              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDayRating(dayRating === star ? null : star)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: dayRating && star <= dayRating
                        ? `2px solid ${colors.coral}`
                        : `1px solid ${colors.borderDefault}`,
                      backgroundColor: dayRating && star <= dayRating ? colors.coralWash : colors.bgSurface,
                      color: dayRating && star <= dayRating ? colors.coral : "#ffffff",
                      fontSize: 22,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: display,
                    }}
                  >
                    ★
                  </motion.button>
                ))}
              </div>

              <textarea
                value={dayFeedback}
                onChange={(e) => setDayFeedback(e.target.value)}
                placeholder="Any feedback on today's session? (optional)"
                style={{
                  width: "100%",
                  minHeight: 70,
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.55,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 14,
                  resize: "none",
                  outline: "none",
                  fontFamily: body,
                  boxSizing: "border-box",
                  color: colors.textPrimary,
                  backgroundColor: colors.bgInput,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
              />
            </div>

            {/* Complete day */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={completeDay}
              style={{
                width: "100%",
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 700,
                color: colors.bgDeep,
                backgroundColor: colors.coral,
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: display,
                letterSpacing: "-0.01em",
              }}
            >
              Complete Day {dayNumber}
            </motion.button>
          </div>
        ) : null}
      </DailyStep>

      {/* Free-flow capture widget — removed (ad-hoc journaling moved into Step 2) */}

      {/* Insights prompt modal */}
      <AnimatePresence>
        {showReviewPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                backgroundColor: colors.bgSurface, borderRadius: 14,
                border: `1px solid ${colors.borderDefault}`,
                maxWidth: 420, width: "100%", padding: 32, textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>
                {dayNumber === 30 ? "🎉" : "📋"}
              </div>
              <h2 style={{
                fontFamily: display, fontSize: 22, fontWeight: 700,
                color: colors.textPrimary, margin: "0 0 8px 0",
              }}>
                {dayNumber === 30 ? "Program Complete!" : `Week ${Math.ceil(dayNumber / 7)} Complete`}
              </h2>
              <p style={{
                fontSize: 16, color: "#ffffff", margin: "0 0 24px 0",
                fontFamily: body, lineHeight: 1.6,
              }}>
                {dayNumber === 30
                  ? "You made it through the full program. Take a moment to review your journey and see how far you've come."
                  : "Take a moment to review your progress, check in on your goals, and see what insights emerged this week."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(224, 149, 133, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/weekly-review")}
                  style={{
                    width: "100%", padding: "14px 24px", fontSize: 16, fontWeight: 700,
                    color: colors.bgDeep, backgroundColor: colors.coral,
                    border: "none", borderRadius: 100, cursor: "pointer",
                    fontFamily: display,
                  }}
                >
                  Insights
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/dashboard")}
                  style={{
                    width: "100%", padding: "12px 24px", fontSize: 14, fontWeight: 600,
                    color: "#ffffff", backgroundColor: "transparent",
                    border: `1px solid ${colors.borderDefault}`,
                    borderRadius: 100, cursor: "pointer", fontFamily: display,
                  }}
                >
                  Skip for now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
