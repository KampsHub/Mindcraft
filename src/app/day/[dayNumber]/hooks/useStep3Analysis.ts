"use client";

import { useState, useEffect } from "react";
import type {
  DailySession,
  Enrollment,
  StateAnalysis,
  OverflowExercise,
  FrameworkAnalysis,
} from "../useDaySession";
import type { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { SessionCoreReturn } from "./useSessionCore";

interface UseStep3AnalysisArgs {
  user: User | null;
  session: DailySession | null;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;
  enrollment: Enrollment | null;
  dayNumber: number;
  supabase: ReturnType<typeof createClient>;
  getFullJournalContent: () => string;
  journalContent: string;
  restoredAnalysis: SessionCoreReturn["restoredAnalysis"];
}

export interface Step3AnalysisReturn {
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
  frameworkAnalysis: FrameworkAnalysis | null;
  loadingFramework: boolean;
  completedExercises: Set<string>;
  crisisDetectedStep3: boolean;
  crisisDismissedStep3: boolean;
  setCrisisDismissedStep3: React.Dispatch<React.SetStateAction<boolean>>;
  processJournal: () => Promise<void>;
  saveQuestionResponses: () => Promise<void>;
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

export function useStep3Analysis({
  user, session, setSession, enrollment, dayNumber, supabase,
  getFullJournalContent, journalContent, restoredAnalysis,
}: UseStep3AnalysisArgs): Step3AnalysisReturn {
  const [step3Mode, setStep3Mode] = useState<"form" | "chat">("form");
  const [stateAnalysis, setStateAnalysis] = useState<StateAnalysis | null>(null);
  const [overflowExercises, setOverflowExercises] = useState<OverflowExercise[]>([]);
  const [coachingQuestions, setCoachingQuestions] = useState<string[]>([]);
  const [questionResponses, setQuestionResponses] = useState<Record<number, string>>({});
  const [savingResponses, setSavingResponses] = useState(false);
  const [responsesSaved, setResponsesSaved] = useState(false);
  const [reframe, setReframe] = useState<{ old_thought: string; new_thought: string; source_quote: string } | null>(null);
  const [patternChallenge, setPatternChallenge] = useState<{ pattern: string; description: string; challenge: string; counter_move: string } | null>(null);
  const [sequenceSuggestion, setSequenceSuggestion] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Step 4
  const [frameworkAnalysis, setFrameworkAnalysis] = useState<FrameworkAnalysis | null>(null);
  const [loadingFramework, setLoadingFramework] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  // Crisis
  const [crisisDetectedStep3, setCrisisDetectedStep3] = useState(false);
  const [crisisDismissedStep3, setCrisisDismissedStep3] = useState(false);

  // Restore from existing session
  useEffect(() => {
    if (restoredAnalysis) {
      setStateAnalysis(restoredAnalysis.stateAnalysis);
      setOverflowExercises(restoredAnalysis.overflowExercises);
      setCoachingQuestions(restoredAnalysis.coachingQuestions);
      setReframe(restoredAnalysis.reframe);
      setPatternChallenge(restoredAnalysis.patternChallenge);
      setSequenceSuggestion(restoredAnalysis.sequenceSuggestion);
      if (restoredAnalysis.crisisStep3) setCrisisDetectedStep3(true);
    }
  }, [restoredAnalysis]);

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
      const fullContent = getFullJournalContent();

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
      setProcessError("We couldn't process your journal right now. This is usually temporary — wait a moment and try again. If it keeps happening, try refreshing the page.");
    }
    setProcessing(false);
  }

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

  async function handleExerciseComplete(
    name: string,
    type: "coaching_plan" | "overflow" | "framework_analysis",
    modality: string | undefined,
    responses: Record<string, string>,
    rating: number | null,
    customFraming?: string,
    frameworkId?: string,
  ) {
    if (!session || !enrollment) return undefined;
    try {
      const { data, error } = await supabase.from("exercise_completions").insert({
        daily_session_id: session.id,
        enrollment_id: enrollment.id,
        framework_name: name,
        framework_id: frameworkId || null,
        exercise_type: type,
        modality: modality || null,
        custom_framing: customFraming || null,
        responses,
        star_rating: rating,
      }).select("id").single();
      if (error) {
        console.error("Exercise save error:", error);
        setProcessError("Your exercise response couldn\u2019t be saved. Check your connection and try again.");
        return undefined;
      }
      setCompletedExercises((prev) => new Set(prev).add(name));

      // Fire-and-forget: log observation for AI personalization
      if (responses._skipped !== "true") {
        fetch("/api/log-observation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
            dayNumber: session.day_number,
            exerciseName: name,
            modality: modality || null,
            rating,
          }),
        }).catch(() => {});
      }

      return data?.id;
    } catch (err) {
      console.error("Exercise save error:", err);
      setProcessError("Your exercise response couldn\u2019t be saved. Check your connection and try again.");
      return undefined;
    }
  }

  return {
    step3Mode, setStep3Mode,
    stateAnalysis, setStateAnalysis,
    overflowExercises, setOverflowExercises,
    coachingQuestions, setCoachingQuestions,
    questionResponses, setQuestionResponses,
    savingResponses, responsesSaved,
    reframe, setReframe,
    patternChallenge, setPatternChallenge,
    sequenceSuggestion,
    processing, processError,
    frameworkAnalysis, loadingFramework, completedExercises,
    crisisDetectedStep3, crisisDismissedStep3, setCrisisDismissedStep3,
    processJournal, saveQuestionResponses, handleExerciseComplete,
  };
}
