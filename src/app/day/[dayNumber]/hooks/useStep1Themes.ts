"use client";

import { useState, useEffect } from "react";
import type { ThemesResult, DailySession, Enrollment } from "../useDaySession";
import type { CommitmentCheckInItem } from "@/components/CommitmentCheckIn";
import type { createClient } from "@/lib/supabase";

interface UseStep1ThemesArgs {
  session: DailySession | null;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;
  enrollment: Enrollment | null;
  dayNumber: number;
  supabase: ReturnType<typeof createClient>;
  restoredThemes: ThemesResult | null;
}

export interface Step1ThemesReturn {
  themes: ThemesResult | null;
  setThemes: React.Dispatch<React.SetStateAction<ThemesResult | null>>;
  loadingThemes: boolean;
  themesError: string | null;
  commitmentResponses: CommitmentCheckInItem[];
  setCommitmentResponses: React.Dispatch<React.SetStateAction<CommitmentCheckInItem[]>>;
  loadThemes: () => Promise<void>;
}

export function useStep1Themes({
  session, setSession, enrollment, dayNumber, supabase, restoredThemes,
}: UseStep1ThemesArgs): Step1ThemesReturn {
  const [themes, setThemes] = useState<ThemesResult | null>(null);
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [themesError, setThemesError] = useState<string | null>(null);
  const [commitmentResponses, setCommitmentResponses] = useState<CommitmentCheckInItem[]>([]);

  // Restore themes from existing session
  useEffect(() => {
    if (restoredThemes) setThemes(restoredThemes);
  }, [restoredThemes]);

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

  return {
    themes, setThemes, loadingThemes, themesError,
    commitmentResponses, setCommitmentResponses, loadThemes,
  };
}
