"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { PatternChallengeData } from "@/components/ActivePatternChallenge";
import type { CommitmentCheckInItem } from "@/components/CommitmentCheckIn";

// ── Types ──

export interface ProgramDay {
  id: string;
  day_number: number;
  week_number: number;
  title: string;
  territory: string;
  seed_prompts: { prompt: string; purpose: string; context?: string }[];
  coaching_exercises: { name: string; duration_min: number; custom_framing: string; why_now?: string; why_this_works?: string }[];
  overflow_defaults: { name: string; originator: string; source: string; modality: string; duration_min: number }[];
  micro_content: string;
  system_notes: string;
  is_onboarding: boolean;
}

export interface Enrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  programs: { name: string; slug: string };
}

export interface DailySession {
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

export interface ThemesResult {
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
  yesterday_commitments?: string[];
  yesterday_committed_actions?: string[];
  yesterday_for_tomorrow?: { watch_for?: string; try_this?: string; sit_with?: string } | null;
  active_pattern_challenges?: PatternChallengeData[];
}

export interface OverflowExercise {
  framework_name: string;
  framework_id: string;
  modality: string;
  why_selected: string;
  why_now?: string;
  custom_framing: string;
  instruction?: string;
  estimated_minutes: number;
  originator: string;
  source_work: string;
  why_this_works?: string;
}

export interface StateAnalysis {
  reading?: string;
  emotional_state?: string;
  cognitive_patterns?: string;
  somatic_signals?: string;
  key_themes: string[];
  urgency_level: string;
  goal_connections: string[];
}

export interface FrameworkAnalysis {
  framework_name: string;
  framework_id: string;
  originator: string;
  source_work: string;
  explanation: string;
  application: string;
  reflection_prompt: string;
}

export interface SummaryResult {
  today_themes?: string[];
  summary: string;
  questions_to_sit_with?: string[];
  challenges?: string[];
  exercise_insights: { exercise_name: string; insight: string }[];
  goal_progress: { goal_text: string; observation: string }[];
  tomorrow_preview: { title: string; territory: string; connection: string };
  pattern_note: string | null;
  micro_content?: string;
  mini_actions?: string[];
  committed_actions?: string[];
}

export interface UseDaySessionReturn {
  // Core
  user: User | null;
  enrollment: Enrollment | null;
  programDay: ProgramDay | null;
  session: DailySession | null;
  loading: boolean;
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  dayNumber: number;
  supabase: ReturnType<typeof createClient>;
  router: ReturnType<typeof useRouter>;

  // Step 1
  themes: ThemesResult | null;
  setThemes: React.Dispatch<React.SetStateAction<ThemesResult | null>>;
  loadingThemes: boolean;
  themesError: string | null;
  commitmentResponses: CommitmentCheckInItem[];
  setCommitmentResponses: React.Dispatch<React.SetStateAction<CommitmentCheckInItem[]>>;

  // Step 2
  journalContent: string;
  setJournalContent: React.Dispatch<React.SetStateAction<string>>;
  savingJournal: boolean;
  journalSaved: boolean;
  journalMode: "type" | "voice";
  setJournalMode: React.Dispatch<React.SetStateAction<"type" | "voice">>;

  // Exercise follow-through
  yesterdayExercise: { name: string; id: string; whyNow: string; instruction: string; userResponse: string } | null;
  followThrough: string;
  setFollowThrough: React.Dispatch<React.SetStateAction<string>>;

  // Yesterday's summary takeaways
  yesterdaySummaryTakeaways: {
    questions_to_sit_with: string[];
    challenges: string[];
    committed_actions: string[];
  } | null;

  // Free flow
  freeFlowText: string;
  setFreeFlowText: React.Dispatch<React.SetStateAction<string>>;

  // Step 3
  step3Mode: "form" | "chat";
  setStep3Mode: React.Dispatch<React.SetStateAction<"form" | "chat">>;
  stateAnalysis: StateAnalysis | null;
  setStateAnalysis: React.Dispatch<React.SetStateAction<StateAnalysis | null>>;
  overflowExercises: OverflowExercise[];
  setOverflowExercises: React.Dispatch<React.SetStateAction<OverflowExercise[]>>;
  coachingQuestions: string[];
  setCoachingQuestions: React.Dispatch<React.SetStateAction<string[]>>;
  questionResponses: Record<number, string>;
  setQuestionResponses: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  savingResponses: boolean;
  responsesSaved: boolean;
  reframe: { old_thought: string; new_thought: string; source_quote: string } | null;
  setReframe: React.Dispatch<React.SetStateAction<{ old_thought: string; new_thought: string; source_quote: string } | null>>;
  patternChallenge: { pattern: string; challenge: string; counter_move: string } | null;
  setPatternChallenge: React.Dispatch<React.SetStateAction<{ pattern: string; challenge: string; counter_move: string } | null>>;
  sequenceSuggestion: string | null;
  processing: boolean;
  processError: string | null;

  // Step 4
  frameworkAnalysis: FrameworkAnalysis | null;
  loadingFramework: boolean;
  completedExercises: Set<string>;

  // Step 5
  summaryResult: SummaryResult | null;
  setSummaryResult: React.Dispatch<React.SetStateAction<SummaryResult | null>>;
  loadingSummary: boolean;
  dayRating: number | null;
  setDayRating: React.Dispatch<React.SetStateAction<number | null>>;
  dayFeedback: string;
  setDayFeedback: React.Dispatch<React.SetStateAction<string>>;
  selectedActions: Set<number>;
  setSelectedActions: React.Dispatch<React.SetStateAction<Set<number>>>;
  customAction: string;
  setCustomAction: React.Dispatch<React.SetStateAction<string>>;

  // Review prompt
  showReviewPrompt: boolean;

  // Crisis
  crisisDetectedStep3: boolean;
  crisisDetectedStep5: boolean;
  crisisDismissedStep3: boolean;
  setCrisisDismissedStep3: React.Dispatch<React.SetStateAction<boolean>>;
  crisisDismissedStep5: boolean;
  setCrisisDismissedStep5: React.Dispatch<React.SetStateAction<boolean>>;

  // Helpers
  completedSteps: number[];
  weekNames: string[];
  weekPurpose: string;
  programSlug: string;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;

  // Actions
  loadThemes: () => Promise<void>;
  saveJournal: () => Promise<void>;
  processJournal: () => Promise<void>;
  saveQuestionResponses: () => Promise<void>;
  generateSummary: () => Promise<void>;
  completeDay: () => Promise<void>;
  handleExerciseComplete: (
    name: string,
    type: "coaching_plan" | "overflow" | "framework_analysis",
    modality: string | undefined,
    responses: Record<string, string>,
    rating: number | null,
    customFraming?: string,
    frameworkId?: string,
  ) => Promise<void>;
}

export function useDaySession(): UseDaySessionReturn {
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
  const [activeTab, setActiveTab] = useState(1);

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

  // Exercise follow-through from yesterday
  const [yesterdayExercise, setYesterdayExercise] = useState<{ name: string; id: string; whyNow: string; instruction: string; userResponse: string } | null>(null);
  const [followThrough, setFollowThrough] = useState("");

  // Yesterday's summary takeaways (from Done tab)
  const [yesterdaySummaryTakeaways, setYesterdaySummaryTakeaways] = useState<{
    questions_to_sit_with: string[];
    challenges: string[];
    committed_actions: string[];
  } | null>(null);

  // Free flow text (quick thoughts before journaling)
  const [freeFlowText, setFreeFlowText] = useState("");

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
      // Extract follow-through from saved journal if present
      const savedJournal = existingSession.step_2_journal || "";
      const followThroughMatch = savedJournal.match(/^\[Follow-through on yesterday's exercise "([^"]+)"\]: ([^\n]+)\n\n/);
      if (followThroughMatch) {
        setFollowThrough(followThroughMatch[2]);
        setJournalContent(savedJournal.replace(followThroughMatch[0], ""));
      } else {
        setJournalContent(savedJournal);
      }
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
      // Set active tab based on completed steps
      const nextStep = [1, 2, 3, 4, 5].find((s) => !steps.includes(s)) || 5;
      const stepToTab: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3 };
      setActiveTab(stepToTab[nextStep] || 1);
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

    // Fetch yesterday's exercise for follow-through + summary takeaways
    if (dayNumber > 1) {
      const { data: yesterdaySession } = await supabase
        .from("daily_sessions")
        .select("id, step_3_analysis, step_5_summary")
        .eq("enrollment_id", enr.id)
        .eq("day_number", dayNumber - 1)
        .single();

      if (yesterdaySession?.step_3_analysis) {
        const analysis = yesterdaySession.step_3_analysis as Record<string, unknown>;
        const exercises = (analysis.overflow_exercises || []) as { framework_name: string; framework_id?: string; why_now?: string; why_selected?: string; instruction?: string; custom_framing?: string }[];
        if (exercises.length > 0) {
          const ex = exercises[0];

          // Also fetch what the user responded with
          let userResponse = "";
          const { data: completion } = await supabase
            .from("exercise_completions")
            .select("responses")
            .eq("daily_session_id", yesterdaySession.id)
            .eq("framework_id", ex.framework_id || "")
            .maybeSingle();
          if (completion?.responses) {
            const resp = completion.responses as Record<string, string>;
            const firstResponse = Object.values(resp).find((v) => v && v.length > 0);
            if (firstResponse) userResponse = firstResponse.substring(0, 200);
          }

          setYesterdayExercise({
            name: ex.framework_name,
            id: ex.framework_id || "",
            whyNow: ex.why_now || ex.why_selected || "",
            instruction: ex.instruction || ex.custom_framing || "",
            userResponse,
          });
        }
      }

      // Extract summary takeaways from yesterday's Done tab
      if (yesterdaySession?.step_5_summary) {
        const summary = yesterdaySession.step_5_summary as Record<string, unknown>;
        const questions = (summary.questions_to_sit_with as string[]) || [];
        const challenges = (summary.challenges as string[]) || [];
        const committed = (summary.committed_actions as string[]) || [];
        if (questions.length > 0 || challenges.length > 0 || committed.length > 0) {
          setYesterdaySummaryTakeaways({
            questions_to_sit_with: questions,
            challenges,
            committed_actions: committed,
          });
        }
      }
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumber]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) { router.push("/login"); return; }
      setUser(u);
      loadData(u.id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1: Load themes ──
  async function loadThemes() {
    if (!enrollment || !session) return;
    setLoadingThemes(true);
    setThemesError(null);

    try {
      // Check if themes were prefetched
      if (session.step_1_themes && typeof session.step_1_themes === "object" && "thread" in (session.step_1_themes as Record<string, unknown>)) {
        setThemes(session.step_1_themes as unknown as ThemesResult);
        if (!session.completed_steps?.includes(1)) {
          await supabase
            .from("daily_sessions")
            .update({ completed_steps: [...(session.completed_steps || []), 1] })
            .eq("id", session.id);
          setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
        }
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

        await supabase
          .from("daily_sessions")
          .update({
            step_1_themes: data,
            completed_steps: [...(session.completed_steps || []), 1],
          })
          .eq("id", session.id);

        setSession((prev) => prev ? { ...prev, completed_steps: [...(prev.completed_steps || []), 1] } : prev);
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

    let fullJournalContent = journalContent;
    if (freeFlowText.trim()) {
      fullJournalContent = `[Free flow]: ${freeFlowText}\n\n${fullJournalContent}`;
    }
    if (followThrough) {
      fullJournalContent = `[Follow-through on yesterday's exercise "${yesterdayExercise?.name}"]: ${followThrough}\n\n${fullJournalContent}`;
    }

    await supabase
      .from("daily_sessions")
      .update({
        step_2_journal: fullJournalContent,
        completed_steps: [...new Set([...(session.completed_steps || []), 2])],
      })
      .eq("id", session.id);

    setSession((prev) => prev ? {
      ...prev,
      step_2_journal: fullJournalContent,
      completed_steps: [...new Set([...(prev.completed_steps || []), 2])],
    } : prev);
    setJournalSaved(true);
    setSavingJournal(false);
    setActiveTab(2);

    // Fire-and-forget sentiment analysis
    if (session?.id) {
      fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, content: fullJournalContent }),
      }).catch((err) => console.warn("Non-blocking API call failed:", err));
    }

    // Auto-trigger Step 3 processing
    processJournal();
  }

  // ── Step 3: Process journal ──
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
      let fullContent = journalContent;
      if (freeFlowText.trim()) {
        fullContent = `[Free flow]: ${freeFlowText}\n\n${fullContent}`;
      }
      if (followThrough) {
        fullContent = `[Follow-through on yesterday's exercise "${yesterdayExercise?.name}"]: ${followThrough}\n\n${fullContent}`;
      }

      const res = await fetch("/api/process-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
          dayNumber,
          journalContent: fullContent,
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

      const isHighUrgency = data.state_analysis?.urgency_level === "high";
      if (isHighUrgency) {
        setCrisisDetectedStep3(true);
        fetch("/api/crisis-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            dayNumber,
            source: "process-journal",
            action: "detected",
          }),
        }).catch((err) => console.warn("Non-blocking API call failed:", err));
      }

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
    frameworkId?: string,
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

        const summaryText = (data.summary || "") + (data.pattern_note || "");
        const hasCrisisContent =
          summaryText.includes("988") ||
          summaryText.includes("741741") ||
          summaryText.includes("Crisis Lifeline") ||
          summaryText.includes("beyond what exercises can hold");
        if (hasCrisisContent) {
          setCrisisDetectedStep5(true);
          fetch("/api/crisis-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enrollmentId: enrollment.id,
              dayNumber,
              source: "daily-summary",
              action: "detected",
            }),
          }).catch((err) => console.warn("Non-blocking API call failed:", err));
        }

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
        setActiveTab(3);
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
  const weekPurposes: Record<string, string[]> = {
    parachute: [
      "This week is about naming what happened and getting your feet under you.",
      "This week is about understanding the patterns underneath your reactions.",
      "This week is about rebuilding from what's actually true.",
      "This week is about pointing yourself forward with clarity.",
    ],
    jetstream: [
      "This week is about stabilizing and seeing the situation clearly.",
      "This week is about understanding what's yours and what isn't.",
      "This week is about building your response strategy.",
      "This week is about deciding your next move from a grounded place.",
    ],
    basecamp: [
      "This week is about arriving and noticing what you brought with you.",
      "This week is about understanding how you show up under pressure.",
      "This week is about building confidence from the inside out.",
      "This week is about owning your place and stopping the audition.",
    ],
  };
  const programSlug = enrollment?.programs?.slug || "parachute";
  const weekPurpose = weekPurposes[programSlug]?.[programDay?.week_number ? programDay.week_number - 1 : 0] || "";

  return {
    user,
    enrollment,
    programDay,
    session,
    loading,
    activeTab,
    setActiveTab,
    dayNumber,
    supabase,
    router,

    themes,
    setThemes,
    loadingThemes,
    themesError,
    commitmentResponses,
    setCommitmentResponses,

    journalContent,
    setJournalContent,
    savingJournal,
    journalSaved,
    journalMode,
    setJournalMode,

    yesterdayExercise,
    followThrough,
    setFollowThrough,

    yesterdaySummaryTakeaways,

    freeFlowText,
    setFreeFlowText,

    step3Mode,
    setStep3Mode,
    stateAnalysis,
    setStateAnalysis,
    overflowExercises,
    setOverflowExercises,
    coachingQuestions,
    setCoachingQuestions,
    questionResponses,
    setQuestionResponses,
    savingResponses,
    responsesSaved,
    reframe,
    setReframe,
    patternChallenge,
    setPatternChallenge,
    sequenceSuggestion,
    processing,
    processError,

    frameworkAnalysis,
    loadingFramework,
    completedExercises,

    summaryResult,
    setSummaryResult,
    loadingSummary,
    dayRating,
    setDayRating,
    dayFeedback,
    setDayFeedback,
    selectedActions,
    setSelectedActions,
    customAction,
    setCustomAction,

    showReviewPrompt,

    crisisDetectedStep3,
    crisisDetectedStep5,
    crisisDismissedStep3,
    setCrisisDismissedStep3,
    crisisDismissedStep5,
    setCrisisDismissedStep5,

    completedSteps,
    weekNames,
    weekPurpose,
    programSlug,
    setSession,

    loadThemes,
    saveJournal,
    processJournal,
    saveQuestionResponses,
    generateSummary,
    completeDay,
    handleExerciseComplete,
  };
}
