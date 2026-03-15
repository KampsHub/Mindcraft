"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const ISSUE_TYPES = [
  "Technical problem",
  "Feedback on an exercise",
  "Feedback on insights and summaries",
  "Question for a Coach",
];

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function reset() {
    setIssueType("");
    setMessage("");
    setStatus("idle");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!issueType || !message.trim()) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType, message }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`,
              padding: 28,
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none", cursor: "pointer",
                color: colors.textMuted, fontSize: 18, lineHeight: 1,
                padding: 4,
              }}
            >
              ✕
            </button>

            {status === "success" ? (
              /* ── Success screen ── */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.coral}, ${colors.coralPressed})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <span style={{ color: "#fff", fontSize: 26 }}>✓</span>
                </div>
                <h3 style={{
                  fontFamily: display, fontSize: 20, fontWeight: 700,
                  color: colors.textPrimary, margin: "0 0 10px 0",
                }}>
                  Message sent
                </h3>
                <p style={{
                  fontFamily: body, fontSize: 14, color: colors.textSecondary,
                  lineHeight: 1.6, margin: "0 0 24px 0",
                }}>
                  Got it. We&apos;ll get back to you within 48 hours at the latest.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    padding: "10px 28px", borderRadius: 100,
                    backgroundColor: colors.bgElevated, color: colors.textPrimary,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <h3 style={{
                  fontFamily: display, fontSize: 20, fontWeight: 700,
                  color: colors.textPrimary, margin: "0 0 6px 0",
                }}>
                  Get in touch
                </h3>
                <p style={{
                  fontFamily: body, fontSize: 13, color: colors.textMuted,
                  margin: "0 0 22px 0",
                }}>
                  We read every message.
                </p>

                {/* Issue type */}
                <label style={{
                  display: "block", fontFamily: display, fontSize: 12, fontWeight: 600,
                  color: colors.textSecondary, marginBottom: 10, letterSpacing: "0.02em",
                }}>
                  What is this about?
                </label>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                  marginBottom: 20,
                }}>
                  {ISSUE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setIssueType(type)}
                      style={{
                        padding: "10px 12px", fontSize: 12, fontFamily: body,
                        fontWeight: 500, textAlign: "left",
                        borderRadius: 10, cursor: "pointer",
                        border: issueType === type
                          ? `2px solid ${colors.coral}`
                          : `1px solid ${colors.borderDefault}`,
                        backgroundColor: issueType === type ? colors.coralWash : colors.bgInput,
                        color: issueType === type ? colors.coralLight : colors.textSecondary,
                        transition: "all 0.15s",
                        lineHeight: 1.35,
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <label style={{
                  display: "block", fontFamily: display, fontSize: 12, fontWeight: 600,
                  color: colors.textSecondary, marginBottom: 8, letterSpacing: "0.02em",
                }}>
                  Your message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  style={{
                    width: "100%", padding: "12px 16px", fontSize: 14, fontFamily: body,
                    border: `1px solid ${colors.borderDefault}`, borderRadius: 12,
                    backgroundColor: colors.bgInput, color: colors.textPrimary,
                    resize: "vertical", minHeight: 120, boxSizing: "border-box",
                    outline: "none",
                  }}
                />

                {status === "error" && (
                  <p style={{
                    fontSize: 13, color: colors.error, margin: "10px 0 0 0", fontFamily: body,
                  }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                {/* Submit */}
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <motion.button
                    whileHover={issueType && message.trim() && status !== "submitting"
                      ? { scale: 1.04, boxShadow: "0 8px 30px rgba(224, 149, 133, 0.4)" }
                      : {}}
                    whileTap={issueType && message.trim() && status !== "submitting"
                      ? { scale: 0.97 }
                      : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={handleSubmit}
                    disabled={!issueType || !message.trim() || status === "submitting"}
                    style={{
                      padding: "11px 28px", fontSize: 14, fontWeight: 600,
                      fontFamily: display, letterSpacing: "0.01em",
                      color: colors.bgDeep,
                      backgroundColor: !issueType || !message.trim() || status === "submitting"
                        ? colors.bgElevated
                        : colors.coral,
                      border: "none", borderRadius: 100,
                      cursor: !issueType || !message.trim() || status === "submitting"
                        ? "not-allowed"
                        : "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {status === "submitting" ? "Sending..." : "Send"}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
