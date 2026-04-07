/**
 * Client-side analytics helpers.
 *
 * Responsibilities:
 *   - Compute days since last activity (for inactivity-gap detection)
 *   - Fire return_visit_dN and inactivity_Nd events on session start
 *   - Own the localStorage key that tracks last-seen timestamp as a fallback
 *   - Provide small pure helpers (weekOf, daysBetween) used by multiple callers
 *
 * All functions are safe to call from the server — they no-op if window is undefined.
 */

import { trackEvent } from "@/components/GoogleAnalytics";

const LAST_SEEN_KEY = "mc-last-seen-ts";
const SESSION_FIRED_KEY = "mc-session-start-fired";

/** Days between two dates, floored. Returns 0 if either is null/undefined. */
export function daysBetween(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): number {
  if (!a || !b) return 0;
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  const diff = Math.abs(db.getTime() - da.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function daysSince(date: Date | string | null | undefined): number {
  if (!date) return 0;
  return daysBetween(date, new Date());
}

/** ISO week string like "2026-W14" for cohort grouping. */
export function weekOf(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  // Shift to Thursday in current week (ISO week definition)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Read the locally-cached last-seen timestamp. Server-safe (returns null). */
export function readLastSeen(): Date | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY);
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** Bump the locally-cached last-seen timestamp to now. */
export function touchLastSeen() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
  } catch {
    // localStorage quota / private mode — silent no-op
  }
}

/**
 * Fire return_visit_dN and inactivity_Nd events based on the gap between
 * `lastActiveAt` (from the enrollment row) and now.
 *
 * Returns the computed gap so callers can persist updates (had_3d_gap etc).
 */
export function trackInactivityGap(params: {
  lastActiveAt: Date | string | null | undefined;
  program: string;
  lastDayNumber?: number;
}): { gapDays: number; crossed3d: boolean; crossed7d: boolean; crossed14d: boolean } {
  const { lastActiveAt, program, lastDayNumber } = params;
  const gapDays = daysSince(lastActiveAt);
  const base = {
    program,
    days_inactive: gapDays,
    last_day_number: lastDayNumber ?? 0,
  };

  const crossed3d = gapDays >= 3;
  const crossed7d = gapDays >= 7;
  const crossed14d = gapDays >= 14;

  if (gapDays >= 1) trackEvent("return_visit_d1", base);
  if (crossed3d) {
    trackEvent("return_visit_d3", base);
    trackEvent("inactivity_3d", base);
  }
  if (crossed7d) {
    trackEvent("return_visit_d7", base);
    trackEvent("inactivity_7d", base);
  }
  if (crossed14d) {
    trackEvent("return_visit_d14", base);
    trackEvent("inactivity_14d", base);
  }

  return { gapDays, crossed3d, crossed7d, crossed14d };
}

/**
 * Once per browser session, mark that session_start has been fired so we don't
 * double-fire on dashboard re-renders. Uses sessionStorage so it resets per tab.
 */
export function hasFiredSessionStart(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_FIRED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionStartFired() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_FIRED_KEY, "1");
  } catch {
    // no-op
  }
}
