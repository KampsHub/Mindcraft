"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import TextReveal from "@/components/TextReveal";

/* ── Shared styles ── */
const display = fonts.display;
const body = fonts.bodyAlt;

const sectionPadding = { padding: "96px 24px" } as const;
const maxWidth = 1120;
const narrowMax = 700;

/* ── Scroll Progress Bar ── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${colors.accent}, ${colors.primary})`,
        transformOrigin: "0%",
        scaleX,
        zIndex: 200,
      }}
    />
  );
}

/* ── Animated Section Divider ── */
function Divider({ accent = false }: { accent?: boolean }) {
  return (
    <div style={{ padding: "0 24px", maxWidth, margin: "0 auto" }}>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 1,
          background: accent
            ? `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`
            : `linear-gradient(90deg, transparent, ${colors.gray200}, transparent)`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

/* ── Floating Accent Dot (decorative) ── */
function FloatingDot({
  top,
  left,
  size,
  delay,
  color,
  blur = 1,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
  color: string;
  blur?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        pointerEvents: "none",
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Scroll-linked hero parallax (global scroll — top 30% of page)
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [supabase.auth, router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ color: colors.gray400, fontFamily: fonts.body }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: body,
        backgroundColor: colors.bgDeep,
        color: colors.textPrimary,
        overflowX: "hidden",
      }}
    >
      <ScrollProgress />

      {/* ── Fixed Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
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
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Logo size={20} />
          </a>
          <div
            style={{ display: "flex", gap: 32, alignItems: "center" }}
            className="nav-desktop-links"
          >
            {[
              { label: "Programs", href: "#programs" },
              { label: "How it works", href: "#how" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ color: colors.textPrimary }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.textMuted,
                  textDecoration: "none",
                  fontFamily: display,
                  transition: "color 0.2s",
                }}
              >
                {label}
              </motion.a>
            ))}
            <motion.a
              href="/login"
              whileHover={{ color: colors.textPrimary }}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: colors.textMuted,
                textDecoration: "none",
                fontFamily: display,
                transition: "color 0.2s",
              }}
            >
              Sign in
            </motion.a>
            <motion.a
              href="#programs"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 600,
                color: colors.bgDeep,
                backgroundColor: colors.coral,
                textDecoration: "none",
                borderRadius: 100,
                fontFamily: display,
                letterSpacing: "0.01em",
              }}
            >
              Get started
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "140px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient background */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 40%, rgba(232,116,97,0.07) 0%, transparent 70%)",
              "radial-gradient(ellipse at 70% 60%, rgba(232,116,97,0.07) 0%, transparent 70%)",
              "radial-gradient(ellipse at 30% 40%, rgba(232,116,97,0.07) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* Floating decorative dots */}
        <FloatingDot
          top="15%"
          left="8%"
          size={8}
          delay={0.8}
          color={colors.accent}
        />
        <FloatingDot
          top="70%"
          left="85%"
          size={12}
          delay={1.2}
          color={colors.primary}
        />
        <FloatingDot
          top="25%"
          left="90%"
          size={6}
          delay={1.5}
          color={colors.accent}
        />
        <FloatingDot
          top="80%"
          left="12%"
          size={10}
          delay={2.0}
          color={colors.primary}
        />

        <motion.div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
          }}
        >
          <h1
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0 0 36px 0",
              fontSize: 44,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontFamily: display,
            }}
          >
            <TextReveal
              text={c.hero.headline}
              as="span"
              triggerOnMount
              delay={0.3}
              stagger={0.04}
              duration={0.7}
              style={{ color: colors.textSecondary, textAlign: "center" }}
            />
            <motion.span
              animate={{
                skewX: [0, 0, -5, 3, -2, 0, 0],
                x: [0, 0, -2, 2, -1, 0, 0],
                opacity: [1, 1, 0.65, 0.8, 0.9, 1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3.5,
                ease: "easeInOut",
              }}
              style={{ color: colors.coral, display: "inline-block", fontSize: "1.6em", marginTop: 12 }}
            >
              <TextReveal
                text={c.hero.headlineAccent}
                as="span"
                triggerOnMount
                delay={0.8}
                stagger={0.07}
                duration={0.7}
              />
            </motion.span>
          </h1>

          <FadeIn delay={1.2} preset="blur" duration={1.0} triggerOnMount>
            <p
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: colors.textBody,
                lineHeight: 1.75,
                marginTop: 0,
                marginBottom: 52,
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: 640,
                fontFamily: body,
                letterSpacing: "0.01em",
              }}
            >
              {c.hero.subheadline}
            </p>
          </FadeIn>

          <FadeIn delay={1.6} preset="pop" triggerOnMount>
            <motion.a
              href="#programs"
              whileHover={{
                scale: 1.06,
                boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                padding: "18px 48px",
                fontSize: 16,
                fontWeight: 600,
                color: colors.bgDeep,
                backgroundColor: colors.coral,
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
                fontFamily: display,
                letterSpacing: "0.01em",
              }}
            >
              Find your program
            </motion.a>
          </FadeIn>

        </motion.div>
      </section>

      {/* ── Differentiator Strip ── */}
      <section
        style={{
          padding: "48px 24px",
          backgroundColor: colors.bgRecessed,
          borderTop: `1px solid ${colors.borderSubtle}`,
          borderBottom: `1px solid ${colors.borderSubtle}`,
        }}
      >
        <div
          style={{
            maxWidth: narrowMax,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            textAlign: "center",
          }}
        >
          {c.differentiator.items.map((line, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.12} preset="fade">
              <p
                style={{
                  fontSize: i === 0 ? 16 : 15,
                  fontWeight: i === 0 ? 700 : 400,
                  color: i === 0 ? colors.coral : colors.textMuted,
                  fontFamily: i === 0 ? display : body,
                  lineHeight: 1.6,
                  margin: 0,
                  letterSpacing: i === 0 ? "0.02em" : undefined,
                }}
              >
                {line}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Programs ── */}
      <section
        id="programs"
        style={{
          ...sectionPadding,
          backgroundColor: colors.bgRecessed,
          position: "relative",
        }}
      >
        <div style={{ maxWidth, margin: "0 auto", textAlign: "center" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 16,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {c.programs.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.2} duration={0.9}>
            <p
              style={{
                fontSize: 17,
                color: colors.textMuted,
                maxWidth: 600,
                margin: "0 auto 56px",
                lineHeight: 1.7,
                fontFamily: body,
              }}
            >
              {c.programs.subheadline}
            </p>
          </FadeIn>

          <div
            className="programs-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 56,
              textAlign: "left",
            }}
          >
            {c.programs.cards.map((card, i) => (
              <FadeIn key={card.tag} delay={0.15 + i * 0.12} preset="slide-up">
                <a href={card.href} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
                <motion.div
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    borderColor: colors.coral,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    padding: 32,
                    backgroundColor: colors.bgSurface,
                    borderRadius: 16,
                    border: `1px solid ${colors.borderDefault}`,
                    height: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {card.tag === "Layoff" && (
                    <span
                      style={{
                        position: "absolute",
                        top: 18,
                        right: -32,
                        transform: "rotate(45deg)",
                        background: colors.coral,
                        color: colors.bgDeep,
                        fontFamily: display,
                        fontWeight: 700,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "6px 40px",
                        whiteSpace: "nowrap",
                        zIndex: 1,
                      }}
                    >
                      Sliding scale
                    </span>
                  )}
                  <span
                    style={{
                      display: "inline-block",
                      background: colors.coralWash,
                      color: colors.coral,
                      fontFamily: display,
                      fontWeight: 700,
                      fontSize: 15,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      padding: "8px 18px",
                      borderRadius: 100,
                      marginBottom: 22,
                      alignSelf: "flex-start",
                    }}
                  >
                    {card.tag}
                  </span>
                  <h3
                    style={{
                      fontFamily: display,
                      fontSize: 19,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: 12,
                      color: colors.textPrimary,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: colors.textMuted,
                      lineHeight: 1.65,
                      marginBottom: 24,
                      fontFamily: body,
                      flex: 1,
                    }}
                  >
                    {card.desc}
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: display,
                      color: colors.coral,
                      letterSpacing: "0.02em",
                    }}
                  >
                    Learn more &rarr;
                  </span>
                </motion.div>
                </a>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>

      <Divider accent />

      {/* ── What a Day Looks Like ── */}
      <section style={{ ...sectionPadding }}>
        <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{
                display: "inline-block",
                fontFamily: display,
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: colors.coral,
                marginBottom: 16,
              }}>
                Your daily session
              </span>
              <h2 style={{
                fontFamily: display,
                fontSize: 40,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}>
                {c.dailyPreview.headline}
              </h2>
              <p style={{
                fontSize: 17,
                color: colors.textMuted,
                lineHeight: 1.7,
                fontFamily: body,
                margin: 0,
              }}>
                {c.dailyPreview.subheadline}
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {c.dailyPreview.steps.map((step, i) => (
              <FadeIn key={step.number} delay={0.08 + i * 0.1} preset="slide-up">
                <div style={{
                  display: "flex",
                  gap: 24,
                  padding: "28px 0",
                  borderBottom: i < c.dailyPreview.steps.length - 1
                    ? `1px solid ${colors.borderSubtle}`
                    : "none",
                }}>
                  <div style={{
                    flex: "0 0 48px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    <span style={{
                      fontFamily: display,
                      fontSize: 11,
                      fontWeight: 700,
                      color: colors.coral,
                      letterSpacing: "0.05em",
                    }}>
                      {step.number}
                    </span>
                    <span style={{
                      fontFamily: display,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: colors.textMuted,
                    }}>
                      {step.label}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: display,
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      lineHeight: 1.35,
                      marginBottom: 8,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      lineHeight: 1.65,
                      margin: 0,
                      fontFamily: body,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" style={{ ...sectionPadding, backgroundColor: colors.bgRecessed }}>
        <div style={{ maxWidth, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <FadeIn preset="slide-up" duration={0.8}>
              <span style={{
                display: "inline-block",
                fontFamily: display,
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: colors.coral,
                marginBottom: 16,
              }}>
                How it works
              </span>
              <h2
                style={{
                  fontFamily: display,
                  fontSize: 44,
                  fontWeight: 700,
                  marginBottom: 16,
                  color: colors.textPrimary,
                  letterSpacing: "-0.03em",
                }}
              >
                {c.steps.headline}
              </h2>
            </FadeIn>
          </div>

          {/* Steps — numbered list */}
          <div style={{ maxWidth: narrowMax, margin: "0 auto" }}>
            {c.steps.items.map((step, i) => (
              <FadeIn key={i} delay={0.08 + i * 0.08} preset="slide-up">
                <div style={{
                  display: "flex",
                  gap: 20,
                  padding: "24px 0",
                  borderBottom: i < c.steps.items.length - 1
                    ? `1px solid ${colors.borderSubtle}`
                    : "none",
                }}>
                  <span style={{
                    flex: "0 0 32px",
                    fontFamily: display,
                    fontSize: 13,
                    fontWeight: 700,
                    color: colors.coral,
                    paddingTop: 2,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: display,
                      fontSize: 16,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      lineHeight: 1.35,
                      marginBottom: 8,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      lineHeight: 1.65,
                      margin: 0,
                      fontFamily: body,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section
        style={{
          ...sectionPadding,
          backgroundColor: colors.bgRecessed,
        }}
      >
        <div style={{ maxWidth, margin: "0 auto" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2
                style={{
                  fontFamily: display,
                  fontSize: 40,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  marginBottom: 16,
                  letterSpacing: "-0.03em",
                }}
              >
                Built on trust, not hype.
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: colors.textMuted,
                  maxWidth: 560,
                  margin: "0 auto",
                  lineHeight: 1.7,
                  fontFamily: body,
                }}
              >
                You&rsquo;re sharing real things here. We take that seriously.
              </p>
            </div>
          </FadeIn>

          <div
            className="trust-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: "Your entries never train models.",
                desc: "Zero third-party access. No data sales. No fine-tuning on your vulnerability. Export everything or delete your account at any time \u2014 no \u2018are you sure?\u2019 dark patterns.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                ),
                title: "250+ frameworks. All cited and sourced.",
                desc: "IFS, ACT, Gottman, polyvagal theory, performance psychology. Every exercise tells you where it comes from, why it was chosen for you, and how to do it \u2014 in plain language, no jargon.",
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: "Built by a coach who\u2019s been through it.",
                desc: "Designed by a certified leadership coach and product leader who got laid off and channeled the experience into building what she wished had existed. Real frameworks from real coaching rooms.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.1} preset="slide-up">
                <div
                  style={{
                    padding: 28,
                    backgroundColor: colors.bgSurface,
                    borderRadius: 16,
                    border: `1px solid ${colors.borderDefault}`,
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ marginBottom: 16 }}>{item.icon}</div>
                  <h3
                    style={{
                      fontFamily: display,
                      fontSize: 17,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: 10,
                      color: colors.textPrimary,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: colors.textMuted,
                      lineHeight: 1.65,
                      margin: 0,
                      fontFamily: body,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Human Layer ── */}
      <section style={{ ...sectionPadding }}>
        <div style={{ maxWidth: 650, margin: "0 auto", textAlign: "center" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: 40,
                fontWeight: 700,
                marginBottom: 20,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {c.humanLayer.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.15} duration={0.9}>
            <p
              style={{
                fontSize: 17,
                color: colors.textMuted,
                lineHeight: 1.7,
                marginBottom: 36,
                fontFamily: body,
              }}
            >
              {c.humanLayer.body}
            </p>
          </FadeIn>
          <FadeIn preset="fade" delay={0.3}>
            <motion.a
              href="/intake"
              whileHover={{
                scale: 1.05,
                backgroundColor: colors.coral,
                color: colors.bgDeep,
                borderColor: colors.coral,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "16px 40px",
                fontSize: 15,
                fontWeight: 600,
                color: colors.coral,
                backgroundColor: "transparent",
                border: `2px solid ${colors.coral}`,
                borderRadius: 100,
                textDecoration: "none",
                display: "inline-block",
                fontFamily: display,
              }}
            >
              {c.humanLayer.cta}
            </motion.a>
          </FadeIn>
        </div>
      </section>

      {/* ── Who Built This ── */}
      <section
        style={{
          ...sectionPadding,
          backgroundColor: colors.bgRecessed,
        }}
      >
        <div style={{ maxWidth: 650, margin: "0 auto", textAlign: "center" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: 40,
                fontWeight: 700,
                marginBottom: 20,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {c.builtBy.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.15} duration={0.9}>
            <p
              style={{
                fontSize: 17,
                color: colors.textSecondary,
                lineHeight: 1.85,
                fontFamily: body,
                fontStyle: "italic",
                marginBottom: 28,
              }}
            >
              &ldquo;{c.builtBy.body}&rdquo;
            </p>
          </FadeIn>
          <FadeIn preset="fade" delay={0.3}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <a
                href={c.builtBy.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: display,
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {c.builtBy.name} ↗
              </a>
              <p
                style={{
                  fontFamily: body,
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                {c.builtBy.title}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Takeaways ── */}
      <section style={{ ...sectionPadding }}>
        <div style={{ maxWidth, margin: "0 auto" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block",
                fontFamily: display,
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: colors.coral,
                marginBottom: 16,
              }}>
                After 30 days
              </span>
              <h2 style={{
                fontFamily: display,
                fontSize: 40,
                fontWeight: 700,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}>
                {c.takeaways.headline}
              </h2>
              <p style={{
                fontSize: 17,
                color: colors.textMuted,
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: body,
              }}>
                {c.takeaways.subheadline}
              </p>
            </div>
          </FadeIn>

          <div
            className="takeaways-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}
          >
            {c.takeaways.items.map((item, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.1} preset="slide-up">
                <motion.div
                  whileHover={{
                    y: -4,
                    borderColor: colors.plum,
                    boxShadow: "0 16px 32px rgba(0,0,0,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    padding: 28,
                    backgroundColor: colors.bgSurface,
                    borderRadius: 16,
                    border: `1px solid ${colors.borderDefault}`,
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: colors.plumWash,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontFamily: display,
                      fontSize: 14,
                      fontWeight: 700,
                      color: colors.plumLight,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: display,
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    marginBottom: 10,
                    color: colors.textPrimary,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    lineHeight: 1.65,
                    margin: 0,
                    fontFamily: body,
                  }}>
                    {item.desc}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── FAQ ── */}
      <section id="faq" style={{ ...sectionPadding }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 64, alignItems: "flex-start" }} className="faq-layout">
            {/* Left header */}
            <div style={{ flex: "0 0 220px", position: "sticky", top: 120 }} className="faq-header">
              <FadeIn preset="slide-up" duration={0.8}>
                <span style={{
                  display: "inline-block",
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: colors.coral,
                  marginBottom: 16,
                }}>
                  Support
                </span>
                <h2
                  style={{
                    fontFamily: display,
                    fontSize: 36,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  Frequently Asked Questions
                </h2>
              </FadeIn>
            </div>

            {/* Right accordion */}
            <div style={{ flex: 1 }}>
              {c.faq.items.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <FadeIn key={i} delay={i * 0.06} preset="fade">
                    <div
                      style={{
                        borderBottom: `1px solid ${colors.borderSubtle}`,
                      }}
                    >
                      <motion.button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        whileHover={{ color: colors.textPrimary }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "22px 0",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: display,
                          fontSize: 15,
                          fontWeight: 600,
                          color: isOpen ? colors.textPrimary : colors.textSecondary,
                          transition: "color 0.2s",
                        }}
                      >
                        {item.q}
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            fontSize: 18,
                            color: colors.textMuted,
                            flexShrink: 0,
                            marginLeft: 16,
                          }}
                        >
                          &#x2304;
                        </motion.span>
                      </motion.button>
                      <motion.div
                        initial={false}
                        animate={{
                          height: isOpen ? "auto" : 0,
                          opacity: isOpen ? 1 : 0,
                        }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            color: colors.textMuted,
                            lineHeight: 1.7,
                            margin: 0,
                            paddingBottom: 22,
                            fontFamily: body,
                          }}
                        >
                          {item.a}
                        </p>
                      </motion.div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{
          ...sectionPadding,
          backgroundColor: colors.gray50,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}
        >
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: 48,
                fontWeight: 700,
                marginBottom: 8,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {c.finalCta.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.15}>
            <p
              style={{
                fontSize: 19,
                color: colors.textMuted,
                marginBottom: 44,
                fontFamily: body,
              }}
            >
              {c.finalCta.subtext}
            </p>
          </FadeIn>
          <FadeIn preset="pop" delay={0.3}>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <motion.a
                href="#programs"
                whileHover={{
                  scale: 1.06,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  padding: "16px 40px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.bgDeep,
                  backgroundColor: colors.coral,
                  borderRadius: 100,
                  textDecoration: "none",
                  display: "inline-block",
                  fontFamily: display,
                }}
              >
                {c.finalCta.primaryCta}
              </motion.a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          padding: "48px 24px",
          borderTop: `1px solid ${colors.borderSubtle}`,
        }}
      >
        <div
          style={{
            maxWidth,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={16} />
          </a>
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 13,
              color: colors.textMuted,
            }}
          >
            <span>{c.footer.copyright}</span>
            <a
              href={c.brand.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.textMuted, textDecoration: "none" }}
            >
              All Minds on Deck
            </a>
            <a
              href="/privacy"
              style={{ color: colors.textMuted, textDecoration: "none" }}
            >
              {c.footer.privacyLink}
            </a>
          </div>
        </div>
      </footer>

      {/* ── Responsive CSS ── */}
      <style>{`
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .programs-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
          .takeaways-grid { grid-template-columns: 1fr !important; }
          .faq-layout { flex-direction: column !important; gap: 32px !important; }
          .faq-header { position: static !important; flex: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .programs-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .takeaways-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
