"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

type Reason = "not_relevant" | "too_intense" | "too_vague" | "already_did";

const REASONS: { value: Reason; label: string }[] = [
  { value: "not_relevant", label: "Not relevant to me" },
  { value: "too_intense", label: "Too intense right now" },
  { value: "too_vague", label: "Too vague" },
  { value: "already_did", label: "Already did this" },
];

interface Props {
  frameworkId?: string;
  frameworkName?: string;
  dailySessionId?: string;
  /** Called after the flag is saved. Receives the framework_id so the parent can
   *  request a replacement (e.g. by calling /api/daily-exercise with exclude_framework_ids). */
  onFlagged?: (frameworkId: string | undefined, reason: Reason) => void;
  /** Optional — lets the parent supply its own toast/status UI.
   *  If omitted, the component shows a small inline confirmation. */
  silent?: boolean;
}

/**
 * 👎 "This doesn't fit" button. Two-tap: click → reason dropdown → saved.
 * Writes to quality_flags with user_initiated=true, then calls onFlagged so
 * the parent can swap in a replacement exercise.
 */
export default function ExerciseFeedbackButton({
  frameworkId, frameworkName, dailySessionId, onFlagged, silent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(reason: Reason) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quality-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType: "exercise",
          frameworkId,
          frameworkName,
          flagReason: reason,
          dailySessionId,
          userInitiated: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save feedback");
      setDone(true);
      setOpen(false);
      onFlagged?.(frameworkId, reason);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (done && !silent) {
    return (
      <div style={{
        fontFamily: body, fontSize: 12, color: colors.textMuted,
        padding: "6px 0",
      }}>
        Got it — here&rsquo;s another angle.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="This doesn't fit"
        title="This doesn't fit"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: display, fontSize: 11, fontWeight: 600,
          padding: "6px 12px", borderRadius: radii.full,
          backgroundColor: "transparent",
          color: colors.textMuted,
          border: `1px solid ${colors.borderDefault}`,
          cursor: "pointer",
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM22 2v13" />
        </svg>
        This doesn&rsquo;t fit
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 10,
              minWidth: 220,
              backgroundColor: colors.bgElevated,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: 12,
              padding: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            <p style={{
              fontFamily: display, fontSize: 10, fontWeight: 700,
              color: colors.textMuted, textTransform: "uppercase",
              letterSpacing: "0.1em",
              padding: "8px 10px 4px",
              margin: 0,
            }}>
              What&rsquo;s off?
            </p>
            {REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => submit(r.value)}
                disabled={submitting}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  fontFamily: body, fontSize: 13,
                  color: colors.textPrimary,
                  padding: "9px 12px", borderRadius: 8,
                  backgroundColor: "transparent", border: "none",
                  cursor: submitting ? "default" : "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {r.label}
              </button>
            ))}
            {error && (
              <p style={{ fontFamily: body, fontSize: 11, color: colors.error, padding: "6px 10px", margin: 0 }}>
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
