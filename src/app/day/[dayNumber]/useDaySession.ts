"use client";

import type { PatternChallengeData } from "@/components/ActivePatternChallenge";
import type { CommitmentCheckInItem } from "@/components/CommitmentCheckIn";
import type { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useSessionCore } from "./hooks/useSessionCore";
import { useStep1Themes } from "./hooks/useStep1Themes";
import { useStep2Journal } from "./hooks/useStep2Journal";
import { useStep3Analysis } from "./hooks/useStep3Analysis";
import { useStep5Summary } from "./hooks/useStep5Summary";

// ── Types (re-exported for consumers) ──

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
  router: ReturnType<typeof import("next/navigation").useRouter>;

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
  patternChallenge: { pattern: string; description: string; challenge: string; counter_move: string } | null;
  setPatternChallenge: React.Dispatch<React.SetStateAction<{ pattern: string; description: string; challenge: string; counter_move: string } | null>>;
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

// ── Composed hook — same public API, split internals ──

export function useDaySession(): UseDaySessionReturn {
  const core = useSessionCore();

  const step1 = useStep1Themes({
    session: core.session,
    setSession: core.setSession,
    enrollment: core.enrollment,
    dayNumber: core.dayNumber,
    supabase: core.supabase,
    restoredThemes: core.restoredThemes,
  });

  const step2 = useStep2Journal({
    session: core.session,
    setSession: core.setSession,
    supabase: core.supabase,
    setActiveTab: core.setActiveTab,
    restoredJournal: core.restoredJournal,
    restoredFollowThrough: core.restoredFollowThrough,
    yesterdayExercise: core.yesterdayExercise,
    onJournalSaved: () => step3.processJournal(),
  });

  const step3 = useStep3Analysis({
    user: core.user,
    session: core.session,
    setSession: core.setSession,
    enrollment: core.enrollment,
    dayNumber: core.dayNumber,
    supabase: core.supabase,
    getFullJournalContent: step2.getFullJournalContent,
    journalContent: step2.journalContent,
    restoredAnalysis: core.restoredAnalysis,
  });

  const step5 = useStep5Summary({
    session: core.session,
    setSession: core.setSession,
    enrollment: core.enrollment,
    dayNumber: core.dayNumber,
    supabase: core.supabase,
    router: core.router,
    setActiveTab: core.setActiveTab,
    restoredSummary: core.restoredSummary,
  });

  return {
    // Core
    user: core.user,
    enrollment: core.enrollment,
    programDay: core.programDay,
    session: core.session,
    loading: core.loading,
    activeTab: core.activeTab,
    setActiveTab: core.setActiveTab,
    dayNumber: core.dayNumber,
    supabase: core.supabase,
    router: core.router,

    // Step 1
    themes: step1.themes,
    setThemes: step1.setThemes,
    loadingThemes: step1.loadingThemes,
    themesError: step1.themesError,
    commitmentResponses: step1.commitmentResponses,
    setCommitmentResponses: step1.setCommitmentResponses,

    // Step 2
    journalContent: step2.journalContent,
    setJournalContent: step2.setJournalContent,
    savingJournal: step2.savingJournal,
    journalSaved: step2.journalSaved,
    journalMode: step2.journalMode,
    setJournalMode: step2.setJournalMode,

    // Yesterday
    yesterdayExercise: core.yesterdayExercise,
    followThrough: step2.followThrough,
    setFollowThrough: step2.setFollowThrough,
    yesterdaySummaryTakeaways: core.yesterdaySummaryTakeaways,

    // Free flow
    freeFlowText: step2.freeFlowText,
    setFreeFlowText: step2.setFreeFlowText,

    // Step 3
    step3Mode: step3.step3Mode,
    setStep3Mode: step3.setStep3Mode,
    stateAnalysis: step3.stateAnalysis,
    setStateAnalysis: step3.setStateAnalysis,
    overflowExercises: step3.overflowExercises,
    setOverflowExercises: step3.setOverflowExercises,
    coachingQuestions: step3.coachingQuestions,
    setCoachingQuestions: step3.setCoachingQuestions,
    questionResponses: step3.questionResponses,
    setQuestionResponses: step3.setQuestionResponses,
    savingResponses: step3.savingResponses,
    responsesSaved: step3.responsesSaved,
    reframe: step3.reframe,
    setReframe: step3.setReframe,
    patternChallenge: step3.patternChallenge,
    setPatternChallenge: step3.setPatternChallenge,
    sequenceSuggestion: step3.sequenceSuggestion,
    processing: step3.processing,
    processError: step3.processError,

    // Step 4
    frameworkAnalysis: step3.frameworkAnalysis,
    loadingFramework: step3.loadingFramework,
    completedExercises: step3.completedExercises,

    // Step 5
    summaryResult: step5.summaryResult,
    setSummaryResult: step5.setSummaryResult,
    loadingSummary: step5.loadingSummary,
    dayRating: step5.dayRating,
    setDayRating: step5.setDayRating,
    dayFeedback: step5.dayFeedback,
    setDayFeedback: step5.setDayFeedback,
    selectedActions: step5.selectedActions,
    setSelectedActions: step5.setSelectedActions,
    customAction: step5.customAction,
    setCustomAction: step5.setCustomAction,

    showReviewPrompt: step5.showReviewPrompt,

    // Crisis
    crisisDetectedStep3: step3.crisisDetectedStep3,
    crisisDetectedStep5: step5.crisisDetectedStep5,
    crisisDismissedStep3: step3.crisisDismissedStep3,
    setCrisisDismissedStep3: step3.setCrisisDismissedStep3,
    crisisDismissedStep5: step5.crisisDismissedStep5,
    setCrisisDismissedStep5: step5.setCrisisDismissedStep5,

    // Helpers
    completedSteps: core.completedSteps,
    weekNames: core.weekNames,
    weekPurpose: core.weekPurpose,
    programSlug: core.programSlug,
    setSession: core.setSession,

    // Actions
    loadThemes: step1.loadThemes,
    saveJournal: step2.saveJournal,
    processJournal: step3.processJournal,
    saveQuestionResponses: step3.saveQuestionResponses,
    generateSummary: step5.generateSummary,
    completeDay: step5.completeDay,
    handleExerciseComplete: step3.handleExerciseComplete,
  };
}
