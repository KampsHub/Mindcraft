"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

const textareaStyle: React.CSSProperties = {
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
  minHeight: 140,
  resize: "vertical" as const,
  lineHeight: 1.6,
  transition: "border-color 0.2s",
};

export default function TestimonialSurveyPage() {
  const [screen, setScreen] = useState(0);
  const [describe, setDescribe] = useState("");
  const [changed, setChanged] = useState("");
  const [permission, setPermission] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    trackEvent("testimonial_survey_view", {});
  }, []);

  async function submit() {
    setSubmitting(true);
    trackEvent("testimonial_survey_submitted", { has_permission: permission, describe_length: describe.length, changed_length: changed.length });
    try {
      await Promise.all([
        fetch("/api/testimonial-survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            describe_text: describe,
            changed_text: changed,
            permission_given: permission,
          }),
        }),
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Testimonial Survey",
            email: "anonymous@survey.mindcraft.ing",
            issueType: "Testimonial",
            message: `How they'd describe Mindcraft:\n${describe}\n\nWhat changed:\n${changed}\n\nPermission to use (anonymized): ${permission ? "YES" : "NO"}`,
          }),
        }),
      ]);
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
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

        {!done && (
          <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                backgroundColor: i <= screen ? colors.coral : colors.borderDefault,
                transition: "background-color 0.3s",
              }} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          {/* Intro */}
          {screen === 0 && !done && (
            <motion.div key="intro" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h1 style={{ fontFamily: display, fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
                You finished the program.
              </h1>
              <p style={{ fontFamily: body, fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 32 }}>
                Would you share what the experience was like? Two questions, takes under a minute. Your words help someone else decide if this is right for them.
              </p>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={next}
                style={{
                  fontFamily: display, fontSize: 15, fontWeight: 600,
                  padding: "14px 32px", borderRadius: 100,
                  backgroundColor: colors.coral, color: colors.bgDeep,
                  border: "none", cursor: "pointer",
                }}>
                Share your experience
              </motion.button>
            </motion.div>
          )}

          {/* Q1: Describe */}
          {screen === 1 && !done && (
            <motion.div key="describe" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                How would you describe Mindcraft to a friend?
              </h2>
              <textarea
                placeholder="In your own words..."
                value={describe}
                onChange={(e) => setDescribe(e.target.value)}
                style={textareaStyle}
              />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={next}
                disabled={!describe.trim()}
                style={{
                  fontFamily: display, fontSize: 14, fontWeight: 600,
                  padding: "12px 28px", borderRadius: 100, marginTop: 16,
                  backgroundColor: colors.coral, color: colors.bgDeep,
                  border: "none", cursor: describe.trim() ? "pointer" : "not-allowed",
                  opacity: describe.trim() ? 1 : 0.5,
                }}>
                Next
              </motion.button>
            </motion.div>
          )}

          {/* Q2: Changed */}
          {screen === 2 && !done && (
            <motion.div key="changed" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                What changed for you during the program?
              </h2>
              <textarea
                placeholder="A shift, a realization, a new habit, a conversation you had differently..."
                value={changed}
                onChange={(e) => setChanged(e.target.value)}
                style={textareaStyle}
              />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={next}
                disabled={!changed.trim()}
                style={{
                  fontFamily: display, fontSize: 14, fontWeight: 600,
                  padding: "12px 28px", borderRadius: 100, marginTop: 16,
                  backgroundColor: colors.coral, color: colors.bgDeep,
                  border: "none", cursor: changed.trim() ? "pointer" : "not-allowed",
                  opacity: changed.trim() ? 1 : 0.5,
                }}>
                Next
              </motion.button>
            </motion.div>
          )}

          {/* Q3: Permission + Submit */}
          {screen === 3 && !done && (
            <motion.div key="permission" custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
                One last thing
              </h2>
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
                fontFamily: body, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6,
                marginBottom: 32,
              }}>
                <input
                  type="checkbox"
                  checked={permission}
                  onChange={(e) => setPermission(e.target.checked)}
                  style={{ marginTop: 4, width: 18, height: 18, accentColor: colors.coral }}
                />
                I give permission to use my response (anonymized) on the Mindcraft website.
                My name will not be shared.
              </label>
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
            </motion.div>
          )}

          {/* Done */}
          {done && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
                Thank you.
              </h2>
              <p style={{ fontFamily: body, fontSize: 16, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 24 }}>
                Your words matter more than you know. They help someone else take the first step.
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
