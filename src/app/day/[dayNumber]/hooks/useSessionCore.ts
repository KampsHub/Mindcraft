"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { PatternChallengeData } from "@/components/ActivePatternChallenge";
import type {
  Enrollment,
  ProgramDay,
  DailySession,
  ThemesResult,
  StateAnalysis,
  OverflowExercise,
  SummaryResult,
} from "../useDaySession";

export interface SessionCoreReturn {
  user: User | null;
  enrollment: Enrollment | null;
  programDay: ProgramDay | null;
  session: DailySession | null;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;
  loading: boolean;
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  dayNumber: number;
  supabase: ReturnType<typeof createClient>;
  router: ReturnType<typeof useRouter>;
  completedSteps: number[];
  weekNames: string[];
  weekPurpose: string;
  programSlug: string;
  // Restored state from existing session
  restoredThemes: ThemesResult | null;
  restoredJournal: string;
  restoredFollowThrough: string;
  restoredAnalysis: {
    stateAnalysis: StateAnalysis | null;
    overflowExercises: OverflowExercise[];
    coachingQuestions: string[];
    reframe: { old_thought: string; new_thought: string; source_quote: string } | null;
    patternChallenge: { pattern: string; challenge: string; counter_move: string } | null;
    sequenceSuggestion: string | null;
    crisisStep3: boolean;
  } | null;
  restoredSummary: {
    summaryResult: SummaryResult;
    crisisStep5: boolean;
  } | null;
  // Yesterday context
  yesterdayExercise: { name: string; id: string; whyNow: string; instruction: string; userResponse: string } | null;
  yesterdaySummaryTakeaways: {
    questions_to_sit_with: string[];
    challenges: string[];
    committed_actions: string[];
  } | null;
}

export function useSessionCore(): SessionCoreReturn {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const dayNumber = parseInt(params.dayNumber as string, 10);
  const enrollmentParam = searchParams.get("enrollment");

  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [programDay, setProgramDay] = useState<ProgramDay | null>(null);
  const [session, setSession] = useState<DailySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);

  // Restored state (set once during load, consumed by sub-hooks)
  const [restoredThemes, setRestoredThemes] = useState<ThemesResult | null>(null);
  const [restoredJournal, setRestoredJournal] = useState("");
  const [restoredFollowThrough, setRestoredFollowThrough] = useState("");
  const [restoredAnalysis, setRestoredAnalysis] = useState<SessionCoreReturn["restoredAnalysis"]>(null);
  const [restoredSummary, setRestoredSummary] = useState<SessionCoreReturn["restoredSummary"]>(null);

  // Yesterday context
  const [yesterdayExercise, setYesterdayExercise] = useState<SessionCoreReturn["yesterdayExercise"]>(null);
  const [yesterdaySummaryTakeaways, setYesterdaySummaryTakeaways] = useState<SessionCoreReturn["yesterdaySummaryTakeaways"]>(null);

  const loadData = useCallback(async (userId: string) => {
    // Fetch enrollment
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
      // Extract follow-through from saved journal
      const savedJournal = existingSession.step_2_journal || "";
      const followThroughMatch = savedJournal.match(/^\[Follow-through on yesterday's exercise "([^"]+)"\]: ([^\n]+)\n\n/);
      if (followThroughMatch) {
        setRestoredFollowThrough(followThroughMatch[2]);
        setRestoredJournal(savedJournal.replace(followThroughMatch[0], ""));
      } else {
        setRestoredJournal(savedJournal);
      }

      const steps = existingSession.completed_steps || [];
      if (steps.includes(1)) setRestoredThemes(existingSession.step_1_themes as unknown as ThemesResult);
      if (steps.includes(3)) {
        const analysis = existingSession.step_3_analysis as Record<string, unknown>;
        const restoredStateAnalysis = analysis?.state_analysis as StateAnalysis;
        setRestoredAnalysis({
          stateAnalysis: restoredStateAnalysis,
          overflowExercises: (analysis?.overflow_exercises || []) as OverflowExercise[],
          coachingQuestions: (analysis?.coaching_questions || []) as string[],
          reframe: (analysis?.reframe || null) as { old_thought: string; new_thought: string; source_quote: string } | null,
          patternChallenge: (analysis?.pattern_challenge || null) as { pattern: string; challenge: string; counter_move: string } | null,
          sequenceSuggestion: (analysis?.sequence_suggestion || null) as string | null,
          crisisStep3: restoredStateAnalysis?.urgency_level === "high",
        });
      }
      if (steps.includes(5)) {
        const restoredSummaryData = existingSession.step_5_summary as unknown as SummaryResult;
        const summaryText = (restoredSummaryData?.summary || "") + (restoredSummaryData?.pattern_note || "");
        setRestoredSummary({
          summaryResult: restoredSummaryData,
          crisisStep5:
            summaryText.includes("988") ||
            summaryText.includes("741741") ||
            summaryText.includes("Crisis Lifeline") ||
            summaryText.includes("beyond what exercises can hold"),
        });
      }

      // On Day 1, auto-complete step 1
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
    } else {
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

    // Fetch yesterday's data
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

      if (yesterdaySession?.step_5_summary) {
        const summary = yesterdaySession.step_5_summary as Record<string, unknown>;
        const questions = (summary.questions_to_sit_with as string[]) || [];
        const challenges = (summary.challenges as string[]) || [];
        const committed = (summary.committed_actions as string[]) || [];
        if (questions.length > 0 || challenges.length > 0 || committed.length > 0) {
          setYesterdaySummaryTakeaways({ questions_to_sit_with: questions, challenges, committed_actions: committed });
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

  // Helpers
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
    user, enrollment, programDay, session, setSession,
    loading, activeTab, setActiveTab, dayNumber, supabase, router,
    completedSteps, weekNames, weekPurpose, programSlug,
    restoredThemes, restoredJournal, restoredFollowThrough,
    restoredAnalysis, restoredSummary,
    yesterdayExercise, yesterdaySummaryTakeaways,
  };
}
