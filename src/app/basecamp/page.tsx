"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useScroll } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import { trackEvent } from "@/components/GoogleAnalytics";

/* ── Typography shortcuts ── */
const display = fonts.display;
const body = fonts.bodyAlt;

/* ── Layout constants ── */
const maxWidth = 1120;
const narrowMax = 700;
const sectionPadding = { padding: "96px 24px" } as const;
const sectionPaddingSmall = { padding: "64px 24px" } as const;

/* ── Animated counter hook (eased, requestAnimationFrame) ── */
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
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
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <a
            href="/login"
            style={{
              fontFamily: body,
              fontSize: 14,
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
            Get started
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
        src="/basecamp-hero-bg.jpg"
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
              For professionals starting a new role
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
              New role.
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
            {["Excitement", "Anxiety", "Imposter syndrome", "Overwhelm", "Pressure"].map(
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
              Starting a new role is one of the highest-leverage moments in a career. It is also one of the most disorienting.
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
              BASECAMP is a 30-day personalized daily program to help you find your footing when everything is new.
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
                onClick={() => trackEvent("new_role_hero_cta_click", {})}
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
                Get started
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
          className="basecamp-proof-inner"
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
                color: colors.textMuted,
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
      label: "Competence Confidence",
      desc: "You were competent in your last role. Here, you do not yet know what competent looks like. The gap between actual capability and current effectiveness is real and temporary — but it activates imposter patterns as if permanent.",
    },
    {
      label: "Social Belonging",
      desc: "Your old team knew you. These people do not. You are reading every interaction for signals about whether you fit, whether you are welcome.",
    },
    {
      label: "Cultural Fluency",
      desc: "Every organization has an operating system — how decisions get made, how conflict is handled, how feedback is given. You do not yet speak this language.",
    },
    {
      label: "Identity Continuity",
      desc: "You built an identity in your previous role. That identity does not transfer automatically. You are between versions of yourself.",
    },
    {
      label: "Clarity of Expectations",
      desc: "What does success look like? What does your manager actually need? What are the real priorities vs. stated priorities?",
    },
    {
      label: "Routine and Rhythm",
      desc: "New commute, new meeting cadence, new tools, new norms about availability. The cognitive overhead is invisible but constant.",
    },
    {
      label: "Authority and Credibility",
      desc: "Your credibility from the previous role does not transfer. You are asking for trust on credit.",
    },
  ];

  return (
    <section style={{ ...sectionPadding, background: colors.bgDeep, borderTop: `3px solid ${colors.coral}` }}>
      <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
        <FadeIn preset="fade">
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(30px, 4vw, 42px)",
              lineHeight: 1.15,
              color: colors.textPrimary,
              marginBottom: 40,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            How it works
          </h2>
        </FadeIn>

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
            A new role disrupts seven systems at once
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
            This program addresses all seven for a grounded transition.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="basecamp-prob-grid">
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

        {/* Research stats */}
        <FadeIn preset="slide-up" delay={0.45}>
          <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, marginTop: 40, paddingTop: 36 }}>
            <p style={{ fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 14 }}>
              The research
            </p>
            <h3 style={{ fontFamily: display, fontSize: "clamp(22px, 3vw, 30px)", lineHeight: 1.2, color: colors.textPrimary, marginBottom: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>
              The first 90 days are a pressure cooker — and most of it is invisible.
            </h3>
            <div className="basecamp-research-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              {[
                { num: "90 days", desc: "is the standard new-hire assessment window — yet real integration takes 6\u201312 months. That gap between expectation and reality creates sustained invisible pressure.", source: "Watkins, The First 90 Days" },
                { num: "46%", desc: "of new hires are considered failures within 18 months — 89% due to attitude and interpersonal dynamics, not technical skill.", source: "Leadership IQ, Hiring for Attitude" },
                { num: "33%", desc: "of new hires look for a new job within the first six months. The top driver: cultural fit and relationship quality, not compensation.", source: "Jobvite Job Seeker Nation, 2023" },
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
      desc: null,
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
        src="/basecamp-arc-bg.jpg"
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
          <div style={{ marginBottom: 56, borderBottom: `1px solid ${colors.borderSubtle}`, paddingBottom: 48 }}>
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
              className="basecamp-arc-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              {[
                { week: "Week 1", title: "Orient", desc: "Get honest about what is hard. Figure out what you actually value — not what you think you should. Start reading the culture and the people around you." },
                { week: "Week 2", title: "Connect", desc: "Have the real conversations. Understand the power dynamics. Build the relationship with your manager. Learn where to adapt and where to hold your ground." },
                { week: "Week 3", title: "Act", desc: "Start contributing on purpose, not from anxiety. Navigate your first real friction. Notice when imposter syndrome is driving decisions and catch it." },
                { week: "Week 4", title: "Calibrate", desc: "Check what you assumed against what is actually true. Adjust your approach with real data. Build a practice you can sustain after Day 30." },
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
                    className="basecamp-step-label"
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
              Get started
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIAL CAROUSEL
   ═══════════════════════════════════════════════════════════ */
function TestimonialCarousel() {
  const testimonials = [
    { quote: "Starting a VP role at a company where I knew no one — this gave me a framework for every conversation.", who: "VP of Product" },
    { quote: "I kept trying to import my old playbook. The program helped me see I was solving for the wrong culture.", who: "Senior engineer" },
    { quote: "The stakeholder mapping exercise alone saved me months of political mistakes.", who: "Director of design" },
    { quote: "I did not realize how much imposter syndrome was driving my first two weeks until I started tracking it.", who: "Product manager" },
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
              color: colors.textBody,
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
                color: colors.textMuted,
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
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("new_role_page_view", {});
    if (cancelled) {
      trackEvent("checkout_cancelled", { program: "basecamp" });
    }
  }, [cancelled]);

  const handleCheckout = async (tier: string) => {
    setCheckoutLoading(tier);
    trackEvent("new_role_price_click", { tier });
    trackEvent("new_role_begin_checkout", { tier });
    trackEvent("begin_checkout", { package: "basecamp", tier });
    try {
      const res = await fetch("/api/checkout/basecamp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, amount: tier === "standard" ? 49 : undefined }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else console.error("Checkout error:", data.error);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setCheckoutLoading(null);
    }
  };

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
            Pricing
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
            Three ways to start.
          </h2>
        </FadeIn>

        <FadeIn preset="slide-up" delay={0.1}>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 620,
              marginBottom: 48,
              textAlign: "center" as const,
              margin: "0 auto 48px",
            }}
          >
            Start with the self-guided program, add an Enneagram assessment for deeper insight, or work directly with a coach for three months.
          </p>
        </FadeIn>

        {/* Tier cards */}
        <div
          className="basecamp-price-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            alignItems: "stretch",
            marginBottom: 48,
          }}
        >
          {/* Self-guided program — $49 */}
          <FadeIn preset="slide-up" delay={0.1} style={{ display: "flex" }}>
            <div
              style={{
                padding: 28,
                border: `2px solid ${colors.coral}`,
                borderRadius: 14,
                backgroundColor: colors.bgSurface,
                position: "relative" as const,
                boxShadow: `0 4px 32px rgba(224, 149, 133, 0.1)`,
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
                Most popular
              </span>

              <p
                style={{
                  fontFamily: display,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                Self-guided program
              </p>
              <p
                style={{
                  fontFamily: display,
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.coral,
                  marginBottom: 14,
                  letterSpacing: "-0.02em",
                }}
              >
                $49
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: 20,
                }}
              >
                30 days of structured coaching, personalized to your new role. Journal-driven exercises, goal tracking, and pattern analysis. One payment, access until your goals are done.
              </p>

              <button
                onClick={() => handleCheckout("standard")}
                disabled={checkoutLoading === "standard"}
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
                  cursor: checkoutLoading === "standard" ? "wait" : "pointer",
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  transition: "all 0.25s ease",
                  border: "none",
                  opacity: checkoutLoading === "standard" ? 0.6 : 1,
                }}
              >
                {checkoutLoading === "standard" ? "Redirecting..." : "Start now"}
              </button>
              <p style={{
                fontSize: 12, color: colors.textPrimary, textAlign: "center",
                margin: "10px 0 0 0", fontFamily: body, lineHeight: 1.5, opacity: 0.7,
              }}>
                7-day money-back guarantee. If the program is not working for you within the first week, request a full refund. No conditions. No forms.
              </p>
            </div>
          </FadeIn>

          {/* Program + Enneagram */}
          <FadeIn preset="slide-up" delay={0.16} style={{ display: "flex" }}>
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

              <p
                style={{
                  fontFamily: display,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                Program + Enneagram
              </p>
              <p
                style={{
                  fontFamily: display,
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.coral,
                  marginBottom: 14,
                  letterSpacing: "-0.02em",
                }}
              >
                $349
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: 20,
                }}
              >
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

          {/* Coaching partnership — apply */}
          <FadeIn preset="slide-up" delay={0.22} style={{ display: "flex" }}>
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

              <p
                style={{
                  fontFamily: display,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                First 90 Days
              </p>
              <p
                style={{
                  fontFamily: display,
                  fontSize: 28,
                  fontWeight: 700,
                  color: colors.coral,
                  marginBottom: 14,
                  letterSpacing: "-0.02em",
                }}
              >
                1:1 Thinking Partner
              </p>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: 20,
                }}
              >
                Everything in the self-guided program, plus weekly or bi-weekly 1:1 coaching sessions across your first 90 days. Includes a personal Enneagram assessment, so you can see where your defaults help and where they cost you.
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
              className="basecamp-features-grid"
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
    <section style={{ ...sectionPaddingSmall, background: "#D9D7D4" }}>
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
              color: "#1E1E22",
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
              color: "#4A4850",
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
    <section style={{ ...sectionPaddingSmall, background: "#D9D7D4" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <FadeIn preset="fade">
          <p style={{ fontFamily: body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: colors.coral, marginBottom: 14, textAlign: "center" as const }}>
            Data &amp; privacy
          </p>
        </FadeIn>
        <FadeIn preset="slide-up">
          <div
            className="basecamp-privacy-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}
          >
            {points.map((p, i) => (
              <div key={p.title} style={{ textAlign: "center" as const, padding: "28px 20px", background: "rgba(255,255,255,0.6)", borderRadius: 12, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontFamily: body, fontSize: 18, marginBottom: 10, color: "#1E1E22" }}>{["◼", "◼", "◼"][i]}</p>
                <p style={{ fontFamily: body, fontSize: 14, fontWeight: 600, color: "#1E1E22", marginBottom: 6 }}>{p.title}</p>
                <p style={{ fontFamily: body, fontSize: 13, color: "#6A6872", lineHeight: 1.55, margin: 0 }}>{p.desc}</p>
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
   WHAT YOU WALK AWAY WITH — Tangible outcomes
   ═══════════════════════════════════════════════════════════ */
function Outcomes() {
  const items = [
    { label: "A cultural read", desc: "Not a stereotype. A behavioral map of how decisions get made, how conflict is handled, and where the real power sits." },
    { label: "Real relationships", desc: "Not networking contacts. People who trust you because you listened, asked questions, and showed up honestly." },
    { label: "Pattern awareness", desc: "Your saboteurs, your reactive tendencies, your imposter triggers — named, visible, and interruptible." },
    { label: "A communication style", desc: "Calibrated to the new culture without abandoning who you are. Directness, advocacy, and feedback adapted — not performed." },
    { label: "Your complete journal", desc: "Every entry, exercise, framework analysis, and daily summary — downloadable as PDF or JSON." },
    { label: "A practice you can keep", desc: "The tools that worked for you, identified by your own ratings and your pattern tracking." },
  ];

  return (
    <section style={{ ...sectionPadding, background: "#D9D7D4" }}>
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
              color: "#1E1E22",
              marginBottom: 40,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            What you walk away with
          </h2>
        </FadeIn>

        <div
          className="basecamp-outcomes-grid"
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
                      color: "#1E1E22",
                      marginBottom: 3,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 13,
                      color: "#6A6872",
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
      a: "The required coaching plan exercises take about 5 minutes. If you do all the optional journal-matched exercises, 25-30 minutes. Most people settle into 15-20 minutes. You decide each day based on your time and energy.",
    },
    {
      topic: "The program",
      q: "What happens if I cannot finish in 30 days?",
      a: "Your access does not get cut at Day 30. The program continues until your core coaching goals have been addressed. One payment at whatever tier you chose. You are done when you are done.",
    },
    {
      topic: "The program",
      q: "Where do the exercises come from?",
      a: "The library includes frameworks from First 90 Days, Culture Map, Positive Intelligence, Leadership Circle Profile, ORSC, and others. Over 30 days you will work through 180+ exercises personalized to your situation. Every exercise cites its source.",
    },
    {
      topic: "The program",
      q: "Is this therapy?",
      a: "No. This is a coaching program. It uses evidence-based tools but it is not a substitute for therapy. If patterns surface that would benefit from professional clinical support, the program will flag that clearly.",
    },
    {
      topic: "The program",
      q: "What if I already did PARACHUTE?",
      a: "Your history, values work, and assessment data carry forward. The program builds on what you already know about yourself.",
    },
    {
      topic: "Pricing",
      q: "What is included in the $49 program?",
      a: "30 days of structured, personalized coaching. 6 goals built from your situation, 180+ exercises from a 350+ tool library, journal analysis, framework-based pattern work, and access until your goals are done. One payment.",
    },
    {
      topic: "Pricing",
      q: "What is the coaching partnership?",
      a: "Weekly or bi-weekly 1:1 coaching sessions across your first 90 days, alongside the full self-guided program. Includes a personal Enneagram assessment so you can see where your defaults help and where they cost you. It starts with a brief application so we can make sure it is the right fit.",
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
      q: "What if I do not like journaling?",
      a: "You can use voice instead. It transcribes and processes it the same way. Some people type, some people talk. Both work. The exercises also include somatic, relational, and cognitive modalities — journaling is the anchor, not the only thing.",
    },
    {
      topic: "Pricing",
      q: "What is the Enneagram package and is it worth it?",
      a: "Most personality tests tell you your type and stop there. The IEQ9 Integrative Enneagram shows you why you react the way you do — how you handle stress, what drives your decisions, and what keeps repeating. It is the tool professional coaches and therapists actually use. The full package includes the program, the assessment, and a 1-hour live debrief with a certified coach. Your results shape every exercise, so the program fits you at a level the standard version cannot.",
    },
    {
      topic: "The program",
      q: "What happens after the 30 days?",
      a: "Three options: start another program (like PARACHUTE or future programs), continue with daily coaching for $49/month with no fixed arc, or end and download all your data. Your history, values work, and assessment data carry forward if you continue.",
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
            className="basecamp-faq-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            {/* Topic nav — left column */}
            <nav
              className="basecamp-faq-nav"
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
            Get started
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
        .basecamp-price-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 520px) {
        .basecamp-price-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 768px) {
        .basecamp-pers-grid { grid-template-columns: 1fr !important; }
        .basecamp-arc-grid { grid-template-columns: 1fr 1fr !important; }
        .basecamp-price-grid { grid-template-columns: 1fr !important; }
        .basecamp-features-grid { grid-template-columns: 1fr !important; }
        .basecamp-proof-inner { flex-direction: column !important; gap: 16px !important; }
        .basecamp-prob-grid { grid-template-columns: 1fr !important; }
        .basecamp-prob-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        .basecamp-not-grid { grid-template-columns: 1fr !important; }
        .basecamp-addon-grid { grid-template-columns: 1fr !important; text-align: center !important; }
        .basecamp-honest-grid { grid-template-columns: 1fr !important; }
        .basecamp-privacy-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        .basecamp-research-grid { grid-template-columns: 1fr !important; }
        .basecamp-testimonial-grid { grid-template-columns: 1fr !important; }
        .basecamp-outcomes-grid { grid-template-columns: 1fr !important; }
        .basecamp-faq-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
        .basecamp-faq-nav { flex-direction: row !important; flex-wrap: wrap !important; position: static !important; gap: 8px !important; }
      }
      @media (max-width: 480px) {
        .basecamp-arc-grid { grid-template-columns: 1fr !important; }
        .basecamp-privacy-grid { grid-template-columns: 1fr !important; }
        .basecamp-research-grid { grid-template-columns: 1fr !important; }
        .basecamp-price-grid > div > div { padding: 20px !important; }
      }
      html { scroll-behavior: smooth; }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT — Main export
   ═══════════════════════════════════════════════════════════ */
export default function BasecampPageWrapper() {
  return (
    <Suspense fallback={null}>
      <BasecampPage />
    </Suspense>
  );
}

function BasecampPage() {
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
      <DataPrivacy />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
