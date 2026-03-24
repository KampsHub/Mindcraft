"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const FLAG_REASONS = [
  { value: "off_tone", label: "Off tone" },
  { value: "inaccurate", label: "Inaccurate" },
  { value: "unhelpful", label: "Unhelpful" },
  { value: "confusing", label: "Confusing" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "other", label: "Other" },
] as const;

interface FlagButtonProps {
  outputType: string;
  frameworkName?: string;
  dailySessionId?: string;
}

export default function FlagButton({
  outputType,
  frameworkName,
  dailySessionId,
}: FlagButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedReason) return;
    setSubmitting(true);

    try {
      await fetch("/api/quality-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outputType,
          frameworkName: frameworkName || undefined,
          dailySessionId: dailySessionId || undefined,
          flagReason: selectedReason,
          userComment: comment.trim() || undefined,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setSelectedReason(null);
        setComment("");
      }, 1500);
    } catch {
      // Fail silently — don't interrupt the user's coaching flow
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <span style={{
        fontSize: 11, color: colors.textMuted, fontFamily: body,
        padding: "2px 8px",
      }}>
        Thanks for the feedback
      </span>
    );
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        title="Flag this output"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: `1px solid ${open ? colors.borderDefault : "transparent"}`,
          backgroundColor: open ? colors.bgElevated : "transparent",
          color: open ? colors.textSecondary : colors.textMuted,
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s",
          opacity: open ? 1 : 0.5,
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.opacity = "0.5"; }}
      >
        ⚑
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: 34,
              right: 0,
              zIndex: 50,
              width: 260,
              backgroundColor: colors.bgSurface,
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: 12,
              padding: 14,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <p style={{
              fontSize: 12, fontWeight: 600, color: colors.textSecondary,
              margin: "0 0 10px 0", fontFamily: display,
            }}>
              What felt off?
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {FLAG_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(
                    selectedReason === reason.value ? null : reason.value
                  )}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 100,
                    border: `1px solid ${
                      selectedReason === reason.value ? colors.coral : colors.borderDefault
                    }`,
                    backgroundColor:
                      selectedReason === reason.value ? colors.coralWash : "transparent",
                    color:
                      selectedReason === reason.value ? colors.coral : colors.textMuted,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: body,
                  }}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any details? (optional)"
              maxLength={500}
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 12,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: 8,
                backgroundColor: colors.bgInput,
                color: colors.textPrimary,
                fontFamily: body,
                boxSizing: "border-box",
                marginBottom: 10,
                outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
              onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setOpen(false); setSelectedReason(null); setComment(""); }}
                style={{
                  padding: "6px 14px", fontSize: 11, fontWeight: 500,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 6, backgroundColor: "transparent",
                  color: colors.textMuted, cursor: "pointer", fontFamily: body,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
                style={{
                  padding: "6px 14px", fontSize: 11, fontWeight: 600,
                  border: "none", borderRadius: 6,
                  backgroundColor: selectedReason ? colors.coral : colors.bgElevated,
                  color: selectedReason ? colors.bgDeep : colors.textMuted,
                  cursor: selectedReason ? "pointer" : "not-allowed",
                  fontFamily: display, transition: "all 0.15s",
                }}
              >
                {submitting ? "..." : "Send"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
