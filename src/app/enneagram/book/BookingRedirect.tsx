"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import BreathingCircle from "@/components/BreathingCircle";
import { trackEvent } from "@/components/GoogleAnalytics";

const SCHEDULE_URL =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1GvZttZdK4XHfuoTQ0LRKf0IVVPjxJV4XRkKLdQ7_wS5fK4WR-Wjjn95OyMp-lpcy8QtqOT-zs";

const display = fonts.display;

export default function BookingRedirect({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ session_id?: string }>;
}) {
  const [slotLabel, setSlotLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const params = await searchParamsPromise;
      const sessionId = params?.session_id;

      // Fire the redirect event so we can track drop-off between Stripe
      // success and Google calendar confirmation.
      trackEvent("enneagram_booking_redirect", { session_id: sessionId ?? "missing" });

      // Optionally read the chosen slot label from a client-side fetch to
      // the Stripe session lookup. For now, we read the label from the
      // URL-embedded session_id is not enough — the slot label lives in
      // Stripe metadata, so we'd need a server call to retrieve it. Keep
      // it simple: just show a confirming message and forward.
      if (cancelled) return;
      setSlotLabel(null);
      setReady(true);

      // Brief hold so the user sees the confirmation UI (~1.5s), then forward.
      setTimeout(() => {
        if (cancelled) return;
        window.location.href = SCHEDULE_URL;
      }, 1500);
    })();

    return () => { cancelled = true; };
  }, [searchParamsPromise]);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bgDeep,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: display,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: 460,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <BreathingCircle size={96} />

        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: colors.coral,
            margin: "0 0 8px 0",
          }}>
            Payment confirmed
          </p>
          <h1 style={{
            fontSize: 26,
            fontWeight: 700,
            color: colors.textPrimary,
            margin: "0 0 12px 0",
            letterSpacing: "-0.02em",
          }}>
            One more step — confirm your time
          </h1>
          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: colors.textPrimary,
            margin: 0,
            opacity: 0.85,
          }}>
            {ready
              ? slotLabel
                ? `Sending you to Google Calendar to confirm ${slotLabel} with Stefanie…`
                : "Sending you to Google Calendar to confirm your session with Stefanie…"
              : "Preparing your booking…"}
          </p>
        </div>

        <a
          href={SCHEDULE_URL}
          style={{
            display: "inline-block",
            padding: "12px 28px",
            borderRadius: 100,
            backgroundColor: colors.coral,
            color: colors.bgDeep,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          Continue to Google Calendar →
        </a>

        <p style={{
          fontSize: 12,
          color: colors.textPrimary,
          opacity: 0.6,
          margin: 0,
          lineHeight: 1.5,
          maxWidth: 360,
        }}>
          If you don&rsquo;t get redirected in a few seconds, tap the button above. After you confirm on Google Calendar, you&rsquo;ll receive a confirmation email and a calendar invite.
        </p>
      </motion.div>
    </div>
  );
}
