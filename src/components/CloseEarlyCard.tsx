"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, radii } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

interface Props {
  enrollmentId: string;
  /** compact = inline link instead of full card (used on dashboard when 2+ enrollments) */
  variant?: "full" | "inline";
  /** optional override for the card heading */
  heading?: string;
}

/**
 * "Thinking about a different program?" — user-initiated close-early flow.
 * Full variant shows a card on the progress section. Inline variant shows
 * a muted link under a ProgramCard when the user has 2+ active enrollments.
 */
export default function CloseEarlyCard({ enrollmentId, variant = "full", heading }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fire close_early_viewed once per mount when the card is first visible.
  useEffect(() => {
    trackEvent("close_early_viewed", { enrollment_id: enrollmentId, variant });
  }, [enrollmentId, variant]);

  async function submit() {
    setSubmitting(true);
    setError(null);
    trackEvent("close_early_confirmed", { enrollment_id: enrollmentId });
    try {
      const res = await fetch("/api/enrollment/close-early", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        trackEvent("close_early_error", { enrollment_id: enrollmentId, status: res.status, error_message: data?.error ?? "unknown" });
        throw new Error(data.error || "Could not close the program");
      }
      setDone(true);
      // Give the toast a beat, then hop to the insights page
      setTimeout(() => {
        window.location.href = data.insights_url || "/insights/final";
      }, 1200);
    } catch (e) {
      if (!(e instanceof Error && e.message)) {
        trackEvent("close_early_error", { enrollment_id: enrollmentId, error_message: "network" });
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{
        padding: "18px 22px",
        borderRadius: 12,
        backgroundColor: colors.bgSurface,
        border: `1px solid ${colors.borderDefault}`,
      }}>
        <p style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary, margin: "0 0 4px 0" }}>
          Your program is closing.
        </p>
        <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
          Preparing your final insights — taking you there now.
        </p>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div style={{ marginTop: 12 }}>
        <AnimatePresence mode="wait">
          {!confirming ? (
            <motion.button
              key="trigger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { trackEvent("close_early_clicked", { enrollment_id: enrollmentId, variant }); setConfirming(true); }}
              style={{
                fontFamily: display, fontSize: 12, fontWeight: 500,
                color: colors.textMuted,
                backgroundColor: "transparent", border: "none",
                textDecoration: "underline", cursor: "pointer",
                padding: 0,
              }}
            >
              Close this program early
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: 8,
                padding: "14px 16px",
                borderRadius: 10,
                backgroundColor: "rgba(196, 148, 58, 0.06)",
                border: `1px solid ${colors.coral}33`,
              }}
            >
              <p style={{ fontFamily: body, fontSize: 12, lineHeight: 1.55, color: colors.textSecondary, margin: "0 0 10px 0" }}>
                We&rsquo;ll generate your final insights from the work you&rsquo;ve done and send you a
                20% off code. This can&rsquo;t be undone.
              </p>
              {error && (
                <p style={{ fontFamily: body, fontSize: 11, color: colors.error, margin: "0 0 8px 0" }}>
                  {error}
                </p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={submit}
                  disabled={submitting}
                  style={{
                    fontFamily: display, fontSize: 12, fontWeight: 600,
                    padding: "7px 14px", borderRadius: radii.full,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: "pointer",
                  }}
                >
                  {submitting ? "Closing…" : "Close program"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setConfirming(false); setError(null); }}
                  style={{
                    fontFamily: display, fontSize: 12, fontWeight: 500,
                    padding: "7px 14px", borderRadius: radii.full,
                    backgroundColor: "transparent",
                    color: colors.textSecondary,
                    border: `1px solid ${colors.borderDefault}`,
                    cursor: "pointer",
                  }}
                >
                  Keep going
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full card variant
  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      border: `1px solid ${colors.borderDefault}`,
      padding: "22px 26px",
      marginBottom: 32,
    }}>
      <p style={{
        fontFamily: display, fontSize: 15, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 6px 0",
        letterSpacing: "-0.01em",
      }}>
        {heading || "Thinking about a different program?"}
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, lineHeight: 1.6,
        color: colors.textMuted, margin: "0 0 16px 0",
      }}>
        You can close this one early. You&rsquo;ll get your final insights based on the work
        you&rsquo;ve done so far, plus your 20% off reward for whatever comes next.
      </p>

      <AnimatePresence mode="wait">
        {!confirming ? (
          <motion.button
            key="trigger"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { trackEvent("close_early_clicked", { enrollment_id: enrollmentId, variant }); setConfirming(true); }}
            style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              padding: "10px 20px", borderRadius: radii.full,
              backgroundColor: "transparent",
              color: colors.coral,
              border: `1.5px solid ${colors.coral}`,
              cursor: "pointer",
            }}
          >
            Close this program early →
          </motion.button>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: "0 0 10px 0" }}>
              Sure? This can&rsquo;t be undone.
            </p>
            {error && (
              <p style={{ fontFamily: body, fontSize: 12, color: colors.error, margin: "0 0 8px 0" }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                disabled={submitting}
                style={{
                  fontFamily: display, fontSize: 13, fontWeight: 600,
                  padding: "10px 20px", borderRadius: radii.full,
                  backgroundColor: colors.coral, color: colors.bgDeep,
                  border: "none", cursor: "pointer",
                }}
              >
                {submitting ? "Closing…" : "Yes, close early"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { setConfirming(false); setError(null); }}
                style={{
                  fontFamily: display, fontSize: 13, fontWeight: 500,
                  padding: "10px 20px", borderRadius: radii.full,
                  backgroundColor: "transparent",
                  color: colors.textSecondary,
                  border: `1px solid ${colors.borderDefault}`,
                  cursor: "pointer",
                }}
              >
                Keep going
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
