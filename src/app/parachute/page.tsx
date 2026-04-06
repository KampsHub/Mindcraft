"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import { trackEvent } from "@/components/GoogleAnalytics";
import GiftingSection from "@/components/GiftingSection";

/* ── Typography shortcuts ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Layout constants ── */
const maxWidth = 1120;
const narrowMax = 700;
const sectionPadding = { padding: "64px 24px" } as const;
const sectionPaddingSmall = { padding: "48px 24px" } as const;

/* ── Animated counter hook (eased, requestAnimationFrame) ── */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  useEffect(() => {
    if (!startOnView || !inView) return;
    let startTime: number | null = null;
    let raf: number;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(ease(progress) * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration, startOnView]);
  return { count, ref };
}

/* ── SVG Ninja illustrations (chibi style, B&W) ── */
const ninjaBlack = "#1A1A1E";
const ninjaGray = "#3A3A40";
const ninjaFace = "#E8DDD0";

function NinjaMeditating({ size = 48 }: { size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
    >
      {/* hood */}
      <ellipse cx="50" cy="30" rx="22" ry="24" fill={ninjaBlack} />
      {/* face opening */}
      <ellipse cx="50" cy="34" rx="14" ry="10" fill={ninjaFace} />
      {/* mask over mouth */}
      <path d="M36 36 Q50 42 64 36 L64 44 Q50 38 36 44 Z" fill={ninjaBlack} />
      {/* eyes - big round */}
      <ellipse cx="43" cy="32" rx="4" ry="4.5" fill={ninjaBlack} />
      <ellipse cx="57" cy="32" rx="4" ry="4.5" fill={ninjaBlack} />
      <circle cx="44.5" cy="31" r="1.5" fill="white" />
      <circle cx="58.5" cy="31" r="1.5" fill="white" />
      {/* body sitting */}
      <ellipse cx="50" cy="68" rx="24" ry="16" fill={ninjaBlack} />
      {/* crossed legs */}
      <ellipse cx="36" cy="80" rx="14" ry="6" fill={ninjaGray} />
      <ellipse cx="64" cy="80" rx="14" ry="6" fill={ninjaGray} />
      {/* hands on knees */}
      <circle cx="30" cy="72" r="5" fill={ninjaFace} />
      <circle cx="70" cy="72" r="5" fill={ninjaFace} />
    </motion.svg>
  );
}

function NinjaWriting({ size = 48 }: { size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
    >
      {/* hood */}
      <ellipse cx="45" cy="26" rx="20" ry="22" fill={ninjaBlack} />
      {/* face */}
      <ellipse cx="45" cy="30" rx="13" ry="9" fill={ninjaFace} />
      {/* mask */}
      <path d="M32 32 Q45 38 58 32 L58 40 Q45 34 32 40 Z" fill={ninjaBlack} />
      {/* eyes looking down */}
      <ellipse cx="39" cy="28" rx="3.5" ry="3" fill={ninjaBlack} />
      <ellipse cx="51" cy="28" rx="3.5" ry="3" fill={ninjaBlack} />
      <circle cx="40" cy="27.5" r="1.2" fill="white" />
      <circle cx="52" cy="27.5" r="1.2" fill="white" />
      {/* body leaning */}
      <ellipse cx="46" cy="58" rx="18" ry="22" fill={ninjaBlack} />
      {/* arm writing */}
      <path d="M62 50 Q72 55 78 62" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="78" cy="62" r="4" fill={ninjaFace} />
      {/* pencil */}
      <line x1="80" y1="64" x2="86" y2="76" stroke={ninjaGray} strokeWidth="2.5" strokeLinecap="round" />
      {/* paper */}
      <rect x="70" y="70" width="20" height="24" rx="2" fill="white" opacity="0.3" />
      {/* legs */}
      <ellipse cx="40" cy="80" rx="12" ry="7" fill={ninjaGray} />
      <ellipse cx="56" cy="82" rx="10" ry="6" fill={ninjaGray} />
    </motion.svg>
  );
}

function NinjaJumping({ size = 48 }: { size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
    >
      {/* hood */}
      <ellipse cx="50" cy="22" rx="20" ry="22" fill={ninjaBlack} />
      {/* face */}
      <ellipse cx="50" cy="26" rx="13" ry="9" fill={ninjaFace} />
      {/* mask */}
      <path d="M37 28 Q50 34 63 28 L63 36 Q50 30 37 36 Z" fill={ninjaBlack} />
      {/* eyes - excited */}
      <ellipse cx="44" cy="24" rx="4" ry="5" fill={ninjaBlack} />
      <ellipse cx="56" cy="24" rx="4" ry="5" fill={ninjaBlack} />
      <circle cx="45.5" cy="23" r="1.8" fill="white" />
      <circle cx="57.5" cy="23" r="1.8" fill="white" />
      {/* body */}
      <ellipse cx="50" cy="52" rx="16" ry="18" fill={ninjaBlack} />
      {/* arm up right */}
      <path d="M64 44 L80 28" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <circle cx="80" cy="28" r="4" fill={ninjaFace} />
      {/* arm out left */}
      <path d="M36 48 L18 40" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <circle cx="18" cy="40" r="4" fill={ninjaFace} />
      {/* leg kick */}
      <path d="M42 68 L26 82" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <path d="M58 66 L76 72" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <circle cx="26" cy="82" r="5" fill={ninjaGray} />
      <circle cx="76" cy="72" r="5" fill={ninjaGray} />
    </motion.svg>
  );
}

function NinjaConfident({ size = 48 }: { size?: number }) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
    >
      {/* hood */}
      <ellipse cx="50" cy="24" rx="20" ry="22" fill={ninjaBlack} />
      {/* face */}
      <ellipse cx="50" cy="28" rx="13" ry="9" fill={ninjaFace} />
      {/* mask */}
      <path d="M37 30 Q50 36 63 30 L63 38 Q50 32 37 38 Z" fill={ninjaBlack} />
      {/* calm eyes */}
      <ellipse cx="44" cy="26" rx="3.5" ry="4" fill={ninjaBlack} />
      <ellipse cx="56" cy="26" rx="3.5" ry="4" fill={ninjaBlack} />
      <circle cx="45" cy="25" r="1.4" fill="white" />
      <circle cx="57" cy="25" r="1.4" fill="white" />
      {/* body standing */}
      <rect x="36" y="44" width="28" height="30" rx="12" fill={ninjaBlack} />
      {/* arms crossed */}
      <path d="M36 56 Q50 62 64 56" stroke={ninjaGray} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="56" r="4" fill={ninjaFace} />
      <circle cx="64" cy="56" r="4" fill={ninjaFace} />
      {/* legs */}
      <path d="M44 74 L40 92" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <path d="M56 74 L60 92" stroke={ninjaBlack} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="40" cy="94" rx="6" ry="3" fill={ninjaGray} />
      <ellipse cx="60" cy="94" rx="6" ry="3" fill={ninjaGray} />
    </motion.svg>
  );
}

/* ── Visual divider with ninja ── */
function NinjaDivider({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "left" | "right" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: align,
        alignItems: "center",
        padding: "16px 24px",
        maxWidth: narrowMax,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

/* ── Glow button ── */
function GlowButton({ href, children, variant = "coral" }: { href: string; children: React.ReactNode; variant?: "coral" | "plum" }) {
  const bg = variant === "coral" ? colors.coral : colors.coral;
  const glow = variant === "coral" ? "rgba(224,149,133,0.4)" : "rgba(176,141,173,0.4)";
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${glow}` }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: body,
        fontSize: 15,
        fontWeight: 600,
        padding: "14px 32px",
        borderRadius: 8,
        textDecoration: "none",
        backgroundColor: bg,
        color: "#ffffff",
        border: "none",
      }}
    >
      {children}
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════ */
function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(24,24,28,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}><Logo size={18} /></a>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="/login"
          className="nav-signin"
          style={{
            fontFamily: body,
            fontSize: 13,
            fontWeight: 500,
            color: "#ffffff",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          Sign in
        </a>
        <a
          href="#pricing"
          className="nav-price-btn"
          style={{
            fontFamily: body,
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: colors.coral,
            padding: "10px 24px",
            borderRadius: 8,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          From $29
        </a>
        </div>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section
      style={{
        ...sectionPadding,
        paddingTop: 140,
        paddingBottom: 80,
        background: colors.bgDeep,
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      <img
        src="/hero-parachute.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.7,
        }}
      />
      <div style={{ maxWidth: narrowMax, margin: "0 auto", position: "relative" as const, zIndex: 1 }}>
        <FadeIn preset="fade" triggerOnMount delay={0.1}>
          <div
            style={{
              backgroundColor: "rgba(20,20,24,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 14,
              padding: "24px 28px",
              marginBottom: 24,
              display: "inline-block",
            }}
          >
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                color: colors.coral,
                marginBottom: 16,
              }}
            >
              For professionals experiencing involuntary job loss
            </p>
            <h1
              style={{
                fontFamily: display,
                fontSize: "clamp(34px, 5.5vw, 54px)",
                lineHeight: 1.12,
                color: colors.textPrimary,
                marginBottom: 0,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              You lost your job.
              <br />
              Now what?
            </h1>
          </div>
        </FadeIn>

        <FadeIn preset="slide-up" triggerOnMount delay={0.3}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap" as const,
              gap: 8,
              marginBottom: 28,
            }}
          >
            {["Anger", "Shame", "Fear", "Embarrassment", "Relief"].map(
              (emotion, i) => (
                <span
                  key={emotion}
                  style={{
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    color: i === 4 ? colors.coral : colors.textSecondary,
                    backgroundColor:
                      i === 4 ? colors.coralWash : colors.bgSurface,
                    border: `1px solid ${
                      i === 4
                        ? "rgba(224,149,133,0.25)"
                        : colors.borderDefault
                    }`,
                    padding: "6px 16px",
                    borderRadius: 20,
                  }}
                >
                  {emotion}
                </span>
              )
            )}
          </div>
        </FadeIn>

        <FadeIn preset="slide-up" triggerOnMount delay={0.4}>
          <div
            style={{
              backgroundColor: "rgba(20,20,24,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 14,
              padding: "24px 28px",
              maxWidth: 580,
              marginBottom: 28,
            }}
          >
            <p
              style={{
                fontFamily: body,
                fontSize: 17,
                color: colors.textSecondary,
                lineHeight: 1.75,
                marginBottom: 12,
              }}
            >
              Losing a job can be a challenging and isolating time.
            </p>
            <p
              style={{
                fontFamily: body,
                fontSize: 17,
                color: colors.textBody,
                lineHeight: 1.75,
                marginBottom: 0,
              }}
            >
              PARACHUTE is a 30-day personalized daily program to help you work
              through the emotional mess.
            </p>
          </div>
        </FadeIn>


        <FadeIn preset="slide-up" triggerOnMount delay={0.55}>
          <div
            style={{
              backgroundColor: "rgba(20,20,24,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 14,
              padding: "20px 28px",
              maxWidth: 580,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap" as const,
              }}
            >
              <a
                href="#pricing"
                onClick={() => trackEvent("layoff_hero_cta_click", {})}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: body,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: 8,
                  textDecoration: "none",
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  transition: "all 0.2s",
                  border: "none",
                }}
              >
                Sliding scale from $29
              </a>
              <a
                href="#how"
                style={{
                  fontFamily: body,
                  fontSize: 15,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  padding: "14px 8px",
                  transition: "color 0.2s",
                }}
              >
                See how it works ↓
              </a>
            </div>
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginTop: 12,
              }}
            >
              7-day money-back guarantee · Access until your goals are complete
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOCIAL PROOF BAR
   ═══════════════════════════════════════════════════════════ */
function ProofBar() {
  const counter30 = useCounter(30, 3000);
  const counter6 = useCounter(6, 2400);
  const counter180 = useCounter(180, 3600);

  const stats = [
    { ref: counter30.ref, display: counter30.count.toString(), label: "days of structured, personalized coaching" },
    { ref: counter6.ref, display: counter6.count.toString(), label: "goals generated from your specific situation" },
    { ref: counter180.ref, display: `${counter180.count}+`, label: "personalized exercises, drawn from a 350+ tool library" },
  ];

  return (
    <FadeIn preset="fade">
      <div
        style={{
          padding: "32px 24px",
          borderTop: `1px solid ${colors.borderSubtle}`,
          borderBottom: `1px solid ${colors.borderSubtle}`,
          background: colors.bgRecessed,
        }}
      >
        <div
          className="parachute-proof-inner"
          style={{
            maxWidth,
            margin: "0 auto",
            display: "flex",
            gap: 48,
            justifyContent: "center",
            flexWrap: "wrap" as const,
            alignItems: "center",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: body,
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              <span
                ref={s.ref}
                style={{
                  fontFamily: display,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  minWidth: 40,
                }}
              >
                {s.display}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════
   THE PROBLEM
   ═══════════════════════════════════════════════════════════ */
function Problem() {
  const [expandedDisruption, setExpandedDisruption] = useState<number | null>(null);

  const disruptions = [
    {
      label: "Income",
      desc: "Cash flow anxiety, burn rate math, insurance gaps. The spreadsheet that keeps you up.",
    },
    {
      label: "Routine",
      desc: "Your day had structure. Now time is amorphous and anxiety fills the space.",
    },
    {
      label: "Identity",
      desc: "You were your title, your company, your scope. Who are you now?",
    },
    {
      label: "Belonging",
      desc: "Your coworkers were your daily community. That network does not survive intact.",
    },
    {
      label: "Competence",
      desc: "A layoff, a PIP, a toxic manager — each tells a story about your capability. Often wrong.",
    },
    {
      label: "Future",
      desc: "AI is reshaping roles. The market is contracting. The uncertainty is structural.",
    },
    {
      label: "Skills",
      desc: 'Not just "am I good" but "will what I do still be needed?"',
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep, borderTop: `3px solid ${colors.coral}` }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            The problem
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Job loss hits seven systems at once
          </h2>
        </FadeIn>

        <FadeIn preset="slide-up" delay={0.1}>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: 32,
            }}
          >
            This program addresses all these systems for a reset.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="parachute-prob-grid">
          {disruptions.map((d, i) => (
            <FadeIn key={d.label} preset="slide-up" delay={i * 0.04}>
              <motion.div
                onClick={() => setExpandedDisruption(expandedDisruption === i ? null : i)}
                whileHover={{ scale: 1.02, borderColor: colors.coral }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  padding: "16px 18px",
                  backgroundColor: expandedDisruption === i ? colors.bgElevated : colors.bgSurface,
                  borderRadius: 10,
                  border: `1px solid ${expandedDisruption === i ? colors.coral : colors.borderDefault}`,
                  height: "100%",
                  cursor: "pointer",
                  transition: "background-color 0.2s, border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p
                    style={{
                      fontFamily: body,
                      fontWeight: 600,
                      fontSize: 13,
                      color: colors.coral,
                      marginBottom: 0,
                    }}
                  >
                    {d.label}
                  </p>
                  <motion.span
                    animate={{ rotate: expandedDisruption === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1 }}
                  >
                    +
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {expandedDisruption === i && (
                    <motion.p
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{
                        fontFamily: body,
                        fontSize: 13,
                        color: colors.textMuted,
                        lineHeight: 1.5,
                        margin: 0,
                        overflow: "hidden",
                      }}
                    >
                      {d.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn preset="fade" delay={0.4}>
          <div style={{ marginTop: 36, paddingTop: 24, borderTop: `1px solid ${colors.borderSubtle}` }}>
            <p
              style={{
                fontFamily: body,
                fontSize: 14,
                color: colors.textBody,
                lineHeight: 1.75,
                marginBottom: 12,
              }}
            >
              This is not a program that promises the big fix. It is a practical
              way to work through your feelings, thoughts, and recurring
              patterns — an emotional anchor in a sea of coding bootcamps and
              interview prep tools.
            </p>
          </div>
        </FadeIn>

        {/* Research stats */}
        <FadeIn preset="slide-up" delay={0.45}>
          <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, marginTop: 40, paddingTop: 36 }}>
            <p style={{ fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 14 }}>
              The research
            </p>
            <h3 style={{ fontFamily: display, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.2, color: colors.textPrimary, marginBottom: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Layoffs are not a career setback. They are a life event.
            </h3>
            <div className="parachute-research-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                { num: "2 years", desc: "for self-esteem and mental health to return to baseline — even if you find a new job quickly.", source: "American Psychological Association, Feb 2024" },
                { num: "31%", desc: "of laid-off workers report a complete loss of professional identity, leading to identity-based depression during their search.", source: "Stanford GSB, Oct 2024" },
                { num: "83%", desc: "increased risk of developing a new stress-related health problem compared to those who kept their jobs.", source: "Yale School of Public Health, Jun 2023" },
              ].map((stat, i) => (
                <FadeIn key={i} preset="slide-up" delay={0.1 + i * 0.08} style={{ display: "flex" }}>
                  <div style={{ padding: 24, backgroundColor: colors.bgSurface, borderRadius: 14, border: `1px solid ${colors.borderDefault}`, display: "flex", flexDirection: "column" as const, width: "100%" }}>
                    <p style={{ fontFamily: display, fontSize: 32, fontWeight: 800, color: colors.textPrimary, marginBottom: 8, letterSpacing: "-0.02em", minHeight: 44 }}>{stat.num}</p>
                    <p style={{ fontFamily: body, fontSize: 13, color: colors.textBody, lineHeight: 1.55, marginBottom: 8 }}>{stat.desc}</p>
                    <p style={{ fontFamily: body, fontSize: 10, color: colors.textMuted, fontStyle: "italic" }}>{stat.source}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn preset="fade" delay={0.5}>
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 1.7,
              fontStyle: "italic",
              margin: 0,
              marginTop: 36,
              textAlign: "center" as const,
            }}
          >
            ♡ Your current world may also need the attention of a therapist.<br />Please seek all forms of support that are available to you.
          </p>
        </FadeIn>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HONEST TAKE — Differentiation (stays high on page)
   ═══════════════════════════════════════════════════════════ */
function HonestTake() {
  return (
    <section style={{ ...sectionPadding, background: colors.bgRecessed }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            An honest take
          </p>
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 36,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            What we want you to know before you start
          </h2>
        </FadeIn>

        {/* Two-column callouts */}
        <div
          className="parachute-honest-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <FadeIn preset="slide-up" delay={0.1} style={{ display: "flex" }}>
            <div
              style={{
                borderLeft: `3px solid ${colors.coral}`,
                paddingLeft: 24,
                width: "100%",
              }}
            >
              <p
                style={{
                  fontFamily: body,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase" as const,
                  color: colors.coral,
                  marginBottom: 12,
                }}
              >
                What this is (and isn't)
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 14,
                  color: colors.textBody,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                This is not a program that promises the big fix. It is a
                practical way to work through your feelings, thoughts, and
                recurring patterns — an emotional anchor in a sea of coding
                bootcamps, elevator pitch tips, and interview AI tools.
                Everyone processes loss differently. This meets you where you
                are and helps you move at your own pace.
              </p>
            </div>
          </FadeIn>

          <FadeIn preset="slide-up" delay={0.15} style={{ display: "flex" }}>
            <div
              style={{
                borderLeft: `3px solid ${colors.coral}`,
                paddingLeft: 24,
                width: "100%",
              }}
            >
              <p
                style={{
                  fontFamily: body,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  textTransform: "uppercase" as const,
                  color: colors.coral,
                  marginBottom: 12,
                }}
              >
                Built from experience
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 14,
                  color: colors.textBody,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                Being laid off has a real impact on families. We have been where
                you are. We promised ourselves to help make this easier and
                individually affordable for others.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Research stats */}
        <FadeIn preset="slide-up" delay={0.2}>
          <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, marginTop: 48, paddingTop: 40 }}>
            <p style={{ fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 14 }}>
              The research
            </p>
            <h3 style={{ fontFamily: display, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.2, color: colors.textPrimary, marginBottom: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Layoffs are not a career setback. They are a life event.
            </h3>
            <div className="parachute-research-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                { num: "2 years", desc: "for self-esteem and mental health to return to baseline — even if you find a new job quickly.", source: "American Psychological Association, Feb 2024" },
                { num: "31%", desc: "of laid-off workers report a complete loss of professional identity, leading to identity-based depression during their search.", source: "Stanford GSB, Oct 2024" },
                { num: "83%", desc: "increased risk of developing a new stress-related health problem compared to those who kept their jobs.", source: "Yale School of Public Health, Jun 2023" },
              ].map((stat, i) => (
                <FadeIn key={i} preset="slide-up" delay={0.1 + i * 0.08} style={{ display: "flex" }}>
                  <div style={{ padding: 24, backgroundColor: colors.bgSurface, borderRadius: 14, border: `1px solid ${colors.borderDefault}`, display: "flex", flexDirection: "column" as const, width: "100%" }}>
                    <p style={{ fontFamily: display, fontSize: 32, fontWeight: 800, color: colors.textPrimary, marginBottom: 8, letterSpacing: "-0.02em", minHeight: 44 }}>{stat.num}</p>
                    <p style={{ fontFamily: body, fontSize: 13, color: colors.textBody, lineHeight: 1.55, marginBottom: 8 }}>{stat.desc}</p>
                    <p style={{ fontFamily: body, fontSize: 10, color: colors.textMuted, fontStyle: "italic" }}>{stat.source}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn preset="fade" delay={0.3}>
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
              lineHeight: 1.7,
              fontStyle: "italic",
              margin: 0,
              marginTop: 40,
              textAlign: "center" as const,
            }}
          >
            ♡ Your current world may also need the attention of a therapist.<br />
            Please seek all forms of support that are available to you.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   THE RESEARCH — Data-backed (moved lower on page)
   ═══════════════════════════════════════════════════════════ */
function ResearchSection() {
  const stats = [
    {
      num: "2 years",
      desc: "for self-esteem and mental health to return to baseline — even if you find a new job quickly.",
      source: "American Psychological Association, Feb 2024",
    },
    {
      num: "31%",
      desc: "of laid-off workers report a complete loss of professional identity, leading to identity-based depression during their search.",
      source: "Stanford GSB, Oct 2024",
    },
    {
      num: "83%",
      desc: "increased risk of developing a new stress-related health problem compared to those who kept their jobs.",
      source: "Yale School of Public Health, Jun 2023",
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgRecessed }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="slide-up">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            The research
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Layoffs are not a career setback. They are a life event.
          </h2>
        </FadeIn>

        <div className="parachute-research-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 36 }}>
          {stats.map((stat, i) => (
            <FadeIn key={i} preset="slide-up" delay={0.1 + i * 0.08} style={{ display: "flex" }}>
              <div
                style={{
                  padding: 24,
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  display: "flex",
                  flexDirection: "column" as const,
                  width: "100%",
                }}
              >
                <p
                  style={{
                    fontFamily: display,
                    fontSize: 32,
                    fontWeight: 800,
                    color: colors.textPrimary,
                    marginBottom: 8,
                    letterSpacing: "-0.02em",
                    minHeight: 44,
                  }}
                >
                  {stat.num}
                </p>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 13,
                    color: colors.textBody,
                    lineHeight: 1.55,
                    marginBottom: 8,
                  }}
                >
                  {stat.desc}
                </p>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 10,
                    color: colors.textMuted,
                    fontStyle: "italic",
                  }}
                >
                  {stat.source}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PERSONALIZATION — "Built for you"
   ═══════════════════════════════════════════════════════════ */
function Personalization() {
  const cards = [
    {
      title: "Six goals from your story",
      desc: "Generated from your intake and plan selection. You choose which to work on first.",
    },
    {
      title: "Journal-driven exercises",
      desc: "Coach-designed AI reads what you write and selects exercises matched to what surfaced.",
    },
    {
      title: "Daily framework analysis",
      desc: "Each day surfaces a framework from published authors and research, applied to patterns in your entries.",
    },
    {
      title: "Assessment integration",
      desc: "Add an Enneagram or Leadership Circle Profile to deepen the personalization.",
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            Built for you
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Every day is personalized to where you actually are
          </h2>
        </FadeIn>

        <FadeIn preset="slide-up" delay={0.1}>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: 40,
            }}
          >
            You write. Your coach&apos;s AI reads. Exercises adapt. Your coaching plan
            stays on track while meeting you where you are each morning.
          </p>
        </FadeIn>

        <div
          className="parachute-pers-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {cards.map((card, i) => (
            <FadeIn key={card.title} preset="slide-up" delay={i * 0.1}>
              <div
                style={{
                  padding: 24,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 10,
                  backgroundColor: colors.bgSurface,
                  height: "100%",
                }}
              >
                <h3
                  style={{
                    fontFamily: display,
                    fontSize: 17,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    marginBottom: 10,
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: colors.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════ */
function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const INTERVAL = 5000; // 5 seconds per step

  useEffect(() => {
    if (paused) return;
    const tick = 50;
    let accumulated = 0;
    const timer = setInterval(() => {
      accumulated += (tick / INTERVAL) * 100;
      if (accumulated >= 100) {
        accumulated = 0;
        setActiveStep((s) => (s >= 5 ? 1 : s + 1));
      }
      setProgress(accumulated);
    }, tick);
    return () => clearInterval(timer);
  }, [paused]);

  const handleStepClick = (num: number) => {
    setActiveStep(num);
    setProgress(0);
    setPaused(true);
    // Resume after 8 seconds of inactivity
    setTimeout(() => setPaused(false), 8000);
  };

  const steps = [
    {
      num: 1,
      title: "Yesterday's takeaways + thought inspiration",
      desc: "What surfaced yesterday — the questions you sat with, the challenges you took on, what came up overnight. Then thought prompts drawn from where you are in the program. You can discuss them with your coaching assistant or just sit with them.",
    },
    {
      num: 2,
      title: "Free flow + journal",
      desc: "A space for whatever came up from the prompts — a sentence or two, no pressure. Then your journal: write freely, speak it, or both. Your entry shapes everything that follows.",
    },
    {
      num: 3,
      title: "Your journal shapes your exercises",
      desc: "Your coaching assistant reads what you wrote, notices patterns, and selects exercises matched to what actually surfaced today. Each exercise explains why it was chosen, the science behind it, and walks you through it step by step. Talk through it with your assistant or do it on your own.",
    },
    {
      num: 4,
      title: "Personalized exercises + goal integration",
      desc: null, // complex content rendered inline
    },
    {
      num: 5,
      title: "Questions to sit with + challenges for tomorrow",
      desc: "Open questions drawn from today's session — the kind that shift something just by carrying them. Plus small real-world experiments to try before tomorrow. You choose which ones to commit to, and they come back in tomorrow's check-in.",
    },
  ];

  return (
    <section
      id="how"
      style={{ ...sectionPadding, background: colors.bgRecessed, position: "relative" as const, overflow: "hidden" }}
    >
      <img
        src="/arc-bg.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.8,
        }}
      />
      <div style={{ maxWidth: narrowMax, margin: "0 auto", position: "relative" as const, zIndex: 1 }}>
        {/* The arc — 4 weeks */}
        <FadeIn preset="fade" delay={0.25}>
          <div style={{
            marginBottom: 56,
            borderBottom: `1px solid ${colors.borderSubtle}`,
            paddingBottom: 48,
          }}>
            <div style={{
              background: "rgba(20, 19, 24, 0.4)",
              borderRadius: 12,
              padding: "28px 32px",
              marginBottom: 28,
              maxWidth: 580,
            }}>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                  color: colors.coral,
                  marginBottom: 14,
                }}
              >
                The arc
              </p>
              <h3
                style={{
                  fontFamily: display,
                  fontSize: "clamp(22px, 3vw, 30px)",
                  lineHeight: 1.2,
                  color: colors.textPrimary,
                  marginBottom: 12,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                }}
              >
                Four weeks. Four territories.
              </h3>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 15,
                  color: "#ffffff",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Each week goes somewhere specific. Your goals stay with you
                the whole way.
              </p>
            </div>
            <div
              className="parachute-arc-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {[
                { week: "Week 1", title: "Ground", desc: "Name what actually happened. Look at what you lost — not just the job, but the routine, the identity, the people. Calm your nervous system. Start the daily practice." },
                { week: "Week 2", title: "Dig", desc: "Figure out what you believe about yourself and where those beliefs came from. Family patterns around work. Stories about worth. What is actually true and what is inherited." },
                { week: "Week 3", title: "Build", desc: "Collect the evidence for what you are good at. Write an honest story about what happened that you can stand behind. Start seeing what wants to come next." },
                { week: "Week 4", title: "Orient", desc: "Look at the disruptions again. See what shifted. Test your new story under pressure. Name what is still unfinished. Build the version of this practice you keep after the program ends." },
              ].map((w, i) => (
                <FadeIn key={w.week} preset="slide-up" delay={i * 0.1}>
                  <div
                    style={{
                      padding: 22,
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: 10,
                      backgroundColor: "rgba(20, 19, 24, 0.4)",
                      height: "100%",
                    }}
                  >
                    <p style={{ fontFamily: body, fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 8 }}>{w.week}</p>
                    <h4 style={{ fontFamily: display, fontSize: 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>{w.title}</h4>
                    <p style={{ fontFamily: body, fontSize: 13, color: "#ffffff", lineHeight: 1.55 }}>{w.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn preset="fade">
          <div style={{
            background: "rgba(20, 19, 24, 0.4)",
            borderRadius: 12,
            padding: "28px 32px",
            marginBottom: 40,
            maxWidth: 580,
          }}>
            <p
              style={{
                fontFamily: body,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                color: colors.coral,
                marginBottom: 14,
              }}
            >
              Your daily flow
            </p>
            <h3
              style={{
                fontFamily: display,
                fontSize: "clamp(22px, 3vw, 30px)",
                lineHeight: 1.2,
                color: colors.textPrimary,
                marginBottom: 12,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              15-30 minutes a day. Five steps.
            </h3>
            <p
              style={{
                fontFamily: body,
                fontSize: 17,
                color: "#ffffff",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              The required exercises take about 5 minutes. The optional ones go
              deeper. You decide how much time you have each day.
            </p>
          </div>
        </FadeIn>

        {/* Interactive step selector */}
        <FadeIn preset="slide-up">
          <div style={{ marginTop: 40, background: "rgba(20, 19, 24, 0.4)", borderRadius: 14, padding: "24px 24px 28px" }}>
            {/* Step number tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 0 }}>
              {steps.map((step) => (
                <button
                  key={step.num}
                  onClick={() => handleStepClick(step.num)}
                  style={{
                    flex: 1,
                    padding: "14px 0",
                    border: "none",
                    borderBottom: activeStep === step.num
                      ? `3px solid ${colors.coral}`
                      : `1px solid ${colors.borderSubtle}`,
                    background: activeStep === step.num
                      ? "rgba(20, 19, 24, 0.4)"
                      : "transparent",
                    borderRadius: activeStep === step.num ? "10px 10px 0 0" : 0,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: activeStep === step.num ? colors.coral : colors.coralWash,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: body,
                      fontWeight: 700,
                      fontSize: 13,
                      color: activeStep === step.num ? colors.bgDeep : colors.coral,
                      transition: "all 0.2s",
                    }}
                  >
                    {step.num}
                  </span>
                  <span
                    className="parachute-step-label"
                    style={{
                      fontFamily: body,
                      fontSize: 10,
                      fontWeight: 600,
                      color: activeStep === step.num ? "#ffffff" : "rgba(255,255,255,0.7)",
                      letterSpacing: 0.5,
                      textAlign: "center" as const,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                  {/* Progress bar */}
                  <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1, overflow: "hidden", marginTop: 4 }}>
                    <div
                      style={{
                        height: "100%",
                        width: activeStep === step.num ? `${progress}%` : "0%",
                        background: colors.coral,
                        borderRadius: 1,
                        transition: activeStep === step.num ? "width 50ms linear" : "none",
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Active step content */}
            <AnimatePresence mode="wait">
              {steps.filter(s => s.num === activeStep).map((step) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    padding: "32px 28px",
                    backgroundColor: "rgba(20, 19, 24, 0.4)",
                    borderRadius: "0 0 14px 14px",
                    border: `1px solid ${colors.borderDefault}`,
                    borderTop: "none",
                    minHeight: 180,
                  }}
                >
                  <h4
                    style={{
                      fontFamily: display,
                      fontSize: 20,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      marginBottom: 14,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h4>

                  {step.num === 4 ? (
                    <div style={{ fontFamily: body, fontSize: 14, color: "#ffffff", lineHeight: 1.7 }}>
                      <p style={{ marginBottom: 12 }}>
                        <strong style={{ color: "#ffffff" }}>Coaching plan exercise</strong>{" "}
                        — matched to your program arc and weekly territory. Explains why it was selected and the science behind it.
                      </p>
                      <p style={{ marginBottom: 12 }}>
                        <strong style={{ color: "#ffffff" }}>Journal-matched exercises</strong>{" "}
                        — 2 exercises selected from 350+ sourced tools, responding to what you actually wrote today. Each one includes context, a framework explanation, and step-by-step instructions.
                      </p>
                      <p style={{ marginBottom: 12 }}>
                        <strong style={{ color: "#ffffff" }}>Goal-matched exercise</strong> — one exercise connected to your active coaching goals, so your daily work stays aligned with where you're headed.
                      </p>
                      <p>
                        <strong style={{ color: "#ffffff" }}>Talk through it or write</strong> — every exercise can be done as a voice conversation with your coaching assistant, or completed by writing. Park any exercise for later.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontFamily: body, fontSize: 15, color: "#ffffff", lineHeight: 1.7, margin: 0 }}>
                      {step.desc}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Mid-page CTA */}
        <FadeIn preset="fade" delay={0.3}>
          <div style={{ textAlign: "center" as const, marginTop: 36 }}>
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: body,
                fontSize: 15,
                fontWeight: 600,
                padding: "14px 32px",
                borderRadius: 8,
                textDecoration: "none",
                backgroundColor: colors.coral,
                color: "#ffffff",
                transition: "all 0.2s",
                border: "none",
              }}
            >
              Sliding scale from $29
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   4-WEEK ARC
   ═══════════════════════════════════════════════════════════ */
function WeekArc() {
  const weeks = [
    {
      week: "Week 1",
      title: "Ground",
      desc: "What actually happened. Name the losses across all seven disruptions. Stabilize the nervous system. Identify saboteur patterns. Establish the daily practice.",
    },
    {
      week: "Week 2",
      title: "Dig",
      desc: "What you believe and where it came from. Limiting beliefs. Family patterns around work and worth. Saboteur deepening. Values excavation from lived experience.",
    },
    {
      week: "Week 3",
      title: "Build",
      desc: "Competence evidence. An honest narrative you can stand behind. Perspective on performance culture and market shifts. Self-efficacy. What wants to emerge.",
    },
    {
      week: "Week 4",
      title: "Orient",
      desc: "Reassess the disruptions. Test your patterns under pressure. Pressure-test your values and narrative. Name what is unresolved. Build the practice you keep.",
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            The arc
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Four weeks. Four territories.
          </h2>
        </FadeIn>

        <FadeIn preset="slide-up" delay={0.1}>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: 40,
            }}
          >
            The program moves through developmental territory in sequence. Your
            goals flex within the arc.
          </p>
        </FadeIn>

        <div
          className="parachute-arc-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {weeks.map((w, i) => (
            <FadeIn key={w.week} preset="slide-up" delay={i * 0.1}>
              <div
                style={{
                  padding: 22,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 10,
                  backgroundColor: colors.bgSurface,
                  height: "100%",
                }}
              >
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 2,
                    textTransform: "uppercase" as const,
                    color: colors.coral,
                    marginBottom: 8,
                  }}
                >
                  {w.week}
                </p>
                <h3
                  style={{
                    fontFamily: display,
                    fontSize: 18,
                    fontWeight: 600,
                    color: colors.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  {w.title}
                </h3>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 13,
                    color: colors.textMuted,
                    lineHeight: 1.55,
                  }}
                >
                  {w.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIAL CAROUSEL
   ═══════════════════════════════════════════════════════════ */
function TestimonialCarousel() {
  const testimonials = [
    { quote: "Honestly, I wish I had this when I got laid off last year. I spent months just... stuck. The journaling alone would have gotten me out of my head way sooner.", who: "Former senior PM" },
    { quote: "The framework thing caught me off guard. One day it pulled up this concept that perfectly described what I had been feeling for weeks but could not put into words. That hit different.", who: "Former engineering lead" },
    { quote: "I almost did not sign up because — AI coaching? Really? But by day 5 I forgot it was AI. I was just doing the work and actually thinking about my own stuff.", who: "Former director of operations" },
    { quote: "What helped me was having something to do every day that was not doom-scrolling LinkedIn. A structured way to sit with it instead of just spiraling.", who: "Former product manager" },
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselPaused, testimonials.length]);

  const handleDotClick = (idx: number) => {
    setActiveIdx(idx);
    setCarouselPaused(true);
    setTimeout(() => setCarouselPaused(false), 10000);
  };

  return (
    <FadeIn preset="fade">
      <p
        style={{
          fontFamily: body,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 2,
          textTransform: "uppercase" as const,
          color: colors.coral,
          marginBottom: 24,
        }}
      >
        What early adopters are saying
      </p>
      <div
        style={{
          position: "relative" as const,
          minHeight: 160,
          padding: "28px 32px",
          backgroundColor: colors.bgSurface,
          borderRadius: 14,
          border: `1px solid ${colors.borderDefault}`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={activeIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: body,
              fontSize: 16,
              color: "#F0EDE6",
              lineHeight: 1.75,
              fontStyle: "italic",
              margin: 0,
              paddingLeft: 20,
              borderLeft: `3px solid ${activeIdx % 2 === 0 ? colors.coral : colors.coral}`,
            }}
          >
            {testimonials[activeIdx].quote}
            <span
              style={{
                display: "block",
                fontSize: 12,
                color: "#C8CDD2",
                fontStyle: "normal",
                marginTop: 12,
                fontWeight: 600,
              }}
            >
              — {testimonials[activeIdx].who}
            </span>
          </motion.blockquote>
        </AnimatePresence>

        {/* Dot navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              style={{
                width: activeIdx === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                background: activeIdx === i ? colors.coral : "rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════ */
function Pricing() {
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("checkout") === "cancelled";
  const [dismissCancelled, setDismissCancelled] = useState(false);
  const [slidingAmounts, setSlidingAmounts] = useState<Record<string, number>>({
    pay_what_you_can: 39,
    pay_it_forward: 59,
  });
  const [touchedSlider, setTouchedSlider] = useState<Record<string, boolean>>({});
  const [selectedTier, setSelectedTier] = useState("standard");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("layoff_page_view", {});
    if (cancelled) {
      trackEvent("checkout_cancelled", { program: "parachute" });
    }
  }, [cancelled]);

  const handleCheckout = async (tier: string, amount?: number) => {
    setCheckoutLoading(tier);
    setCheckoutError(null);
    const tierLabel = tier === "pay_what_you_can" ? "pay_what_you_can" : tier === "pay_it_forward" ? "pay_it_forward" : "standard";
    trackEvent(`parachute_${tierLabel}_begin_checkout`, { tier, price: amount ? `$${amount}` : tier });
    trackEvent("begin_checkout", { package: "parachute", tier, price: amount ? `$${amount}` : tier });
    try {
      const res = await fetch("/api/checkout/parachute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, amount }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else {
        console.error("Checkout error:", data.error);
        setCheckoutError("Payment couldn\u2019t be started. Please try again or contact crew@allmindsondeck.com.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutError("Connection issue. Check your internet and try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const tiers = [
    {
      key: "pay_what_you_can",
      price: "$29–48",
      name: "Pay what you can",
      desc: "Money is tight right now. Pick any amount in this range — no proof, no questions asked.",
      highlight: false,
      badge: null,
      sliding: true,
      min: 29,
      max: 48,
    },
    {
      key: "standard",
      price: "$49",
      name: "Standard",
      desc: "Less than a drip coffee a day for 30 days of structured coaching.",
      highlight: true,
      badge: "Most common",
      sliding: false,
      min: 49,
      max: 49,
    },
    {
      key: "pay_it_forward",
      price: "$50–69",
      name: "Pay it forward",
      desc: "You have room and want to help make the lower tier possible. Your extra contribution directly funds access for someone who needs it.",
      highlight: false,
      badge: null,
      sliding: true,
      min: 50,
      max: 69,
    },
  ];

  const features = [
    "30 days of structured, personalized coaching",
    "A plan that adapts to how you actually react",
    "6 coaching goals built from your specific situation",
    "180+ exercises selected from a 350+ tool library",
    "A published framework applied to your patterns — daily",
    "Journal analysis that spots what you might miss",
    "Access continues until your goals are done",
    "Your data is yours — downloadable anytime",
    "7-day money-back guarantee, no questions",
    "A real human coach on email — always available when you need one",
  ];

  return (
    <section
      style={{ ...sectionPadding, background: colors.bgDeep }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <TestimonialCarousel />

        <div id="pricing" style={{ borderBottom: `1px solid ${colors.borderSubtle}`, margin: "48px 0 48px" }} />

        {cancelled && !dismissCancelled && (
          <div style={{
            padding: "14px 20px",
            backgroundColor: "rgba(214, 182, 93, 0.12)",
            border: `1px solid ${colors.warning}`,
            borderRadius: 8,
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <p style={{ fontSize: 14, fontFamily: body, color: colors.warning, margin: 0 }}>
              Checkout was cancelled. No charge was made. You can try again whenever you&rsquo;re ready.
            </p>
            <button
              onClick={() => setDismissCancelled(true)}
              style={{
                background: "none", border: "none", color: colors.warning,
                cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0,
              }}
            >
              &times;
            </button>
          </div>
        )}

        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            Sliding scale
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 20,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              textAlign: "center" as const,
            }}
          >
            Choose the level that fits where you are right now.
          </h2>
        </FadeIn>

        {/* Self-guided program — single card with tier selector */}
        <FadeIn preset="slide-up" delay={0.1}>
          <div
            className="parachute-pricing-card"
            style={{
              padding: 32,
              border: `2px solid ${colors.coral}`,
              borderRadius: 14,
              backgroundColor: colors.bgSurface,
              position: "relative" as const,
              boxShadow: `0 4px 32px rgba(224, 149, 133, 0.1)`,
              maxWidth: 480,
              margin: "0 auto 48px",
            }}
          >
            <span
              style={{
                position: "absolute" as const,
                top: -13,
                left: 20,
                backgroundColor: colors.coral,
                color: "#ffffff",
                fontFamily: body,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
                padding: "5px 12px",
                borderRadius: 6,
              }}
            >
              Most common
            </span>

            <p style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Self-guided program
            </p>
            <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>
              Everyone gets the same program. Same exercises, same depth, same access. The only difference is what you can afford right now. One payment. Access until your goals are complete.
            </p>
            <p style={{ fontFamily: display, fontSize: 36, fontWeight: 700, color: colors.coral, marginBottom: 20, letterSpacing: "-0.02em" }}>
              {tiers.find((t) => t.key === selectedTier)?.price}
            </p>

            {/* Tier selector pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {tiers.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => {
                    setSelectedTier(tier.key);
                    trackEvent(`layoff_${tier.key}_price_click`, { tier: tier.key, price: tier.price });
                  }}
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    fontFamily: body,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "10px 8px",
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor: selectedTier === tier.key ? colors.coral : colors.bgElevated,
                    color: selectedTier === tier.key ? "#ffffff" : colors.textSecondary,
                    border: selectedTier === tier.key ? "none" : `1px solid ${colors.borderDefault}`,
                    transition: "all 0.2s",
                  }}
                >
                  {tier.name}
                </button>
              ))}
            </div>

            <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
              {tiers.find((t) => t.key === selectedTier)?.desc}
            </p>

            {/* Slider for sliding-scale tiers */}
            {tiers.find((t) => t.key === selectedTier)?.sliding && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>${tiers.find((t) => t.key === selectedTier)?.min}</span>
                  <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>${slidingAmounts[selectedTier]}</span>
                  <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>${tiers.find((t) => t.key === selectedTier)?.max}</span>
                </div>
                <input
                  type="range"
                  min={tiers.find((t) => t.key === selectedTier)?.min}
                  max={tiers.find((t) => t.key === selectedTier)?.max}
                  value={slidingAmounts[selectedTier] || 0}
                  onChange={(e) => {
                    setSlidingAmounts((prev) => ({ ...prev, [selectedTier]: Number(e.target.value) }));
                    if (!touchedSlider[selectedTier]) setTouchedSlider((prev) => ({ ...prev, [selectedTier]: true }));
                  }}
                  onPointerUp={() => trackEvent(`layoff_${selectedTier}_slider_amount`, { amount: slidingAmounts[selectedTier] })}
                  style={{ width: "100%", accentColor: colors.coral, cursor: "pointer" }}
                />
              </div>
            )}

            <button
              onClick={() => {
                const tier = tiers.find((t) => t.key === selectedTier);
                handleCheckout(selectedTier, tier?.sliding ? slidingAmounts[selectedTier] : undefined);
              }}
              disabled={checkoutLoading === selectedTier}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                fontFamily: body,
                fontSize: 14,
                fontWeight: 600,
                padding: "14px 20px",
                borderRadius: 8,
                cursor: checkoutLoading === selectedTier ? "wait" : "pointer",
                backgroundColor: colors.coral,
                color: "#ffffff",
                transition: "all 0.25s ease",
                border: "none",
                opacity: checkoutLoading === selectedTier ? 0.6 : 1,
              }}
            >
              {checkoutLoading === selectedTier
                ? "Redirecting..."
                : tiers.find((t) => t.key === selectedTier)?.sliding
                  ? `Start now — $${slidingAmounts[selectedTier]}`
                  : "Start now"}
            </button>
            {checkoutError && (
              <p style={{
                fontSize: 13, color: "#E08585", textAlign: "center",
                margin: "10px 0 0 0", fontFamily: body, lineHeight: 1.5,
              }}>
                {checkoutError}
              </p>
            )}
            <p style={{
              fontSize: 12, color: colors.textPrimary, textAlign: "center",
              margin: "10px 0 0 0", fontFamily: body, lineHeight: 1.5, opacity: 0.7,
            }}>
              7-day money-back guarantee. If the program is not working for you within the first week, request a full refund. No conditions. No forms.
            </p>
          </div>
        </FadeIn>

        {/* Enneagram + 1:1 side by side */}
        <div
          className="parachute-addon-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "stretch",
            marginBottom: 48,
          }}
        >
          {/* Program + Enneagram */}
          <FadeIn preset="slide-up" delay={0.35} style={{ display: "flex" }}>
            <div
              style={{
                padding: 28,
                border: `2px solid ${colors.coral}`,
                borderRadius: 14,
                backgroundColor: colors.bgSurface,
                position: "relative" as const,
                display: "flex",
                flexDirection: "column" as const,
                width: "100%",
              }}
            >
              <span
                style={{
                  position: "absolute" as const,
                  top: -13,
                  left: 20,
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  fontFamily: body,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase" as const,
                  padding: "5px 12px",
                  borderRadius: 6,
                }}
              >
                Deep Insight
              </span>

              <div style={{ minHeight: 90 }}>
                <p style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: 4, letterSpacing: "-0.02em" }}>Program + Enneagram</p>
                <p style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.coral, marginBottom: 14, letterSpacing: "-0.02em" }}>$349</p>
              </div>
              <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                The self-guided program plus the IEQ9 Enneagram — the assessment professional coaches actually use. It shows you why you react the way you do under pressure, what patterns keep repeating, and how to work with them. Includes a 1-hour live debrief. Your results shape every exercise.
              </p>

              <button
                onClick={() => handleCheckout("enneagram")}
                disabled={checkoutLoading === "enneagram"}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  fontFamily: body,
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "12px 20px",
                  borderRadius: 8,
                  cursor: checkoutLoading === "enneagram" ? "wait" : "pointer",
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  transition: "all 0.25s ease",
                  border: "none",
                  opacity: checkoutLoading === "enneagram" ? 0.6 : 1,
                }}
              >
                {checkoutLoading === "enneagram" ? "Redirecting..." : "Start now"}
              </button>
            </div>
          </FadeIn>

          {/* 1:1 Coaching */}
          <FadeIn preset="slide-up" delay={0.4} style={{ display: "flex" }}>
            <div
              style={{
                padding: 28,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: 14,
                backgroundColor: colors.bgSurface,
                position: "relative" as const,
                display: "flex",
                flexDirection: "column" as const,
                width: "100%",
              }}
            >
              <span
                style={{
                  position: "absolute" as const,
                  top: -13,
                  left: 20,
                  backgroundColor: colors.bgElevated,
                  color: colors.textPrimary,
                  fontFamily: body,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase" as const,
                  padding: "5px 12px",
                  borderRadius: 6,
                }}
              >
                Dedicated Expert-Coach
              </span>

              <div style={{ minHeight: 90 }}>
                <p style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: 4, letterSpacing: "-0.02em" }}>Program Intensive</p>
                <p style={{ fontFamily: display, fontSize: 28, fontWeight: 700, color: colors.coral, marginBottom: 14, letterSpacing: "-0.02em" }}>1:1 Thinking Partner</p>
              </div>
              <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.6, flex: 1, marginBottom: 20 }}>
                Everything in the self-guided program, plus weekly or bi-weekly 1:1 coaching sessions throughout your search. Includes a personal Enneagram assessment, so you can see where your defaults help and where they cost you.
              </p>

              <a
                href="/apply"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  fontFamily: body,
                  fontSize: 14,
                  fontWeight: 600,
                  padding: "12px 20px",
                  borderRadius: 8,
                  cursor: "pointer",
                  backgroundColor: colors.bgElevated,
                  color: colors.textPrimary,
                  transition: "all 0.25s ease",
                  border: `1px solid ${colors.borderDefault}`,
                  textDecoration: "none",
                  boxSizing: "border-box" as const,
                }}
              >
                Apply
              </a>
            </div>
          </FadeIn>
        </div>

        {/* What's included — shared feature list */}
        <FadeIn preset="fade" delay={0.4}>
          <div
            style={{
              padding: 32,
              backgroundColor: colors.bgSurface,
              borderRadius: 14,
              border: `1px solid ${colors.borderDefault}`,
            }}
          >
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
                color: colors.textMuted,
                marginBottom: 20,
              }}
            >
              What you get — every tier, same program
            </p>
            <div
              className="parachute-features-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px 32px",
              }}
            >
              {features.map((f) => (
                <div
                  key={f}
                  style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: colors.textBody,
                    padding: "6px 0 6px 22px",
                    position: "relative" as const,
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      position: "absolute" as const,
                      left: 0,
                      color: colors.coral,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    ✓
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn preset="fade" delay={0.5}>
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
              marginTop: 24,
              textAlign: "center" as const,
              lineHeight: 1.7,
            }}
          >
            Costs less than a single coaching session. Not a subscription.
            One payment. Access until goals are complete.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   7-DAY GUARANTEE
   ═══════════════════════════════════════════════════════════ */
function Guarantee() {
  return (
    <section style={{ ...sectionPaddingSmall, background: colors.bgRecessed }}>
      <FadeIn preset="fade">
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            textAlign: "center" as const,
            padding: "0 24px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: colors.coral,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 22,
              color: "#FFFFFF",
            }}
          >
            ✦
          </div>
          <h2
            style={{
              fontFamily: display,
              fontSize: 26,
              fontWeight: 700,
              color: colors.textPrimary,
              marginBottom: 14,
              letterSpacing: "-0.01em",
            }}
          >
            7-day money-back guarantee
          </h2>
          <p
            style={{
              fontFamily: body,
              fontSize: 15,
              color: colors.textSecondary,
              lineHeight: 1.7,
            }}
          >
            If the program is not working for you within the first week, request
            a full refund. No conditions. No forms. If it is not useful, you
            should not pay for it.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATA & PRIVACY
   ═══════════════════════════════════════════════════════════ */
function DataPrivacy() {
  const points = [
    { title: "Your data, always", desc: "Download everything as PDF or JSON. Delete it in 24 hours. It never stops being yours." },
    { title: "AI does not train on you", desc: "Anthropic's Claude and Deepgram process your data. Neither trains on it. Ever." },
    { title: "No one reads your journal", desc: "Processed by AI only. No human reads it unless you share." },
  ];

  return (
    <section style={{ ...sectionPaddingSmall, background: colors.bgDeep }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p style={{ fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 14, textAlign: "center" as const }}>
            Data &amp; privacy
          </p>
        </FadeIn>
        <FadeIn preset="slide-up">
          <div
            className="parachute-privacy-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}
          >
            {points.map((p, i) => (
              <div key={p.title} style={{ textAlign: "center" as const, padding: "28px 20px", background: colors.bgSurface, borderRadius: 12, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", border: `1px solid ${colors.borderDefault}` }}>
                <p style={{ fontFamily: body, fontSize: 18, marginBottom: 10, color: colors.coral }}>{["◼", "◼", "◼"][i]}</p>
                <p style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>{p.title}</p>
                <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <div style={{ textAlign: "center", marginTop: 48, marginBottom: 16 }}>
          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: body,
              fontSize: 15,
              fontWeight: 600,
              padding: "14px 32px",
              borderRadius: 50,
              textDecoration: "none",
              backgroundColor: colors.coral,
              color: "#ffffff",
              transition: "all 0.2s",
              border: "none",
            }}
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   AFTER THE PROGRAM — 3 Paths
   ═══════════════════════════════════════════════════════════ */
function AfterProgram() {
  const paths = [
    {
      num: 1,
      title: "Start another program",
      desc: "New Role (BASECAMP) or future programs. Your history, values work, and assessment data carry forward.",
    },
    {
      num: 2,
      title: "Continue with daily coaching — $49/month",
      desc: "Daily journaling with exercises from the full content library. No fixed arc. Your complete history informs and personalizes ongoing growth work.",
    },
    {
      num: 3,
      title: "End the engagement",
      desc: "Download all your data. Your journal, exercises, values work, narrative drafts. It is yours. No further charges.",
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgRecessed }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            After the program
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 40,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Three paths when your goals are complete
          </h2>
        </FadeIn>

        {paths.map((p, i) => (
          <FadeIn key={p.num} preset="slide-up" delay={i * 0.1}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr",
                gap: 16,
                padding: "24px 0",
                borderBottom: `1px solid ${colors.borderSubtle}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(224, 149, 133, 0.12)",
                  border: `1.5px solid rgba(123,82,120,0.25)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: body,
                  fontWeight: 600,
                  fontSize: 14,
                  color: colors.coral,
                  flexShrink: 0,
                }}
              >
                {p.num}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: body,
                    fontWeight: 600,
                    fontSize: 15,
                    color: colors.textPrimary,
                    marginBottom: 4,
                  }}
                >
                  {p.title}
                </div>
                <div
                  style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: colors.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  {p.desc}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FAQ — Accordion
   ═══════════════════════════════════════════════════════════ */
function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: body,
          fontWeight: 600,
          fontSize: 15,
          color: colors.textPrimary,
          padding: "20px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left" as const,
        }}
      >
        {question}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 22,
            color: colors.textMuted,
            flexShrink: 0,
            marginLeft: 16,
            lineHeight: 1,
          }}
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: body,
                fontSize: 14,
                color: colors.textMuted,
                lineHeight: 1.7,
                paddingBottom: 20,
              }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeTopic, setActiveTopic] = useState("The program");

  const topics = ["The program", "Pricing", "Data & privacy", "About"];

  const items: { q: string; a: string; topic: string }[] = [
    {
      topic: "The program",
      q: "How much time does this take each day?",
      a: "The required coaching plan exercises take about 5 minutes. If you do all the optional overflow exercises, 25-30 minutes. Most people settle into 15-20 minutes. You decide each day based on your time and energy.",
    },
    {
      topic: "The program",
      q: "What happens if I cannot finish in 30 days?",
      a: "Your access does not get cut at Day 30. The program continues until your core coaching goals have been addressed. One payment at whatever tier you chose. You are done when you are done.",
    },
    {
      topic: "The program",
      q: "Where do the exercises come from?",
      a: "From a curated library of 350+ tools sourced from established frameworks: IFS (Richard Schwartz), ACT (Steven Hayes), DBT (Marsha Linehan), NVC (Marshall Rosenberg), Co-Active Coaching (CTI), Positive Intelligence (Shirzad Chamine), CBT (Aaron Beck, David Burns), MBSR (Jon Kabat-Zinn), EMDR-derived self-use tools, and more. Over 30 days you will work through 180+ exercises personalized to your situation. Every exercise cites its source.",
    },
    {
      topic: "The program",
      q: "Is this therapy?",
      a: "No. This is a coaching program. It uses evidence-based tools but it is not a substitute for therapy. If patterns surface that would benefit from professional clinical support, the program will flag that clearly.",
    },
    {
      topic: "Pricing",
      q: "Why a sliding scale?",
      a: "Layoffs hit your finances. We did not want cost to be the reason someone cannot access this program. The standard price is $49. If that is too much right now, pick anything from $29-48 — no proof, no questions. If you have room, the $50-69 tier helps fund access for people in financial hardship. Everyone gets the exact same program.",
    },
    {
      topic: "Pricing",
      q: "Can I get live coaching sessions?",
      a: "Yes. Individual sessions and intensive packages are available via a brief application. These are linked from your dashboard but require a separate intake to ensure fit.",
    },
    {
      topic: "Data & privacy",
      q: "What about my data?",
      a: 'Your data is yours. Download it any time (PDF or JSON). All journal entries, exercises, summaries, values work, narrative drafts. If you want it deleted, hit "Delete My Data" and it is gone within 24 hours. Irreversible. We use Anthropic\'s Claude API for processing (they do not train on your data) and Deepgram for voice transcription under the same terms.',
    },
    {
      topic: "The program",
      q: "Is this just AI-generated self-help?",
      a: "No. The content library was built by a certified coach from established, peer-reviewed frameworks. The AI personalizes which exercises surface based on what you write — it does not generate exercises. Every tool cites its source. The AI selects and sequences. A human designed what it selects from.",
    },
    {
      topic: "The program",
      q: "Can a program really help with something this personal?",
      a: "It depends on what you need. This will not replace a close friend, a therapist, or a long walk. What it does is give you a structured daily practice to process what happened — grounded in frameworks that work. Some people need structure to start moving. If that is you, this was built for you.",
    },
    {
      topic: "The program",
      q: "What if I do not like journaling?",
      a: "You can use voice instead. It transcribes and processes it the same way. Some people type, some people talk. Both work. The exercises also include somatic, relational, and cognitive modalities — journaling is the anchor, not the only thing.",
    },
    {
      topic: "Pricing",
      q: "Why should I pay for this when there are free resources?",
      a: "There are excellent free resources. What they do not do is personalize to your specific situation, track your patterns over time, select the right exercise on the right day, or hold your goals across 30 days. This is not content. It is a coach-designed practice that adapts to you.",
    },
    {
      topic: "Pricing",
      q: "What is the Enneagram package and is it worth it?",
      a: "The full package includes the 30-day program plus the IEQ9 Integrative Enneagram — one of the most comprehensive psychometric assessments available. You get a 1-hour live debrief with a certified coach, and your Enneagram data is woven into every exercise and framework analysis. If you want the deepest version of this experience, that is the one.",
    },
    {
      topic: "The program",
      q: "What happens after the 30 days?",
      a: "Three options: start another program (like New Role), continue with daily coaching for $49/month with no fixed arc, or end and download all your data. Your history, values work, and assessment data carry forward if you continue.",
    },
    {
      topic: "Data & privacy",
      q: "Who can see what I write?",
      a: "No one. Your journal entries are processed by AI to personalize your experience. No human reads them. The only exception is if you choose to share something with your coach via email. Your data is encrypted, downloadable, and deletable at any time.",
    },
    {
      topic: "Data & privacy",
      q: "What happens to my data if I stop?",
      a: "Nothing changes. Your data stays accessible and downloadable. If you want it deleted, request it and it is gone within 24 hours. We do not sell, share, or use your data for anything other than running your program.",
    },
    {
      topic: "About",
      q: "Who built this?",
      a: "Getting laid off sent me through an emotional rollercoaster I wasn\u2019t prepared for. As a product leader and certified coach, I channeled that experience into building what I wished had existed \u2014 a structured way to help people actually process these career-defining moments. I\u2019ve since coached people through layoffs, PIPs, and disorienting new roles, picking up frameworks and tools along the way that genuinely move the needle. \u2014 Stefanie Kamps, Founder",
    },
    {
      topic: "About",
      q: "How is this different from BetterUp or other coaching platforms?",
      a: "Those platforms connect you with a coach for scheduled sessions. This is a daily practice — coach-designed AI that reads what you write, selects exercises from a library of 350+ sourced tools, tracks your patterns, and adapts every day. You also have email access to a certified coach when you need it. Different model, different price point, different depth.",
    },
    {
      topic: "The program",
      q: "How quickly do I start after purchase?",
      a: "Immediately. After purchase you complete a short intake — about 10 minutes. Your answers are used to generate your six coaching goals and personalize Day 1. You can start the same day.",
    },
    {
      topic: "The program",
      q: "Can I do this on my phone?",
      a: "Yes. The program runs in your browser — phone, tablet, or desktop. You can also use voice instead of typing. There is no app to download.",
    },
  ];

  const filtered = items.filter((i) => i.topic === activeTopic);

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            Questions
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 40,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Frequently asked
          </h2>
        </FadeIn>

        <FadeIn preset="fade" delay={0.1}>
          <div
            className="parachute-faq-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Topic nav — left column */}
            <nav
              className="parachute-faq-nav"
              style={{
                display: "flex",
                flexDirection: "column" as const,
                gap: 4,
                position: "sticky" as const,
                top: 100,
              }}
            >
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setActiveTopic(topic);
                    setOpenIndex(null);
                  }}
                  style={{
                    background: activeTopic === topic ? colors.bgElevated : "transparent",
                    border: activeTopic === topic
                      ? `1px solid ${colors.borderDefault}`
                      : "1px solid transparent",
                    borderRadius: 8,
                    padding: "10px 14px",
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: activeTopic === topic ? 600 : 400,
                    color: activeTopic === topic ? colors.textPrimary : colors.textMuted,
                    cursor: "pointer",
                    textAlign: "left" as const,
                    transition: "all 0.15s",
                  }}
                >
                  {topic}
                </button>
              ))}
            </nav>

            {/* Questions — right column */}
            <div>
              {filtered.map((item, i) => (
                <FAQItem
                  key={`${activeTopic}-${i}`}
                  question={item.q}
                  answer={item.a}
                  isOpen={openIndex === i}
                  onToggle={() =>
                    setOpenIndex(openIndex === i ? null : i)
                  }
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SAMPLE DAY — What a typical day looks like
   ═══════════════════════════════════════════════════════════ */
function SampleDay() {
  const moments = [
    { time: "Morning", label: "Check in + journal", desc: "Yesterday's takeaways surface. Thought prompts based on your program arc. Then write freely — your entry shapes the exercises that follow." },
    { time: "Morning", label: "Personalized exercises", desc: "4 exercises matched to your journal, goals, and coaching plan. Each explains why it was selected and the science behind it. Talk through them or write." },
    { time: "Anytime", label: "Park + return", desc: "Not ready for an exercise? Park it for later. It shows up in your dashboard. Do it when the timing is right." },
    { time: "Evening", label: "Close your day", desc: "Questions to sit with overnight. Small challenges to try before tomorrow. Choose what to commit to — it comes back in tomorrow's check-in." },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            A typical day
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Here is what Day 7 looks like
          </h2>
        </FadeIn>

        <FadeIn preset="slide-up" delay={0.1}>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 540,
              marginBottom: 40,
            }}
          >
            Every day is different. This is an example — yours will be shaped by
            what you write and what the coaching intelligence learns about you.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {moments.map((m, i) => (
            <FadeIn key={i} preset="slide-up" delay={0.12 + i * 0.06}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom: i < moments.length - 1 ? `1px solid ${colors.borderSubtle}` : "none",
                }}
              >
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase" as const,
                    color: colors.textMuted,
                    paddingTop: 2,
                  }}
                >
                  {m.time}
                </p>
                <div>
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 15,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {m.label}
                  </p>
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 13,
                      color: colors.textMuted,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {m.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn preset="fade" delay={0.5}>
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
              marginTop: 24,
              fontStyle: "italic",
            }}
          >
            Total time: 5 minutes required. 15-20 minutes if you do the optional exercises.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WHAT YOU WALK AWAY WITH — Tangible outcomes
   ═══════════════════════════════════════════════════════════ */
function Outcomes() {
  const items = [
    { label: "A start on processing", desc: "30 days does not finish this work. But you will have tools, patterns, and self-awareness most people never build." },
    { label: "A values map", desc: "What you actually care about, excavated from your own writing — not a template." },
    { label: "A narrative you can stand behind", desc: "An honest account of what happened, built across weeks, pressure-tested by you." },
    { label: "Pattern awareness", desc: "Your saboteurs, your default stress responses, your relational patterns — named and visible." },
    { label: "Your complete journal", desc: "Every entry, exercise, framework analysis, and daily summary — downloadable as PDF or JSON." },
    { label: "A practice you can keep", desc: "The tools that worked for you, identified by your own ratings and your pattern tracking." },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgRecessed }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 14,
            }}
          >
            After 30 days
          </p>
        </FadeIn>

        <FadeIn preset="slide-up">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 40,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            What you walk away with
          </h2>
        </FadeIn>

        <div
          className="parachute-outcomes-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
          }}
        >
          {items.map((item, i) => (
            <FadeIn key={item.label} preset="slide-up" delay={0.08 + i * 0.05}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span
                  style={{
                    color: colors.coral,
                    fontSize: 14,
                    fontWeight: 600,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  ✓
                </span>
                <div>
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 14,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 13,
                      color: colors.textMuted,
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48, marginBottom: 16 }}>
          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: body,
              fontSize: 15,
              fontWeight: 600,
              padding: "14px 32px",
              borderRadius: 50,
              textDecoration: "none",
              backgroundColor: colors.coral,
              color: "#ffffff",
              transition: "all 0.2s",
              border: "none",
            }}
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOUNDER — A face behind the product
   ═══════════════════════════════════════════════════════════ */
function Founder() {
  return (
    <section style={{ ...sectionPaddingSmall, background: colors.bgRecessed }}>
      <FadeIn preset="fade">
        <div
          style={{
            maxWidth: 580,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
          className="parachute-founder"
        >
          <img
            src="/stefanie.jpg"
            alt="Stefanie Kamps"
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div>
            <p
              style={{
                fontFamily: body,
                fontSize: 15,
                color: colors.textBody,
                lineHeight: 1.75,
                marginBottom: 10,
              }}
            >
              I started envisioning this product after my own mid-career layoff.
              As a big-tech and startup product leader and certified coach, I have
              worked with dozens of people through job loss and high-pressure work
              situations. And did I witness emotional rollercoasters and come-back
              stories.
            </p>
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                fontWeight: 600,
                color: colors.textSecondary,
              }}
            >
              Stefanie Kamps
            </p>
            <p
              style={{
                fontFamily: body,
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              Founder · Certified Coach (ICF, CTI, ORSC)
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SOCIAL PROOF — Early access framing
   ═══════════════════════════════════════════════════════════ */
function SocialProof() {
  return (
    <section style={{ ...sectionPaddingSmall, background: colors.bgDeep }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center" as const }}>
        <FadeIn preset="fade">
          <p
            style={{
              fontFamily: body,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              color: colors.coral,
              marginBottom: 24,
            }}
          >
            Built with real input
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column" as const,
              gap: 32,
            }}
          >
            <FadeIn preset="slide-up" delay={0.1}>
              <blockquote
                style={{
                  fontFamily: body,
                  fontSize: 16,
                  color: colors.textBody,
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  margin: 0,
                  padding: "0 20px",
                  borderLeft: `3px solid ${colors.coral}`,
                  textAlign: "left" as const,
                }}
              >
                I wish something like this existed when I was laid off. The
                journaling alone would have saved me months of spinning.
              </blockquote>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 12,
                  textAlign: "left" as const,
                  paddingLeft: 23,
                }}
              >
                — Early access participant, former senior PM
              </p>
            </FadeIn>
            <FadeIn preset="slide-up" delay={0.2}>
              <blockquote
                style={{
                  fontFamily: body,
                  fontSize: 16,
                  color: colors.textBody,
                  lineHeight: 1.75,
                  fontStyle: "italic",
                  margin: 0,
                  padding: "0 20px",
                  borderLeft: `3px solid ${colors.coral}`,
                  textAlign: "left" as const,
                }}
              >
                The framework analysis was the part that surprised me. Seeing a
                named concept applied to something I had been feeling but could
                not articulate — that was the shift.
              </blockquote>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  marginTop: 12,
                  textAlign: "left" as const,
                  paddingLeft: 23,
                }}
              >
                — Early access participant, former engineering lead
              </p>
            </FadeIn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section style={{ ...sectionPadding, background: colors.bgRecessed }}>
      <FadeIn preset="blur">
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            textAlign: "center" as const,
            padding: "0 24px",
          }}
        >
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(26px, 3.5vw, 36px)",
              lineHeight: 1.2,
              color: colors.textPrimary,
              marginBottom: 18,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            You do not need to figure this out alone.
          </h2>
          <p
            style={{
              fontFamily: body,
              fontSize: 16,
              color: colors.textSecondary,
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            A personalized coaching program that meets you where you are.
            Start today.
          </p>
          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: body,
              fontSize: 15,
              fontWeight: 600,
              padding: "14px 36px",
              borderRadius: 8,
              textDecoration: "none",
              backgroundColor: colors.coral,
              color: "#ffffff",
              transition: "all 0.2s",
              border: "none",
            }}
          >
            Sliding scale from $29
          </a>
          <p
            style={{
              fontFamily: body,
              fontSize: 13,
              color: colors.textMuted,
              marginTop: 16,
            }}
          >
            7-day money-back guarantee · Access until goals are complete
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer
      style={{
        padding: "48px 24px",
        borderTop: `1px solid ${colors.borderSubtle}`,
        background: colors.bgDeep,
      }}
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap" as const,
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 13,
            fontFamily: body,
            color: "#ffffff",
            alignItems: "center",
          }}
        >
          <span>
            &copy; 2026 All Minds on Deck &middot; Made with{" "}
            <span style={{ color: colors.coral, fontSize: 18 }}>&#9829;</span> by{" "}
            <a
              href="https://allmindsondeck.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffffff", textDecoration: "underline" }}
            >
              All Minds On Deck
            </a>
          </span>
          <a href="/privacy" style={{ color: "#ffffff", textDecoration: "none" }}>
            Privacy
          </a>
          <a href="/contact" style={{ color: "#ffffff", textDecoration: "none" }}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE STYLES (injected via <style> tag)
   ═══════════════════════════════════════════════════════════ */
function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 960px) {
      }
      @media (max-width: 520px) {
      }
      @media (max-width: 768px) {
        .nav-signin { display: none !important; }
        .parachute-pers-grid { grid-template-columns: 1fr !important; }
        .parachute-arc-grid { grid-template-columns: 1fr 1fr !important; }
        .parachute-features-grid { grid-template-columns: 1fr !important; }
        .parachute-proof-inner { flex-direction: column !important; gap: 16px !important; }
        .parachute-prob-grid { grid-template-columns: 1fr !important; }
        .parachute-prob-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        .parachute-not-grid { grid-template-columns: 1fr !important; }
        .parachute-addon-grid { grid-template-columns: 1fr !important; text-align: center !important; }
        .parachute-honest-grid { grid-template-columns: 1fr !important; }
        .parachute-privacy-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        .parachute-research-grid { grid-template-columns: 1fr !important; }
        .parachute-testimonial-grid { grid-template-columns: 1fr !important; }
        .parachute-outcomes-grid { grid-template-columns: 1fr !important; }
        .parachute-founder { flex-direction: column !important; align-items: center !important; text-align: center !important; }
        .parachute-faq-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
        .parachute-faq-nav { flex-direction: row !important; flex-wrap: wrap !important; position: static !important; gap: 8px !important; }
      }
      @media (max-width: 480px) {
        .parachute-arc-grid { grid-template-columns: 1fr !important; }
        .parachute-privacy-grid { grid-template-columns: 1fr !important; }
        .parachute-research-grid { grid-template-columns: 1fr !important; }
        .parachute-pricing-card { padding: 20px !important; }
      }
      html { scroll-behavior: smooth; }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT — Main export
   ═══════════════════════════════════════════════════════════ */
export default function ParachutePageWrapper() {
  return (
    <Suspense fallback={null}>
      <ParachutePage />
    </Suspense>
  );
}

function ParachutePage() {
  return (
    <div
      style={{
        background: colors.bgDeep,
        color: colors.textPrimary,
        fontFamily: body,
        minHeight: "100vh",
      }}
    >
      <ResponsiveStyles />
      <Nav />
      <Hero />
      <ProofBar />
      <Problem />
      <HowItWorks />
      <Suspense><Pricing /></Suspense>
      <Outcomes />
      <Guarantee />
      <Founder />
      <DataPrivacy />
      <FAQ />
      <GiftingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
