"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";

const display = fonts.display;
const body = fonts.bodyAlt;

const DISRUPTIONS = [
  {
    id: "identity",
    label: "Identity & Self-Worth",
    question: "How much is your sense of self tied to your professional role right now?",
    low: "I know who I am beyond work",
    high: "Without this role, I don\u2019t know who I am",
  },
  {
    id: "competence",
    label: "Competence Confidence",
    question: "How confident are you in your ability to perform right now?",
    low: "I trust my skills",
    high: "I\u2019m seriously doubting myself",
  },
  {
    id: "belonging",
    label: "Belonging & Connection",
    question: "How connected do you feel to the people around you at work?",
    low: "I feel like I belong",
    high: "I feel isolated or on the outside",
  },
  {
    id: "stability",
    label: "Financial & Career Stability",
    question: "How secure does your professional and financial situation feel?",
    low: "Stable and secure",
    high: "Uncertain or at risk",
  },
  {
    id: "clarity",
    label: "Clarity of Expectations",
    question: "How clear are you on what success looks like in your current situation?",
    low: "I know exactly what\u2019s expected",
    high: "I\u2019m guessing or the goalposts keep moving",
  },
  {
    id: "regulation",
    label: "Emotional Regulation",
    question: "How well are you managing stress, anxiety, or difficult emotions day to day?",
    low: "I\u2019m managing well",
    high: "It\u2019s affecting my sleep, focus, or relationships",
  },
  {
    id: "future",
    label: "Future Trajectory",
    question: "How clear is your path forward from here?",
    low: "I have a plan I believe in",
    high: "No idea what\u2019s next",
  },
];

export default function AssessmentPage() {
  const [step, setStep] = useState<"intro" | "assess" | "results" | "email">("intro");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleScore = (id: string, score: number) => {
    setScores((prev) => ({ ...prev, [id]: score }));
    if (currentIdx < DISRUPTIONS.length - 1) {
      setTimeout(() => setCurrentIdx((prev) => prev + 1), 300);
    } else {
      setTimeout(() => setStep("results"), 500);
    }
  };

  const avgScore = Object.values(scores).length > 0
    ? Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
    : 0;

  const topDisruptions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => DISRUPTIONS.find((d) => d.id === id)!);

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          program: `7 Disruptions Assessment (avg: ${avgScore.toFixed(1)}, top: ${topDisruptions.map((d) => d.label).join(", ")})`,
        }),
      });
      setSubmitted(true);
    } catch {
      // Non-blocking
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colors.bgDeep,
        color: colors.textPrimary,
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Logo */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={28} />
          </a>
        </div>

        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1
                style={{
                  fontFamily: display,
                  fontSize: "clamp(28px, 5vw, 36px)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                }}
              >
                The 7 Disruptions Self-Assessment
              </h1>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 16,
                  color: colors.textSecondary,
                  lineHeight: 1.7,
                  marginBottom: 12,
                }}
              >
                Career disruptions hit more than your work. A layoff, a PIP, a new role,
                a relocation, a promotion that doesn&apos;t feel like one &mdash; they all shake
                the same foundations: identity, confidence, belonging, clarity.
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 16,
                  color: colors.textSecondary,
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                This 60-second assessment maps where you are across seven dimensions.
                No signup required. Your results are immediate and private.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep("assess")}
                style={{
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: 100,
                  backgroundColor: colors.coral,
                  color: colors.bgDeep,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start assessment
              </motion.button>
            </motion.div>
          )}

          {/* ── ASSESSMENT ── */}
          {step === "assess" && (
            <motion.div
              key="assess"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress */}
              <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
                {DISRUPTIONS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: i <= currentIdx ? colors.coral : colors.borderDefault,
                      transition: "background-color 0.3s",
                    }}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 12,
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {currentIdx + 1} of {DISRUPTIONS.length} &mdash; {DISRUPTIONS[currentIdx].label}
                  </p>
                  <h2
                    style={{
                      fontFamily: display,
                      fontSize: 22,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      marginBottom: 32,
                    }}
                  >
                    {DISRUPTIONS[currentIdx].question}
                  </h2>

                  {/* Scale labels */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                      fontFamily: body,
                      fontSize: 12,
                      color: colors.textMuted,
                    }}
                  >
                    <span>{DISRUPTIONS[currentIdx].low}</span>
                    <span>{DISRUPTIONS[currentIdx].high}</span>
                  </div>

                  {/* Score buttons */}
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <motion.button
                        key={n}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleScore(DISRUPTIONS[currentIdx].id, n)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          border: `1px solid ${scores[DISRUPTIONS[currentIdx].id] === n ? colors.coral : colors.borderDefault}`,
                          backgroundColor: scores[DISRUPTIONS[currentIdx].id] === n
                            ? `${colors.coral}30`
                            : "transparent",
                          color: colors.textPrimary,
                          fontFamily: display,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2
                style={{
                  fontFamily: display,
                  fontSize: 24,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Your disruption map
              </h2>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 15,
                  color: colors.textSecondary,
                  marginBottom: 32,
                  lineHeight: 1.6,
                }}
              >
                {avgScore >= 7
                  ? "You are experiencing significant disruption across multiple areas. This is a lot to carry."
                  : avgScore >= 4
                    ? "Some areas are hitting harder than others. Knowing which ones helps you focus."
                    : "You have some stability to build from. The disrupted areas are where the work is."}
              </p>

              {/* Score bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {DISRUPTIONS.map((d) => {
                  const score = scores[d.id] || 0;
                  const isHigh = score >= 7;
                  return (
                    <FadeIn key={d.id} preset="slide-up" delay={0.05 * DISRUPTIONS.indexOf(d)}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: body,
                              fontSize: 13,
                              color: isHigh ? colors.coral : colors.textSecondary,
                              fontWeight: isHigh ? 600 : 400,
                            }}
                          >
                            {d.label}
                          </span>
                          <span
                            style={{
                              fontFamily: display,
                              fontSize: 13,
                              fontWeight: 700,
                              color: isHigh ? colors.coral : colors.textMuted,
                            }}
                          >
                            {score}/10
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: colors.borderSubtle,
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score * 10}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            style={{
                              height: "100%",
                              borderRadius: 3,
                              backgroundColor: isHigh ? colors.coral : "#60a5fa",
                            }}
                          />
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>

              {/* CTA section */}
              <div
                style={{
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  padding: 24,
                  border: `1px solid ${colors.borderDefault}`,
                }}
              >
                {topDisruptions.length > 0 && (
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textSecondary,
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    Your most disrupted areas: <strong style={{ color: colors.textPrimary }}>{topDisruptions.map((d) => d.label).join(", ")}</strong>.
                    These are the areas that benefit most from structured support.
                  </p>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <motion.a
                    href="/parachute"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      fontFamily: display,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: "12px 24px",
                      borderRadius: 100,
                      backgroundColor: colors.coral,
                      color: colors.bgDeep,
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Explore programs
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep("email")}
                    style={{
                      fontFamily: display,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: "12px 24px",
                      borderRadius: 100,
                      backgroundColor: "transparent",
                      color: colors.textPrimary,
                      border: `1px solid ${colors.borderDefault}`,
                      cursor: "pointer",
                    }}
                  >
                    Get results by email
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── EMAIL CAPTURE ── */}
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                style={{
                  fontFamily: display,
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                Save your results
              </h2>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                We will send your disruption map and a few resources matched to your top areas.
                One email. No spam.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontFamily: body,
                    fontSize: 15,
                    color: "#8BC48A",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#8BC48A" />
                    <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sent. Check your inbox.
                </motion.div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textPrimary,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: 8,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleEmailSubmit}
                    disabled={submitting}
                    style={{
                      padding: "12px 24px",
                      fontFamily: display,
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.bgDeep,
                      backgroundColor: colors.coral,
                      border: "none",
                      borderRadius: 8,
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.6 : 1,
                    }}
                  >
                    {submitting ? "..." : "Send"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep("results")}
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginTop: 16,
                  textDecoration: "underline",
                }}
              >
                Back to results
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
