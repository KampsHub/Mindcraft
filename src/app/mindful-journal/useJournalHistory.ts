"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface JournalHistoryEntry {
  date: string;
  nervousSystem: number;
  emotionCount: number;
  needCount: number;
  bodyZoneCount: number;
  wordCount: number;
}

interface WeekComparison {
  thisWeek: {
    avgNervousSystem: number;
    topEmotions: string[];
    topNeeds: string[];
  };
  lastWeek: {
    avgNervousSystem: number;
    topEmotions: string[];
    topNeeds: string[];
  } | null;
}

function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function topN(items: string[], n = 3): string[] {
  const freq: Record<string, number> = {};
  for (const item of items) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
}

function parseEntry(row: {
  created_at: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
}): JournalHistoryEntry {
  const checklist =
    (row.metadata?.nvc_checklist as Record<string, unknown> | undefined) ?? {};

  const nervousSystem =
    typeof checklist.nervousSystem === "number" ? checklist.nervousSystem : 5;

  const emotions = Array.isArray(checklist.emotions)
    ? checklist.emotions
    : [];
  const needs = Array.isArray(checklist.needs) ? checklist.needs : [];
  const bodyMarkers = Array.isArray(checklist.body_markers)
    ? checklist.body_markers
    : [];

  return {
    date: row.created_at.slice(0, 10),
    nervousSystem,
    emotionCount: emotions.length,
    needCount: needs.length,
    bodyZoneCount: bodyMarkers.length,
    wordCount: countWords(row.content),
  };
}

function computeWeekStats(
  rows: {
    metadata: Record<string, unknown> | null;
  }[]
): {
  avgNervousSystem: number;
  topEmotions: string[];
  topNeeds: string[];
} {
  const allEmotions: string[] = [];
  const allNeeds: string[] = [];
  let nsSum = 0;
  let nsCount = 0;

  for (const row of rows) {
    const checklist =
      (row.metadata?.nvc_checklist as Record<string, unknown> | undefined) ??
      {};

    if (typeof checklist.nervousSystem === "number") {
      nsSum += checklist.nervousSystem;
      nsCount++;
    }

    if (Array.isArray(checklist.emotions)) {
      allEmotions.push(...(checklist.emotions as string[]));
    }
    if (Array.isArray(checklist.needs)) {
      allNeeds.push(...(checklist.needs as string[]));
    }
  }

  return {
    avgNervousSystem: nsCount > 0 ? Math.round((nsSum / nsCount) * 10) / 10 : 0,
    topEmotions: topN(allEmotions),
    topNeeds: topN(allNeeds),
  };
}

export function useJournalHistory(userId: string | null) {
  const [entries, setEntries] = useState<JournalHistoryEntry[]>([]);
  const [weekComparison, setWeekComparison] = useState<WeekComparison | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("entries")
        .select("created_at, content, metadata")
        .eq("user_id", userId)
        .eq("metadata->>source", "mindful_journal")
        .order("created_at", { ascending: false })
        .limit(14);

      if (cancelled) return;

      if (error || !data) {
        setLoading(false);
        return;
      }

      const parsed = data.map(parseEntry);
      const thisWeekEntries = parsed.slice(0, 7);
      const lastWeekEntries = parsed.slice(7, 14);

      setEntries(thisWeekEntries);

      if (thisWeekEntries.length > 0) {
        const thisWeekRows = data.slice(0, 7);
        const lastWeekRows = data.slice(7, 14);

        setWeekComparison({
          thisWeek: computeWeekStats(thisWeekRows),
          lastWeek:
            lastWeekRows.length > 0 ? computeWeekStats(lastWeekRows) : null,
        });
      }

      setLoading(false);
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { entries, weekComparison, loading };
}
