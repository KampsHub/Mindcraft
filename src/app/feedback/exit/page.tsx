"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

const REASONS = [
  "Lost motivation",
  "Too busy right now",
  "Didn\u2019t find it helpful",
  "Too expensive",
  "Got what I needed",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: body,
  fontSize: 16,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  border: `1px solid ${colors.borderDefault}`,
  borderRadius: 10,
  padding: "14px 16px",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: "vertical" as const,
  lineHeight: 1.6,
};

export default function ExitSurveyPage() {
  const [screen, setScreen] = useState(0);
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [comeback, setComeback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    trackEvent("exit_survey_page_view", {});
  }, []);

  async function submit() {
    setSubmitting(true);
    const finalReason = reason === "Other" ? otherReason : reason;
    trackEvent("exit_survey_submitted", { reason: finalReason || "unspecified", has_comeback_text: comeback.length > 0 });
    try {
      // Persist structured row + send email triage in parallel
      await Promise.all([
        fetch("/api/exit-survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reason === "Other" ? null : reason,
            reason_other: reason === "Other" ? otherReason : null,
            comeback_text: comeback,
          }),
        }),
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Exit Survey",
            email: "anonymous@survey.mindcraft.ing",
            issueType: "Exit Survey",
            message: `Reason: ${finalReason}\n\nWhat would bring them back: ${comeback}`,
          }),
        }),
      ]);
      setDone(true);
    } catch {
      setDone(true); // still show thank you
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (screen === 0 && reason) {
      trackEvent("exit_survey_reason_selected", { reason: reason === "Other" ? "Other" : reason });
    }
    setDirection(1);
    setScreen((s) => s + 1);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: "none" }}><Logo size={28} /></a>
        </div>

        {/* Progress */}
        {!done && (
          <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                backgroundColor: i <= screen ? colors.coral : colors.borderDefault,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {/* Screen 0: Intro */}
          {screen === 0 && !done && (
            <motion.div key="intro" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
                Quick question before you go
              </h1>
              <p style={{ fontFamily: body, fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 32 }}>
                Two questions. Takes 30 seconds. Your feedback genuinely helps us improve.
              </p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={next}
                style={{
                  fontFamily: display, fontSize: 15, fontWeight: 600,
                  padding: "14px 32px", borderRadius: 100,
                  backgroundColor: colors.coral, color: colors.bgDeep,
                  border: "none", cursor: "pointer",
                }}>
                Start
              </motion.button>
            </motion.div>
          )}

          {/* Screen 1: Reason */}
          {screen === 1 && !done && (
            <motion.div key="reason" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                What made you stop using Mindcraft?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[...REASONS, "Other"].map((r) => (
                  <motion.button key={r} whileTap={{ scale: 0.98 }}
                    onClick={() => { setReason(r); if (r !== "Other") setTimeout(next, 300); }}
                    style={{
                      width: "100%", fontFamily: body, fontSize: 15, fontWeight: 500,
                      color: colors.textPrimary,
                      backgroundColor: reason === r ? `${colors.coral}20` : colors.bgSurface,
                      border: `1px solid ${reason === r ? colors.coral : colors.borderDefault}`,
                      borderRadius: 10, padding: "14px 20px",
                      cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                    }}>
                    {r}
                  </motion.button>
                ))}
              </div>

              {reason === "Other" && (
                <div style={{ marginBottom: 24 }}>
                  <textarea
                    placeholder="Tell us more..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    style={textareaStyle}
                  />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={next}
                    disabled={!otherReason.trim()}
                    style={{
                      fontFamily: display, fontSize: 14, fontWeight: 600,
                      padding: "12px 28px", borderRadius: 100, marginTop: 12,
                      backgroundColor: colors.coral, color: colors.bgDeep,
                      border: "none", cursor: otherReason.trim() ? "pointer" : "not-allowed",
                      opacity: otherReason.trim() ? 1 : 0.5,
                    }}>
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Screen 2: What would bring you back */}
          {screen === 2 && !done && (
            <motion.div key="comeback" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                What would bring you back?
              </h2>
              <textarea
                placeholder="Anything — a feature, a change, a different price, nothing at all..."
                value={comeback}
                onChange={(e) => setComeback(e.target.value)}
                style={textareaStyle}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={submit}
                  disabled={submitting}
                  style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    padding: "12px 28px", borderRadius: 100,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.6 : 1,
                  }}>
                  {submitting ? "Sending..." : "Submit"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={submit}
                  style={{
                    fontFamily: body, fontSize: 13, color: colors.textMuted,
                    backgroundColor: "transparent", border: "none", cursor: "pointer",
                  }}>
                  Skip &amp; finish
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Done */}
          {done && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Thank you.
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 24 }}>
                Your feedback helps us build something better. The program is still here if you ever want to come back.
              </p>
              <a href="/" style={{
                fontFamily: display, fontSize: 14, color: colors.coral, textDecoration: "none",
              }}>
                Back to Mindcraft &rarr;
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
