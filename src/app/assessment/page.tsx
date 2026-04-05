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
    label: "Professional Identity",
    question: "How much has your sense of who you are professionally been shaken?",
    context: "Your title, your expertise, your role in a team \u2014 when that shifts, it can feel like losing a piece of yourself.",
    low: "I know who I am",
    high: "I don\u2019t recognize myself right now",
  },
  {
    id: "competence",
    label: "Competence & Confidence",
    question: "How much is this situation making you doubt your skills or abilities?",
    context: "Self-doubt often spikes during transitions \u2014 even when your track record says otherwise.",
    low: "I trust what I can do",
    high: "I\u2019m seriously questioning myself",
  },
  {
    id: "safety",
    label: "Psychological Safety",
    question: "How safe do you feel to speak up, make mistakes, or be honest at work?",
    context: "When safety drops, you stop taking risks, stop asking questions, and start performing instead of contributing.",
    low: "I feel safe and supported",
    high: "I\u2019m walking on eggshells",
  },
  {
    id: "belonging",
    label: "Belonging & Relationships",
    question: "How connected do you feel to the people around you right now?",
    context: "Career disruptions often quietly cut the social threads you didn\u2019t realize you depended on.",
    low: "I feel like I belong",
    high: "I feel isolated or on the outside",
  },
  {
    id: "stability",
    label: "Financial & Career Security",
    question: "How much is this situation affecting your financial or career stability?",
    context: "Financial worry activates your survival brain \u2014 it makes everything else harder to think about clearly.",
    low: "I feel secure",
    high: "I\u2019m worried about what happens next",
  },
  {
    id: "cognitive",
    label: "Daily Functioning",
    question: "How much is the stress affecting your focus, sleep, or daily routine?",
    context: "When stress leaks into your body \u2014 sleep, appetite, concentration \u2014 that\u2019s your nervous system signaling overload.",
    low: "I\u2019m functioning well",
    high: "It\u2019s taking over my days",
  },
  {
    id: "clarity",
    label: "Clarity & Expectations",
    question: "How clear are you on what\u2019s expected of you and what success looks like?",
    context: "Ambiguity is exhausting. Without clear expectations, you end up guessing \u2014 and second-guessing.",
    low: "Crystal clear",
    high: "I\u2019m guessing or the goalposts keep moving",
  },
  {
    id: "trust",
    label: "Trust in Leadership",
    question: "How much do you trust the people making decisions about your career?",
    context: "When you can\u2019t trust the people above you, every interaction becomes a calculation instead of a conversation.",
    low: "I trust them",
    high: "I don\u2019t trust their intentions",
  },
  {
    id: "future",
    label: "Future Direction",
    question: "How clear is your path forward from here?",
    context: "Not having a plan isn\u2019t the problem \u2014 it\u2019s the feeling that you should have one and don\u2019t.",
    low: "I have a plan I believe in",
    high: "No idea what\u2019s next",
  },
];

export default function AssessmentPage() {
  const [step, setStep] = useState<"intro" | "assess" | "results" | "context" | "email">("intro");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [situation, setSituation] = useState("");
  const [challenge, setChallenge] = useState("");
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
          program: `Assessment | Situation: ${situation || "not specified"} | Avg: ${avgScore.toFixed(1)} | Top: ${topDisruptions.map((d) => d.label).join(", ")} | Challenge: ${challenge || "not provided"}`,
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center" }}
            >
              {/* Radial diagram — labels outside */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto 44px", aspectRatio: "1" }}
              >
                {(() => {
                  const SHORT_LABELS = [
                    "Identity", "Confidence", "Safety",
                    "Belonging", "Stability", "Functioning",
                    "Clarity", "Trust", "Direction",
                  ];
                  const total = 9;
                  const viewSize = 460;
                  const cx = viewSize / 2;
                  const cy = viewSize / 2;
                  const outerR = 140;
                  const innerR = 85;
                  const labelR = 175;

                  return (
                    <svg viewBox={`0 0 ${viewSize} ${viewSize}`} width="100%" height="100%">
                      <defs>
                        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor={colors.coral} stopOpacity="0.12" />
                          <stop offset="100%" stopColor={colors.coral} stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Subtle glow behind center */}
                      <motion.circle
                        cx={cx} cy={cy} r={innerR + 30}
                        fill="url(#centerGlow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 1 }}
                      />

                      {/* Segments */}
                      {SHORT_LABELS.map((label, i) => {
                        const angleStep = (2 * Math.PI) / total;
                        const startAngle = i * angleStep - Math.PI / 2;
                        const endAngle = startAngle + angleStep;
                        const gap = 0.03;

                        const x1 = cx + outerR * Math.cos(startAngle + gap);
                        const y1 = cy + outerR * Math.sin(startAngle + gap);
                        const x2 = cx + outerR * Math.cos(endAngle - gap);
                        const y2 = cy + outerR * Math.sin(endAngle - gap);
                        const x3 = cx + innerR * Math.cos(endAngle - gap);
                        const y3 = cy + innerR * Math.sin(endAngle - gap);
                        const x4 = cx + innerR * Math.cos(startAngle + gap);
                        const y4 = cy + innerR * Math.sin(startAngle + gap);

                        const midAngle = (startAngle + endAngle) / 2;
                        const lx = cx + labelR * Math.cos(midAngle);
                        const ly = cy + labelR * Math.sin(midAngle);

                        // Normalize angle to 0-2PI for anchor logic
                        const normAngle = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                        // Determine text anchor: labels on the left side anchor "end", right side "start", top/bottom "middle"
                        const cosA = Math.cos(midAngle);
                        const sinA = Math.sin(midAngle);
                        const anchor = Math.abs(cosA) < 0.15 ? "middle" : cosA > 0 ? "start" : "end";
                        const baseline = Math.abs(sinA) < 0.15 ? "middle" : sinA > 0 ? "hanging" : "auto";
                        void normAngle; // suppress unused warning

                        // Connector line
                        const connStart = outerR + 4;
                        const connEnd = labelR - 8;
                        const cx1 = cx + connStart * Math.cos(midAngle);
                        const cy1 = cy + connStart * Math.sin(midAngle);
                        const cx2 = cx + connEnd * Math.cos(midAngle);
                        const cy2 = cy + connEnd * Math.sin(midAngle);

                        return (
                          <g key={label}>
                            <motion.path
                              d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`}
                              fill="rgba(255,255,255,0.03)"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="1"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
                              style={{ transformOrigin: `${cx}px ${cy}px` }}
                            />
                            {/* Connector line */}
                            <motion.line
                              x1={cx1} y1={cy1} x2={cx2} y2={cy2}
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + i * 0.06 }}
                            />
                            {/* Label outside */}
                            <motion.text
                              x={lx}
                              y={ly}
                              textAnchor={anchor}
                              dominantBaseline={baseline}
                              fill={colors.textPrimary}
                              fontSize="12"
                              fontFamily={display}
                              fontWeight="600"
                              letterSpacing="0.03em"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 + i * 0.06 }}
                            >
                              {label}
                            </motion.text>
                          </g>
                        );
                      })}

                      {/* Inner circle */}
                      <motion.circle
                        cx={cx} cy={cy} r={innerR}
                        fill="rgba(24,24,28,0.9)"
                        stroke={`${colors.coral}40`}
                        strokeWidth="1.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />

                      {/* Decorative inner ring */}
                      <motion.circle
                        cx={cx} cy={cy} r={innerR - 12}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                        strokeDasharray="3 6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      />

                      {/* Center text */}
                      <motion.text
                        x={cx} y={cy - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={colors.coral}
                        fontSize="10"
                        fontFamily={display}
                        fontWeight="600"
                        letterSpacing="0.18em"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        YOUR
                      </motion.text>
                      <motion.text
                        x={cx} y={cy + 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={colors.textPrimary}
                        fontSize="13"
                        fontFamily={display}
                        fontWeight="700"
                        letterSpacing="0.06em"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        DISRUPTION
                      </motion.text>
                      <motion.text
                        x={cx} y={cy + 22}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={colors.textPrimary}
                        fontSize="13"
                        fontFamily={display}
                        fontWeight="700"
                        letterSpacing="0.06em"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                      >
                        MAP
                      </motion.text>
                    </svg>
                  );
                })()}
              </motion.div>

              {/* Text */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{
                  fontFamily: display,
                  fontSize: "clamp(26px, 5vw, 34px)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                }}
              >
                How is your career situation<br />affecting you?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                style={{
                  fontFamily: body,
                  fontSize: 16,
                  color: colors.textSecondary,
                  lineHeight: 1.7,
                  marginBottom: 32,
                  maxWidth: 460,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                A layoff, a PIP, a new role, a relocation, a promotion that
                doesn&apos;t feel like one &mdash; they all disrupt the same foundations.
                This 90-second assessment maps the impact across nine dimensions.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep("assess")}
                style={{
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 36px",
                  borderRadius: 100,
                  backgroundColor: colors.coral,
                  color: colors.bgDeep,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                Take free self-assessment
              </motion.button>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                style={{
                  fontFamily: body,
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 14,
                }}
              >
                No signup required &middot; Results are immediate and private
              </motion.p>
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
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textMuted,
                      lineHeight: 1.6,
                      marginBottom: 32,
                      fontStyle: "italic",
                    }}
                  >
                    {DISRUPTIONS[currentIdx].context}
                  </p>

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

                  {/* Back button */}
                  {currentIdx > 0 && (
                    <button
                      onClick={() => setCurrentIdx((prev) => prev - 1)}
                      style={{
                        background: "none", border: "none", color: colors.textMuted,
                        fontSize: 13, cursor: "pointer", fontFamily: body,
                        marginTop: 20, display: "block", margin: "20px auto 0",
                      }}
                    >
                      &larr; Previous question
                    </button>
                  )}
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
                    href="/#programs"
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
                    onClick={() => setStep("context")}
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
                    Get personalized next steps
                  </motion.button>
                </div>
              </div>

              <button
                onClick={() => { setStep("assess"); setCurrentIdx(DISRUPTIONS.length - 1); }}
                style={{
                  background: "none", border: "none", color: colors.textMuted,
                  fontSize: 13, cursor: "pointer", fontFamily: body,
                  marginTop: 20, display: "block", margin: "20px auto 0",
                }}
              >
                &larr; Back to questions
              </button>
            </motion.div>
          )}

          {/* ── CONTEXT: situation + challenge ── */}
          {step === "context" && (
            <motion.div
              key="context"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h2
                style={{
                  fontFamily: display,
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                One more thing
              </h2>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 28,
                }}
              >
                This helps us send you something actually useful — not generic advice.
              </p>

              {/* Situation selector */}
              <p
                style={{
                  fontFamily: display,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: 12,
                }}
              >
                What best describes your situation?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                {[
                  { id: "layoff", label: "I was laid off or lost my job" },
                  { id: "pip", label: "I\u2019m on a PIP or under performance pressure" },
                  { id: "new-role", label: "I\u2019m in a new role and finding my footing" },
                  { id: "relocation", label: "I relocated internationally and I\u2019m adjusting" },
                  { id: "first-manager", label: "I\u2019m managing people for the first time" },
                  { id: "stuck", label: "I\u2019m stuck and trying to figure out my next move" },
                  { id: "other", label: "Something else" },
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSituation(opt.id)}
                    style={{
                      width: "100%",
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textPrimary,
                      backgroundColor: situation === opt.id ? `${colors.coral}20` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${situation === opt.id ? colors.coral : colors.borderDefault}`,
                      borderRadius: 10,
                      padding: "12px 16px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>

              {/* Challenge */}
              <p
                style={{
                  fontFamily: display,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: 8,
                }}
              >
                What is your biggest challenge right now?
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  marginBottom: 12,
                  fontStyle: "italic",
                }}
              >
                One or two sentences — whatever is top of mind.
              </p>
              <textarea
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="e.g., I can't stop replaying conversations in my head and it's affecting my sleep..."
                style={{
                  width: "100%",
                  fontFamily: body,
                  fontSize: 14,
                  color: colors.textPrimary,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  minHeight: 80,
                  resize: "vertical" as const,
                  outline: "none",
                  lineHeight: 1.6,
                  boxSizing: "border-box" as const,
                  marginBottom: 24,
                }}
              />

              {/* Continue */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep("email")}
                disabled={!situation}
                style={{
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: 100,
                  backgroundColor: situation ? colors.coral : colors.bgElevated,
                  color: situation ? colors.bgDeep : colors.textMuted,
                  border: "none",
                  cursor: situation ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </motion.button>
              <button
                onClick={() => setStep("results")}
                style={{
                  background: "none", border: "none", color: colors.textMuted,
                  fontSize: 13, cursor: "pointer", fontFamily: body,
                  display: "block", margin: "16px auto 0",
                }}
              >
                &larr; Back to results
              </button>
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
                Get your personalized results
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
                We&apos;ll send your disruption map, a practical first step matched to
                your situation, and one resource for your most disrupted area.
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
                onClick={() => setStep("context")}
                style={{
                  background: "none", border: "none", color: colors.textMuted,
                  fontSize: 13, cursor: "pointer", fontFamily: body,
                  display: "block", margin: "16px auto 0",
                }}
              >
                &larr; Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
