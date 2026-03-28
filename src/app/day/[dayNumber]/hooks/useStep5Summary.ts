"use client";

import { useState, useEffect } from "react";
import type { DailySession, Enrollment, SummaryResult } from "../useDaySession";
import type { createClient } from "@/lib/supabase";
import type { SessionCoreReturn } from "./useSessionCore";
import { useRouter } from "next/navigation";

interface UseStep5SummaryArgs {
  session: DailySession | null;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;
  enrollment: Enrollment | null;
  dayNumber: number;
  supabase: ReturnType<typeof createClient>;
  router: ReturnType<typeof useRouter>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  restoredSummary: SessionCoreReturn["restoredSummary"];
}

export interface Step5SummaryReturn {
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
  showReviewPrompt: boolean;
  crisisDetectedStep5: boolean;
  crisisDismissedStep5: boolean;
  setCrisisDismissedStep5: React.Dispatch<React.SetStateAction<boolean>>;
  generateSummary: () => Promise<void>;
  completeDay: () => Promise<void>;
}

export function useStep5Summary({
  session, setSession, enrollment, dayNumber, supabase, router, setActiveTab,
  restoredSummary,
}: UseStep5SummaryArgs): Step5SummaryReturn {
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [dayFeedback, setDayFeedback] = useState("");
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());
  const [customAction, setCustomAction] = useState("");
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [crisisDetectedStep5, setCrisisDetectedStep5] = useState(false);
  const [crisisDismissedStep5, setCrisisDismissedStep5] = useState(false);

  // Restore from existing session
  useEffect(() => {
    if (restoredSummary) {
      setSummaryResult(restoredSummary.summaryResult);
      if (restoredSummary.crisisStep5) setCrisisDetectedStep5(true);
    }
  }, [restoredSummary]);

  const REVIEW_DAYS = [7, 14, 21, 30];

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

  return {
    summaryResult, setSummaryResult, loadingSummary,
    dayRating, setDayRating,
    dayFeedback, setDayFeedback,
    selectedActions, setSelectedActions,
    customAction, setCustomAction,
    showReviewPrompt,
    crisisDetectedStep5, crisisDismissedStep5, setCrisisDismissedStep5,
    generateSummary, completeDay,
  };
}
