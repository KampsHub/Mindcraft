"use client";

/**
 * Mount once per authenticated page load. Responsibilities:
 *   1. Set GA4 user_id from Supabase auth
 *   2. Set GA4 user properties (cohort segmentation)
 *   3. Fire session_start
 *   4. Detect inactivity gaps and fire return_visit_dN / inactivity_Nd
 *   5. Persist the browser's GA client_id onto the current enrollment so the
 *      nightly dropout cron and Stripe webhook can fire server-side events
 *      against the correct user.
 *
 * This component renders nothing.
 */

import { useEffect, useRef } from "react";
import {
  trackEvent,
  setUserId,
  setUserProperties,
  getGaClientId,
} from "@/components/GoogleAnalytics";
import {
  daysSince,
  weekOf,
  touchLastSeen,
  trackInactivityGap,
  hasFiredSessionStart,
  markSessionStartFired,
} from "@/lib/analytics";

type EnrollmentLite = {
  id: string;
  status: string;
  current_day: number | null;
  started_at: string | null;
  last_active_at: string | null;
  had_3d_gap?: boolean | null;
  had_7d_gap?: boolean | null;
  programs?: { slug?: string | null } | null;
};

interface Props {
  userId: string | null;
  enrollment: EnrollmentLite | null;
  programsCompletedCount?: number;
}

export default function AnalyticsSessionBoundary({
  userId,
  enrollment,
  programsCompletedCount = 0,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (hasFiredSessionStart()) return;

    const program = enrollment?.programs?.slug ?? "none";
    const daysSincePurchase = enrollment?.started_at
      ? daysSince(enrollment.started_at)
      : 0;
    const daysSinceLastActivity = enrollment?.last_active_at
      ? daysSince(enrollment.last_active_at)
      : 0;
    const cohort = enrollment?.started_at ? weekOf(enrollment.started_at) : "none";

    // 1. user_id
    if (userId) setUserId(userId);

    // 2. user_properties
    setUserProperties({
      current_program: program,
      enrollment_status: enrollment?.status ?? "none",
      days_since_purchase: daysSincePurchase,
      days_since_last_activity: daysSinceLastActivity,
      highest_day_reached: enrollment?.current_day ?? 0,
      programs_completed_count: programsCompletedCount,
      has_had_3d_gap: Boolean(enrollment?.had_3d_gap),
      has_had_7d_gap: Boolean(enrollment?.had_7d_gap),
      program_cohort: cohort,
    });

    // 3. session_start
    trackEvent("session_start", {
      program,
      days_since_purchase: daysSincePurchase,
      days_since_last_activity: daysSinceLastActivity,
    });
    markSessionStartFired();

    // 4. Inactivity gap detection (based on server-side last_active_at)
    if (enrollment?.last_active_at && enrollment?.status !== "completed") {
      const result = trackInactivityGap({
        lastActiveAt: enrollment.last_active_at,
        program,
        lastDayNumber: enrollment.current_day ?? 0,
      });
      // Persist gap flags server-side if a new threshold was crossed
      const needsPersist =
        (result.crossed3d && !enrollment.had_3d_gap) ||
        (result.crossed7d && !enrollment.had_7d_gap);
      if (needsPersist) {
        fetch("/api/analytics/record-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollment_id: enrollment.id,
            gap_days: result.gapDays,
            crossed_3d: result.crossed3d,
            crossed_7d: result.crossed7d,
          }),
        }).catch(() => {
          // fire-and-forget
        });
      }
    }

    // 5. Bump last-seen cache and associate GA client_id with enrollment
    touchLastSeen();
    if (enrollment?.id) {
      getGaClientId().then((cid) => {
        if (!cid) return;
        fetch("/api/analytics/set-ga-client-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enrollment_id: enrollment.id,
            ga_client_id: cid,
          }),
        }).catch(() => {
          // fire-and-forget
        });
      });
    }
  }, [enrollment, userId, programsCompletedCount]);

  return null;
}
