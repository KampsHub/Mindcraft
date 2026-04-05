"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import TextReveal from "@/components/TextReveal";
import ComingSoonWaitlist from "@/components/ComingSoonWaitlist";
import EmailNurtureSignup from "@/components/EmailNurtureSignup";

/* ── Shared styles ── */
const display = fonts.display;
const body = fonts.bodyAlt;
const serif = fonts.serif;

const sectionPadding = { paddingTop: 96, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 } as const;
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
        background: `linear-gradient(90deg, ${colors.plum}, ${colors.coral})`,
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
            ? `linear-gradient(90deg, transparent, ${colors.plum}, transparent)`
            : `linear-gradient(90deg, transparent, ${colors.borderSubtle}, transparent)`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

/* ── Curved SVG Section Divider ── */
type DividerVariant = "wave" | "slope" | "ripple" | "tilt";

function SectionDivider({
  variant = "wave",
  flip = false,
  fromColor = "#18181C",
  toColor = "#18181C",
  height = 60,
}: {
  variant?: DividerVariant;
  flip?: boolean;
  fromColor?: string;
  toColor?: string;
  height?: number;
}) {
  const paths: Record<DividerVariant, string> = {
    wave: "M0,55 C180,40 360,70 540,55 C720,40 900,70 1080,55 C1260,40 1350,65 1440,55 L1440,100 L0,100 Z",
    slope: "M0,60 Q360,40 720,50 Q1080,60 1440,42 L1440,100 L0,100 Z",
    ripple: "M0,50 C120,38 240,62 360,50 C480,38 600,62 720,50 C840,38 960,62 1080,50 C1200,38 1320,62 1440,50 L1440,100 L0,100 Z",
    tilt: "M0,58 C240,42 480,55 720,40 C960,52 1200,38 1440,48 L1440,100 L0,100 Z",
  };
  return (
    <div style={{
      width: "100%",
      overflow: "hidden",
      lineHeight: 0,
      transform: flip ? "scaleY(-1)" : undefined,
      marginTop: -1,
      marginBottom: -1,
    }}>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
        {fromColor !== "transparent" && <rect width="1440" height="100" fill={fromColor} />}
        <path d={paths[variant]} fill={toColor} />
      </svg>
    </div>
  );
}

/* Legacy alias */
function WaveDivider({ flip = false, color = "#2a2a30" }: { flip?: boolean; color?: string }) {
  return <SectionDivider variant="wave" flip={flip} toColor={color} />;
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

/* ── Stats Bar (below hero) ── */
function StatsBar() {
  return (
    <section
      style={{
        padding: "0 24px",
        marginTop: -72,
        position: "relative",
        zIndex: 2,
      }}
    >
      <FadeIn preset="slide-up" delay={1.8} triggerOnMount>
        <div
          className="stats-bar-grid"
          style={{
            maxWidth: 780,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {c.statsBar.items.map((item, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "#3a3a42",
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
                borderTop: `3px solid ${colors.coral}`,
              }}
            >
              <div
                style={{
                  fontFamily: display,
                  fontSize: 36,
                  fontWeight: 700,
                  color: colors.coral,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {item.number}
                {item.unit && (
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: colors.coralLight,
                      marginLeft: 4,
                      fontFamily: body,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.unit}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: colors.textMuted,
                  fontFamily: display,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  marginTop: 8,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

/* ── Pain-Point Marquee ── */
function PainPointMarquee() {
  const { row1, row2, row3, row4, row5, row6, row7, circles } = c.marquee;

  const MarqueeItem = ({ text }: { text: string }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        padding: "0 8px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "10px 20px",
          borderRadius: 10,
          backgroundColor: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(255,255,255,0.08)`,
          fontSize: 14,
          fontFamily: body,
          color: colors.textMuted,
          letterSpacing: "0.01em",
        }}
      >
        {text}
      </span>
    </span>
  );

  return (
    <section
      className="marquee-section"
      style={{
        padding: "96px 0 120px",
        backgroundColor: colors.bgDeep,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Edge fade gradients */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 120,
          background: `linear-gradient(90deg, ${colors.bgDeep}, transparent)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 120,
          background: `linear-gradient(270deg, ${colors.bgDeep}, transparent)`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Section title */}
      <FadeIn preset="fade" duration={1}>
        <h2
          style={{
            fontFamily: display,
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 700,
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          Look underneath.
        </h2>
      </FadeIn>

      {/* All 4 rows with circles spanning full height */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Row 1 — scrolls left */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-left">
            {[...row1, ...row1, ...row1, ...row1].map((text, i) => (
              <MarqueeItem key={`r1-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-right">
            {[...row2, ...row2, ...row2, ...row2].map((text, i) => (
              <MarqueeItem key={`r2-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 3 — scrolls left */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-left" style={{ animationDuration: "22s" }}>
            {[...row3, ...row3, ...row3, ...row3].map((text, i) => (
              <MarqueeItem key={`r3-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 4 — scrolls right */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-right" style={{ animationDuration: "19s" }}>
            {[...row4, ...row4, ...row4, ...row4].map((text, i) => (
              <MarqueeItem key={`r4-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 5 — scrolls left */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-left" style={{ animationDuration: "24s" }}>
            {[...row5, ...row5, ...row5, ...row5].map((text, i) => (
              <MarqueeItem key={`r5-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 6 — scrolls right (new territories) */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-right" style={{ animationDuration: "21s" }}>
            {[...row6, ...row6, ...row6, ...row6].map((text, i) => (
              <MarqueeItem key={`r6-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Row 7 — scrolls left (ambition & growth) */}
        <div style={{ overflow: "hidden" }}>
          <div className="marquee-track-left" style={{ animationDuration: "26s" }}>
            {[...row7, ...row7, ...row7, ...row7].map((text, i) => (
              <MarqueeItem key={`r7-${i}`} text={text} />
            ))}
          </div>
        </div>

        {/* Circles — spanning top of row 1 to bottom of row 7 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {circles.map((_, i) => (
            <motion.div
              key={`circle-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
              viewport={{ once: true }}
            >
              <div
                className="breathe-circle"
                style={{
                  width: i === 1 ? 360 : 310,
                  height: i === 1 ? 360 : 310,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${colors.coral} 0%, rgba(196,148,58,${i === 1 ? "0.28" : "0.15"}) 50%, transparent 100%)`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Labels — centered under each circle */}
      <FadeIn preset="fade" duration={0.8}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            paddingTop: 48,
          }}
        >
          {circles.map((label, i) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
              viewport={{ once: true }}
              style={{
                fontFamily: display,
                fontSize: 16,
                fontWeight: 700,
                color: colors.coral,
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                textAlign: "center",
                lineHeight: 1.3,
                width: i === 1 ? 360 : 310,
              }}
            >
              {label}
            </motion.span>
          ))}
        </div>
      </FadeIn>

      {/* CTA */}
      <FadeIn preset="fade" delay={0.5} duration={0.8}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a
            href="#programs"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: colors.coral,
              color: "#ffffff",
              fontFamily: display,
              fontSize: 15,
              fontWeight: 700,
              borderRadius: 50,
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
          >
            Find your program
          </a>
        </div>
      </FadeIn>
    </section>
  );
}

/* ── Comparison Table ── */
function ComparisonTable() {
  const comp = c.comparison;
  const colCount = comp.columns.length;
  const lastCol = colCount - 1;

  const CheckIcon = ({ highlight }: { highlight: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill={highlight ? colors.coral : "rgba(196,148,58,0.2)"} />
      <path d="M6 10l3 3 5-5" stroke={highlight ? colors.bgDeep : colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(68,68,76,0.4)" />
      <path d="M7 7l6 6M13 7l-6 6" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const PartialIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="rgba(196,148,58,0.12)" />
      <path d="M6 10h8" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );

  return (
    <section
      style={{
        ...sectionPadding,
        backgroundColor: colors.bgRecessed,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 16,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
              }}
            >
              {comp.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.2} duration={0.9}>
            <p
              style={{
                fontSize: 16,
                color: colors.textBody,
                maxWidth: 680,
                margin: "0 auto",
                lineHeight: 1.7,
                fontFamily: body,
              }}
            >
              {comp.subheadline}
            </p>
          </FadeIn>
        </div>

        {/* Table */}
        <FadeIn preset="slide-up" delay={0.3}>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `1px solid ${colors.borderDefault}`,
              backgroundColor: colors.bgSurface,
            }}
          >
            {/* Column headers */}
            <div
              className="comparison-header-row"
              style={{
                display: "grid",
                gridTemplateColumns: `1.8fr repeat(${colCount}, 1fr)`,
                borderBottom: `1px solid ${colors.borderSubtle}`,
              }}
            >
              <div style={{ padding: "20px 24px" }} />
              {comp.columns.map((col, i) => (
                <div
                  key={col}
                  style={{
                    padding: "20px 12px",
                    textAlign: "center",
                    fontFamily: display,
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    color: i === lastCol ? colors.coral : colors.textMuted,
                    ...(i === lastCol
                      ? {
                          background: `linear-gradient(180deg, rgba(196,148,58,0.15) 0%, rgba(196,148,58,0.06) 100%)`,
                          borderTop: `3px solid ${colors.coral}`,
                          fontSize: 13,
                        }
                      : {}),
                  }}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {comp.rows.map((row: { group?: string; feature?: string; values?: (boolean | "partial" | string)[] }, ri: number) => {
              // Group header row
              if ("group" in row && row.group) {
                return (
                  <motion.div
                    key={ri}
                    initial={{ opacity: 0, x: -40, scale: 0.95 }}
                    whileInView={{ opacity: 1, x: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
                    style={{
                      padding: "16px 24px",
                      borderBottom: `1px solid ${colors.borderSubtle}`,
                      backgroundColor: colors.bgRecessed,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <motion.div
                      initial={{ x: "-100%" }}
                      whileInView={{ x: "0%" }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(90deg, ${colors.coral}18 0%, transparent 100%)`,
                        zIndex: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: display,
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.08em",
                        color: colors.coral,
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {row.group}
                    </span>
                  </motion.div>
                );
              }

              // Feature row
              return (
                <div
                  key={ri}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `1.8fr repeat(${colCount}, 1fr)`,
                    borderBottom:
                      ri < comp.rows.length - 1
                        ? `1px solid ${colors.borderSubtle}`
                        : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = `rgba(196,148,58,0.03)`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Feature name */}
                  <div
                    style={{
                      padding: "16px 24px",
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.textBody,
                      fontFamily: body,
                      display: "flex",
                      alignItems: "center",
                      lineHeight: 1.4,
                    }}
                  >
                    {row.feature}
                  </div>
                  {/* Values */}
                  {row.values?.map((val, ci) => {
                    const isLast = ci === lastCol;
                    const cellContent = typeof val === "string" && val !== "partial" ? (
                      <span
                        style={{
                          fontFamily: display,
                          fontSize: 13,
                          fontWeight: isLast ? 700 : 500,
                          color: isLast ? colors.coral : colors.textBody,
                          textAlign: "center",
                          lineHeight: 1.3,
                        }}
                      >
                        {val}
                      </span>
                    ) : val === "partial" ? (
                      <PartialIcon />
                    ) : val ? (
                      <CheckIcon highlight={isLast} />
                    ) : (
                      <XIcon />
                    );

                    if (isLast) {
                      return (
                        <motion.div
                          key={ci}
                          initial={{ opacity: 0, scale: 0.7 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: "-30px" }}
                          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
                          style={{
                            padding: "16px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(180deg, rgba(196,148,58,0.10) 0%, rgba(196,148,58,0.04) 100%)`,
                          }}
                        >
                          {cellContent}
                        </motion.div>
                      );
                    }
                    return (
                      <div
                        key={ci}
                        style={{
                          padding: "16px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {cellContent}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn preset="fade" delay={0.4} duration={0.8}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a
              href="#programs"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                backgroundColor: colors.coral,
                color: "#ffffff",
                fontFamily: display,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 50,
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              See programs
            </a>
          </div>
        </FadeIn>

        {/* Footnote */}
        {comp.footnote && (
          <FadeIn preset="fade" delay={0.5} duration={1}>
            <p
              style={{
                fontSize: 14,
                color: colors.textMuted,
                textAlign: "center",
                maxWidth: 640,
                margin: "32px auto 0",
                lineHeight: 1.7,
                fontFamily: body,
              }}
            >
              {comp.footnote}
            </p>
          </FadeIn>
        )}

      </div>
    </section>
  );
}

/* ── Pricing Section ── */
function PricingSection() {
  const p = c.pricing;
  return (
    <section style={{ ...sectionPadding, backgroundColor: colors.bgDeep }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2 style={{
              fontFamily: display,
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              marginBottom: 12,
              color: colors.textPrimary,
              letterSpacing: "-0.03em",
            }}>
              {p.headline}
            </h2>
          </FadeIn>
          <FadeIn preset="blur" delay={0.15}>
            <p style={{
              fontSize: 17,
              color: colors.textMuted,
              fontFamily: body,
              lineHeight: 1.7,
            }}>
              {p.subheadline}
            </p>
          </FadeIn>
        </div>

        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {p.tiers.map((tier: { name: string; price: string; period: string; desc: string; cta: string; highlighted: boolean }, i: number) => (
            <FadeIn key={tier.name} delay={0.2 + i * 0.15} preset="slide-up">
              <motion.div
                whileHover={{ y: -4, boxShadow: tier.highlighted ? "0 20px 60px rgba(196,148,58,0.15)" : "0 16px 32px rgba(0,0,0,0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  padding: 36,
                  borderRadius: 20,
                  border: tier.highlighted
                    ? `2px solid rgba(196,148,58,0.4)`
                    : `1px solid ${colors.borderDefault}`,
                  backgroundColor: tier.highlighted ? `rgba(196,148,58,0.06)` : colors.bgSurface,
                  height: "100%",
                  boxSizing: "border-box" as const,
                  display: "flex",
                  flexDirection: "column" as const,
                  position: "relative" as const,
                  overflow: "hidden",
                }}
              >
                {tier.highlighted && (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${colors.coral}, ${colors.coral})`,
                  }} />
                )}
                <span style={{
                  fontFamily: display,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                  color: tier.highlighted ? colors.coral : colors.textMuted,
                  marginBottom: 16,
                }}>
                  {tier.name}
                </span>
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontFamily: display,
                    fontSize: 48,
                    fontWeight: 600,
                    color: tier.highlighted ? colors.coral : colors.textPrimary,
                    letterSpacing: "-0.03em",
                  }}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span style={{
                      fontSize: 16,
                      color: colors.textMuted,
                      fontFamily: body,
                      marginLeft: 4,
                    }}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: 14,
                  color: colors.textMuted,
                  lineHeight: 1.65,
                  fontFamily: body,
                  flex: 1,
                  marginBottom: 24,
                }}>
                  {tier.desc}
                </p>
                <motion.a
                  href={tier.highlighted ? "/subscribe" : "#programs"}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    padding: "14px 32px",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: display,
                    textDecoration: "none",
                    display: "inline-block",
                    textAlign: "center" as const,
                    borderRadius: 100,
                    ...(tier.highlighted
                      ? { backgroundColor: colors.coral, color: "#ffffff" }
                      : { backgroundColor: "transparent", color: colors.coral, border: `2px solid ${colors.coral}` }),
                  }}
                >
                  {tier.cta}
                </motion.a>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn preset="fade" delay={0.4}>
          <p style={{
            textAlign: "center",
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: body,
            lineHeight: 1.6,
          }}>
            {p.footer}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}


/* ── Social Proof (harbor bg) ── */
function SocialProof() {
  const sp = c.socialProof;
  return (
    <section style={{ paddingTop: 48, paddingLeft: 24, paddingRight: 24, paddingBottom: 140, position: "relative", overflow: "hidden" }}>
      <img
        src="/harbor-bg.jpg"
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.8,
          zIndex: 0,
        }}
      />
      <div style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, rgba(24,24,28,0.35) 0%, rgba(24,24,28,0.4) 100%)`,
        zIndex: 0,
      }} />
      <div style={{ maxWidth, margin: "0 auto", position: "relative", zIndex: 1 }}>

        <FadeIn preset="slide-up" duration={0.8}>
          <h2
            style={{
              fontFamily: display,
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 48,
              color: colors.textPrimary,
              letterSpacing: "-0.03em",
              textAlign: "center",
            }}
          >
            {sp.headline}
          </h2>
        </FadeIn>

        <div
          className="social-proof-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {sp.items.map((item: { quote: string; attribution: string; tag: string }, i: number) => (
            <FadeIn key={i} delay={0.15 + i * 0.12} preset="slide-up">
              <motion.div
                whileHover={{ y: -4, borderColor: colors.coral }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  padding: 28,
                  backgroundColor: "rgba(38, 38, 44, 0.75)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  borderRadius: 16,
                  border: `1px solid ${colors.borderDefault}`,
                  height: "100%",
                  boxSizing: "border-box" as const,
                  display: "flex",
                  flexDirection: "column" as const,
                }}
              >
                {/* Quote mark */}
                <span style={{
                  fontFamily: display,
                  fontSize: 48,
                  lineHeight: 1,
                  color: colors.coral,
                  opacity: 0.4,
                  marginBottom: 8,
                  display: "block",
                }}>
                  &ldquo;
                </span>
                <p style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  lineHeight: 1.7,
                  fontFamily: body,
                  fontStyle: "italic",
                  flex: 1,
                  marginBottom: 20,
                }}>
                  {item.quote}
                </p>
                <div style={{
                  borderTop: `1px solid ${colors.borderSubtle}`,
                  paddingTop: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}>
                  <span style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    fontFamily: body,
                  }}>
                    {item.attribution}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: display,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.08em",
                    color: colors.coral,
                    background: colors.coralWash,
                    padding: "3px 8px",
                    borderRadius: 100,
                    flexShrink: 0,
                  }}>
                    {item.tag}
                  </span>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
      {/* Wave divider embedded so bg image rounds out */}
      <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, zIndex: 2 }}>
        <SectionDivider variant="tilt" fromColor="transparent" toColor={colors.bgDeep} height={50} />
      </div>
    </section>
  );
}

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeFaqTopic, setActiveFaqTopic] = useState("The program");
  const supabase = createClient();
  const router = useRouter();

  // Scroll-linked hero parallax (global scroll — top 30% of page)
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

  useEffect(() => {
    // If user navigated here with a hash (e.g. /#programs), skip the dashboard redirect
    const hasHash = window.location.hash && window.location.hash.length > 1;
    if (hasHash) {
      setChecking(false);
      // Scroll to the hash target after a short delay for animations
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 500);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [supabase.auth, router]);

  useEffect(() => {
    trackEvent("homescreen_view", {});
  }, []);

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
          style={{ color: colors.textMuted, fontFamily: fonts.body }}
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
                whileHover={{ color: colors.coral }}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#ffffff",
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
              whileHover={{ color: colors.coral }}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#ffffff",
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
                color: "#ffffff",
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
          padding: "80px 24px 100px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hero background video */}
        {c.hero.heroVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/hero-poster.jpg"
            src={c.hero.heroVideo}
            onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: 1,
              transition: "opacity 0.5s ease",
            }}
          />
        )}
        {/* Minimal overlay — only at bottom for text legibility */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, rgba(24,24,28,0.15) 80%)`,
          zIndex: 0,
        }} />

        {/* Animated gradient background */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(ellipse at 30% 40%, rgba(196,148,58,0.07) 0%, transparent 70%)",
              "radial-gradient(ellipse at 70% 60%, rgba(196,148,58,0.07) 0%, transparent 70%)",
              "radial-gradient(ellipse at 30% 40%, rgba(196,148,58,0.07) 0%, transparent 70%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
        />


        <motion.div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            position: "relative",
            zIndex: 2,
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
              backgroundColor: "rgba(20, 20, 24, 0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 12,
              padding: "24px 32px",
            }}
          >
            <TextReveal
              text={c.hero.headline}
              as="span"
              triggerOnMount
              delay={0.3}
              stagger={0.04}
              duration={0.7}
              style={{ color: "#FFFFFF", textAlign: "center", fontFamily: display, fontWeight: 700 }}
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
              style={{ color: colors.coral, display: "flex", justifyContent: "center", width: "100%", fontSize: "1.6em", marginTop: 12 }}
            >
              <TextReveal
                text={c.hero.headlineAccent}
                as="span"
                triggerOnMount
                delay={0.8}
                stagger={0.07}
                duration={0.7}
                style={{ justifyContent: "center" }}
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
                backgroundColor: "rgba(20, 20, 24, 0.85)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: 12,
                padding: "16px 24px",
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
                color: "#ffffff",
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

      {/* ── Stats Bar ── */}
      <StatsBar />

      {/* ── Differentiator Strip ── */}
      <section
        className="differentiator-section"
        style={{
          padding: "80px 24px",
          backgroundColor: "#E4DDE2",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        <div
          className="differentiator-layout"
          style={{
            maxWidth,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* Left column — text items */}
          {/* Left column — bold statement */}
          <div style={{ flex: "0 0 40%" }}>
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                fontFamily: display,
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 800,
                color: colors.bgDeep,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                margin: 0,
                textAlign: "left",
              }}
            >
              When life keeps giving you lemons...
            </motion.p>
          </div>
          <div style={{ flex: "0 0 60%", display: "flex", flexDirection: "column", gap: 24 }}>
            {c.differentiator.items.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.15, ease: "easeOut" }}
                style={{
                  fontSize: i === 0 ? 17 : 15,
                  fontWeight: i === 0 ? 700 : 400,
                  color: i === 0 ? colors.coral : colors.bgDeep,
                  fontFamily: i === 0 ? display : body,
                  lineHeight: 1.6,
                  margin: 0,
                  letterSpacing: i === 0 ? "0.02em" : undefined,
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section
        id="programs"
        style={{
          paddingTop: 96,
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 140,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src="/ocean-bg.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
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
                color: colors.textSecondary,
                margin: "0 auto 56px",
                lineHeight: 1.7,
                fontFamily: body,
                maxWidth: 640,
                backgroundColor: "rgba(24, 24, 28, 0.80)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                borderRadius: 12,
                padding: "16px 24px",
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
            {c.programs.cards.map((card: { tag: string; title: string; desc: string; href: string; modules?: string[] }, i) => (
              <FadeIn key={card.tag} delay={0.15 + i * 0.12} preset="slide-up">
                <a href={card.href} onClick={() => trackEvent("homescreen_program_click", { program: card.tag.toLowerCase().replace(" ", "_") })} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
                <motion.div
                  whileHover={{
                    y: -6,
                    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                    borderColor: "rgba(224,149,133,0.3)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    padding: 32,
                    backgroundColor: "rgba(24,24,28,0.75)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: 16,
                    border: `1px solid rgba(255,255,255,0.1)`,
                    height: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  className="program-card"
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      background: "rgba(224,149,133,0.15)",
                      color: colors.coral,
                      fontFamily: display,
                      fontWeight: 700,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      padding: "8px 18px",
                      borderRadius: 100,
                      marginBottom: 22,
                      textAlign: "center" as const,
                      alignSelf: "center",
                    }}
                  >
                    {card.tag}
                    {card.tag === "Layoff" && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        background: "rgba(224,149,133,0.2)",
                        color: colors.coral,
                        padding: "3px 8px",
                        borderRadius: 20,
                      }}>
                        Sliding scale
                      </span>
                    )}
                  </span>
                  <h3
                    style={{
                      fontFamily: display,
                      fontSize: 19,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      marginBottom: 12,
                      color: "#ffffff",
                      textAlign: "center" as const,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.65,
                      marginBottom: 20,
                      fontFamily: body,
                      flex: 1,
                      textAlign: "center" as const,
                    }}
                  >
                    {card.desc}
                  </p>

                  {/* Depth peek — modules preview */}
                  {card.modules && (
                    <div
                      className="program-peek"
                      style={{
                        borderTop: `1px solid rgba(255,255,255,0.08)`,
                        paddingTop: 16,
                        marginBottom: 20,
                      }}
                    >
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: display,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.85)",
                        display: "block",
                        marginBottom: 10,
                      }}>
                        What we&rsquo;ll work on
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {card.modules.map((mod: string, mi: number) => (
                          <span
                            key={mi}
                            style={{
                              fontSize: 12,
                              fontFamily: body,
                              color: "rgba(255,255,255,0.9)",
                              lineHeight: 1.4,
                              paddingLeft: 12,
                              borderLeft: `2px solid ${colors.coral}40`,
                            }}
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: display,
                      color: colors.bgDeep,
                      letterSpacing: "0.02em",
                      marginTop: 8,
                      padding: "10px 24px",
                      backgroundColor: colors.coral,
                      border: "none",
                      borderRadius: 50,
                      textAlign: "center" as const,
                    }}
                  >
                    Learn more
                  </motion.span>
                </motion.div>
                </a>
              </FadeIn>
            ))}
          </div>

          {/* ── Coming Soon ── */}
          <ComingSoonWaitlist />

        </div>
      </section>

      {/* ── Pain-Point Marquee ── */}
      <PainPointMarquee />

      {/* ── Comparison Table ── */}
      <ComparisonTable />

      {/* ── How It Works ── */}
      <section id="how" style={{ paddingTop: 96, paddingLeft: 24, paddingRight: 24, paddingBottom: 140, position: "relative", overflow: "hidden", background: colors.bgDeep }}>
        <img
          src="/blueprint-bg.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth, margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Section title */}
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 56,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
                textAlign: "center",
              }}
            >
              How it works
            </h2>
          </FadeIn>

          {/* Steps — 2×3 card grid with icons + step numbers */}
          <div
            className="how-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {c.steps.items.map((step: { icon?: string; title: string; desc: string }, i: number) => {
              const iconMap: Record<string, React.ReactNode> = {
                compass: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                ),
                intake: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                ),
                mirror: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                ),
                daily: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                progress: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                ),
                human: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              };
              return (
                <FadeIn key={i} delay={0.08 + i * 0.08} preset="slide-up">
                  <motion.div
                    whileHover={{
                      y: -4,
                      borderColor: `rgba(196,148,58,0.3)`,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    style={{
                      padding: 28,
                      backgroundColor: colors.bgSurface,
                      borderRadius: 16,
                      border: `1px solid ${colors.borderDefault}`,
                      height: "100%",
                      boxSizing: "border-box" as const,
                      display: "flex",
                      flexDirection: "column" as const,
                      gap: 16,
                      position: "relative" as const,
                    }}
                  >
                    {/* Step number watermark */}
                    <span style={{
                      position: "absolute",
                      top: 16,
                      right: 20,
                      fontFamily: display,
                      fontSize: 56,
                      fontWeight: 600,
                      color: colors.coral,
                      opacity: 0.06,
                      lineHeight: 1,
                      pointerEvents: "none" as const,
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: `${colors.coral}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {step.icon && iconMap[step.icon] ? iconMap[step.icon] : (
                        <span style={{ fontFamily: display, fontSize: 15, fontWeight: 700, color: colors.coral }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                    <h3 style={{
                      fontFamily: display,
                      fontSize: 17,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      lineHeight: 1.35,
                      margin: 0,
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
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>

          {/* CTA */}
          <FadeIn preset="fade" delay={0.6} duration={0.8}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <a
                href="#programs"
                style={{
                  display: "inline-block",
                  padding: "14px 36px",
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 50,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                Get started
              </a>
            </div>
          </FadeIn>
        </div>
        {/* Wave divider embedded inside section so bg image rounds out */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, zIndex: 2 }}>
          <SectionDivider variant="wave" fromColor="transparent" toColor={colors.bgLight} height={60} />
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section
        style={{
          padding: "80px 0",
          backgroundColor: colors.bgLight,
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                color: "#18181C",
                marginBottom: 56,
                letterSpacing: "-0.03em",
                textAlign: "center",
              }}
            >
              Built different. Built honest.
            </h2>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: "What you write here stays here.",
                desc: "No model training. No third-party access. No data sales. Export or delete at any time.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                ),
                title: "Every exercise is cited and explained.",
                desc: "350+ exercises from published coaching and psychology frameworks. Each one tells you where it comes from and why it was chosen for you.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                ),
                title: "Developed with practitioners, not just engineers.",
                desc: "Built with professional coaches trained in neuroscience, mindfulness, positive psychology, change management, NVC, and psychometric assessment.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4" />
                    <path d="m6.34 6.34 2.83 2.83" />
                    <path d="M2 12h4" />
                    <path d="m6.34 17.66 2.83-2.83" />
                    <path d="M12 18v4" />
                    <path d="m17.66 17.66-2.83-2.83" />
                    <path d="M18 12h4" />
                    <path d="m17.66 6.34-2.83 2.83" />
                  </svg>
                ),
                title: "Smarter than a chatbot. More available than a coach.",
                desc: "Reads your journal daily, matches exercises to what\u2019s actually showing up, and adapts as you move \u2014 with rigor no chatbot has and consistency no human schedule can match.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.12} preset="fade">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 24,
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: `${colors.coral}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: display,
                        fontSize: 18,
                        fontWeight: 700,
                        lineHeight: 1.35,
                        marginBottom: 6,
                        color: "#18181C",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 15,
                        color: "rgba(24,24,28,0.6)",
                        lineHeight: 1.6,
                        margin: 0,
                        fontFamily: body,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* CTA */}
          <FadeIn preset="fade" delay={0.4} duration={0.8}>
            <div style={{ textAlign: "center", marginTop: 48 }}>
              <a
                href="#programs"
                style={{
                  display: "inline-block",
                  padding: "14px 36px",
                  backgroundColor: colors.coral,
                  color: "#ffffff",
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 50,
                  textDecoration: "none",
                  letterSpacing: "0.02em",
                }}
              >
                Find your program
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <SocialProof />

      {/* ── Takeaways ── */}
      <section style={{ paddingTop: 80, paddingBottom: 96, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth, margin: "0 auto" }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{
                fontFamily: body,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase" as const,
                color: colors.coral,
                marginBottom: 14,
              }}>
                After 30 days
              </p>
              <h2 style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
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
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {c.takeaways.items.map((item, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.1} preset="slide-up">
                <motion.div
                  whileHover={{ y: -4, borderColor: `rgba(196,148,58,0.3)` }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    padding: 28,
                    backgroundColor: colors.bgSurface,
                    borderRadius: 16,
                    border: `1px solid ${colors.borderDefault}`,
                    height: "100%",
                    boxSizing: "border-box" as const,
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${colors.coral}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    <span style={{
                      fontFamily: display,
                      fontSize: 18,
                      fontWeight: 600,
                      color: colors.coral,
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

      {/* ── Who Built This ── */}
      <section
        style={{
          paddingTop: 96,
          paddingLeft: 24,
          paddingRight: 24,
          paddingBottom: 140,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src="/lemon-bg.jpg"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.7,
            zIndex: 0,
          }}
        />
        <div style={{
          maxWidth: 920,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(24, 24, 28, 0.30)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 20,
          padding: "48px 40px 40px",
        }}>
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
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
        {/* Wave divider embedded so lemon bg rounds out */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, zIndex: 2 }}>
          <SectionDivider variant="ripple" fromColor="transparent" toColor={colors.bgDeep} height={50} />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ ...sectionPadding }}>
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
              className="faq-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                gap: 40,
                alignItems: "start",
              }}
            >
              {/* Topic nav — left column */}
              <nav
                className="faq-nav"
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 4,
                  position: "sticky" as const,
                  top: 100,
                }}
              >
                {(c.faq as { topics: string[] }).topics.map((topic: string) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setActiveFaqTopic(topic);
                      setOpenFaq(null);
                    }}
                    style={{
                      background: activeFaqTopic === topic ? colors.bgElevated : "transparent",
                      border: activeFaqTopic === topic
                        ? `1px solid ${colors.borderDefault}`
                        : "1px solid transparent",
                      borderRadius: 8,
                      padding: "10px 14px",
                      fontFamily: body,
                      fontSize: 13,
                      fontWeight: activeFaqTopic === topic ? 600 : 400,
                      color: activeFaqTopic === topic ? colors.textPrimary : colors.textMuted,
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
                {(c.faq.items as { topic: string; q: string; a: string }[])
                  .filter((item) => item.topic === activeFaqTopic)
                  .map((item, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div
                        key={`${activeFaqTopic}-${i}`}
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
                    );
                  })}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: colors.bgRecessed,
        }}
      >
        <div
          style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}
        >
          <FadeIn preset="slide-up" duration={0.8}>
            <h2
              style={{
                fontFamily: display,
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 700,
                marginBottom: 16,
                color: colors.textPrimary,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
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
                marginBottom: 20,
                fontFamily: body,
                lineHeight: 1.6,
              }}
            >
              {c.finalCta.subtext}
            </p>
          </FadeIn>
          <FadeIn preset="pop" delay={0.35}>
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
                  boxShadow: "0 16px 48px rgba(196,148,58,0.25)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                style={{
                  padding: "18px 48px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#ffffff",
                  backgroundColor: colors.coral,
                  borderRadius: 100,
                  textDecoration: "none",
                  display: "inline-block",
                  fontFamily: display,
                  letterSpacing: "0.01em",
                }}
              >
                {c.finalCta.primaryCta}
              </motion.a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Email Nurture ── */}
      <EmailNurtureSignup />

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
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 13,
              color: "#ffffff",
              alignItems: "center",
            }}
          >
            <span>
              {c.footer.copyright} · Made with <span style={{ color: colors.coral, fontSize: 18 }}>&#9829;</span> by{" "}
              <a
                href="https://allmindsondeck.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                All Minds On Deck
              </a>
            </span>
            <a
              href="/privacy"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              {c.footer.privacyLink}
            </a>
            <a
              href="/contact"
              style={{ color: "#ffffff", textDecoration: "none" }}
            >
              Contact
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
          .how-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .social-proof-grid { grid-template-columns: 1fr !important; }
          .takeaways-grid { grid-template-columns: 1fr !important; }
          .faq-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
          .faq-nav { flex-direction: row !important; flex-wrap: wrap !important; position: static !important; gap: 8px !important; }
          .differentiator-layout { flex-direction: column !important; text-align: center !important; }
          .differentiator-layout > div:last-child p { text-align: center !important; }
          .stats-bar-grid { flex-direction: column !important; gap: 12px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .programs-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .how-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .social-proof-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
