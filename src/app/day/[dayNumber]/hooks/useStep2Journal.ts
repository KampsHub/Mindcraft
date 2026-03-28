"use client";

import { useState, useEffect } from "react";
import type { DailySession } from "../useDaySession";
import type { createClient } from "@/lib/supabase";

interface UseStep2JournalArgs {
  session: DailySession | null;
  setSession: React.Dispatch<React.SetStateAction<DailySession | null>>;
  supabase: ReturnType<typeof createClient>;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  restoredJournal: string;
  restoredFollowThrough: string;
  yesterdayExercise: { name: string; id: string; whyNow: string; instruction: string; userResponse: string } | null;
  onJournalSaved: () => void;
}

export interface Step2JournalReturn {
  journalContent: string;
  setJournalContent: React.Dispatch<React.SetStateAction<string>>;
  savingJournal: boolean;
  journalSaved: boolean;
  journalMode: "type" | "voice";
  setJournalMode: React.Dispatch<React.SetStateAction<"type" | "voice">>;
  followThrough: string;
  setFollowThrough: React.Dispatch<React.SetStateAction<string>>;
  freeFlowText: string;
  setFreeFlowText: React.Dispatch<React.SetStateAction<string>>;
  saveJournal: () => Promise<void>;
  getFullJournalContent: () => string;
}

export function useStep2Journal({
  session, setSession, supabase, setActiveTab,
  restoredJournal, restoredFollowThrough, yesterdayExercise,
  onJournalSaved,
}: UseStep2JournalArgs): Step2JournalReturn {
  const [journalContent, setJournalContent] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalMode, setJournalMode] = useState<"type" | "voice">("type");
  const [followThrough, setFollowThrough] = useState("");
  const [freeFlowText, setFreeFlowText] = useState("");

  // Restore from existing session
  useEffect(() => {
    if (restoredJournal) {
      setJournalContent(restoredJournal);
      setJournalSaved(true);
    }
    if (restoredFollowThrough) setFollowThrough(restoredFollowThrough);
  }, [restoredJournal, restoredFollowThrough]);

  function getFullJournalContent(): string {
    let fullContent = journalContent;
    if (freeFlowText.trim()) {
      fullContent = `[Free flow]: ${freeFlowText}\n\n${fullContent}`;
    }
    if (followThrough) {
      fullContent = `[Follow-through on yesterday's exercise "${yesterdayExercise?.name}"]: ${followThrough}\n\n${fullContent}`;
    }
    return fullContent;
  }

  async function saveJournal() {
    if (!session || !journalContent.trim()) return;
    setSavingJournal(true);

    const fullJournalContent = getFullJournalContent();

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

    onJournalSaved();
  }

  return {
    journalContent, setJournalContent,
    savingJournal, journalSaved,
    journalMode, setJournalMode,
    followThrough, setFollowThrough,
    freeFlowText, setFreeFlowText,
    saveJournal, getFullJournalContent,
  };
}
