"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import TextReveal from "@/components/TextReveal";
import CountUp from "@/components/CountUp";
import ParallaxSection from "@/components/ParallaxSection";
import InteractiveDemo from "@/components/InteractiveDemo";

const featureAccents = [colors.primary, "#7c3aed", "#0891b2"];

export default function Home() {
  const [checking, setChecking] = useState(true);
  const [price, setPrice] = useState("...");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });
    fetch("/api/price")
      .then((r) => r.json())
      .then((d) => setPrice(d.formatted))
      .catch(() => setPrice("$29.95"));
  }, [supabase.auth, router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

  const hasVideo = !!c.hero.heroVideo;
  const hasImage = !!c.hero.heroImage;

  return (
    <div style={{ fontFamily: fonts.body, backgroundColor: colors.white, color: colors.black, overflowX: "hidden" }}>
      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: 960, margin: "0 auto", padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontSize: 17, fontWeight: 600, color: colors.black }}>{c.brand.name}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/login" style={{
            fontSize: 14, fontWeight: 500,
            color: colors.gray500, textDecoration: "none",
          }}>{c.header.signIn}</a>
          <motion.a
            href="/subscribe"
            whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              padding: "8px 20px", fontSize: 14, fontWeight: 600,
              color: colors.white, backgroundColor: colors.primary,
              textDecoration: "none", borderRadius: 6, border: "none",
              display: "inline-block",
            }}
          >{c.header.cta}</motion.a>
        </div>
      </motion.header>

      {/* ── Hero ── */}
      <section style={{
        position: "relative",
        textAlign: "center",
        padding: hasVideo || hasImage ? "96px 24px 72px" : "72px 24px 56px",
        maxWidth: hasVideo || hasImage ? "none" : 680,
        margin: "0 auto",
        overflow: "hidden",
      }}>
        {/* Background video */}
        {hasVideo && (
          <>
            <video
              autoPlay muted loop playsInline
              poster={c.hero.heroPoster || undefined}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                objectFit: "cover", zIndex: 0,
              }}
            >
              <source src={c.hero.heroVideo} type="video/mp4" />
            </video>
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1,
            }} />
          </>
        )}

        {/* Background image (when no video) */}
        {!hasVideo && hasImage && (
          <>
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundImage: `url(${c.hero.heroImage})`,
              backgroundSize: "cover", backgroundPosition: "center", zIndex: 0,
            }} />
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1,
            }} />
          </>
        )}

        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 680, margin: "0 auto",
        }}>
          {/* Word-by-word headline reveal — fires on mount */}
          <TextReveal
            text={c.hero.headline}
            as="h1"
            triggerOnMount
            delay={0.2}
            stagger={0.06}
            duration={0.6}
            style={{
              fontSize: 46, fontWeight: 700, lineHeight: 1.1,
              color: hasVideo || hasImage ? colors.white : colors.black,
              margin: "0 0 4px 0",
              justifyContent: "center",
            }}
          />
          <TextReveal
            text={c.hero.headlineAccent}
            as="h1"
            triggerOnMount
            delay={0.6}
            stagger={0.06}
            duration={0.6}
            style={{
              fontSize: 46, fontWeight: 700, lineHeight: 1.1,
              color: colors.primary,
              margin: "0 0 24px 0",
              justifyContent: "center",
            }}
          />

          {/* Subheadline blurs in */}
          <FadeIn delay={1.0} preset="blur" duration={0.9} triggerOnMount>
            <p style={{
              fontSize: 19,
              color: hasVideo || hasImage ? "rgba(255,255,255,0.85)" : colors.gray600,
              lineHeight: 1.7,
              margin: "0 0 40px 0",
              maxWidth: 500, marginLeft: "auto", marginRight: "auto",
            }}>
              {c.hero.subheadline}
            </p>
          </FadeIn>

          {/* CTA pops in with spring */}
          <FadeIn delay={1.4} preset="pop" triggerOnMount>
            <motion.a
              href="/subscribe"
              whileHover={{ scale: 1.06, boxShadow: "0 8px 30px rgba(59, 130, 246, 0.35)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "16px 44px", fontSize: 17, fontWeight: 600,
                color: colors.white, backgroundColor: colors.primary,
                borderRadius: 10, textDecoration: "none",
                display: "inline-block",
              }}
            >{c.hero.cta}</motion.a>
          </FadeIn>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section style={{
        padding: "56px 24px", backgroundColor: colors.black,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <TextReveal
            text={c.problem.headline}
            as="h2"
            stagger={0.05}
            duration={0.5}
            style={{
              fontSize: 28, fontWeight: 700, color: colors.white,
              marginBottom: 24, justifyContent: "center", lineHeight: 1.3,
            }}
          />
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            maxWidth: 520, margin: "0 auto",
          }}>
            {c.problem.points.map((line, i) => (
              <FadeIn key={i} delay={0.3 + i * 0.2} preset={i === 2 ? "rise" : "slide-left"}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.4 + i * 0.2 }}
                    style={{
                      color: i === 2 ? colors.primary : colors.gray400,
                      fontSize: 20, lineHeight: 1.4, flexShrink: 0,
                    }}
                  >
                    {i === 2 ? "\u2192" : "\u2022"}
                  </motion.span>
                  <p style={{
                    fontSize: 16, color: i === 2 ? colors.white : colors.gray300,
                    margin: 0, lineHeight: 1.6,
                    fontWeight: i === 2 ? 500 : 400,
                  }}>
                    {line}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <ParallaxSection speed={-15} style={{ backgroundColor: colors.primaryLight }}>
        <section style={{ padding: "48px 24px", textAlign: "center" }}>
          <TextReveal
            text={c.audience.line1}
            as="p"
            stagger={0.03}
            style={{
              fontSize: 17, color: colors.black, margin: 0, lineHeight: 1.6,
              maxWidth: 560, marginLeft: "auto", marginRight: "auto", fontWeight: 500,
              justifyContent: "center",
            }}
          />
          <TextReveal
            text={c.audience.line2}
            as="p"
            delay={0.4}
            stagger={0.03}
            style={{
              fontSize: 17, color: colors.black, margin: 0, lineHeight: 1.6,
              maxWidth: 560, marginLeft: "auto", marginRight: "auto", fontWeight: 500,
              justifyContent: "center",
            }}
          />
        </section>
      </ParallaxSection>

      {/* ── What it does — with product preview ── */}
      <section style={{ padding: "64px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <TextReveal
            text={c.features.headline}
            as="h2"
            stagger={0.06}
            style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 12, color: colors.black,
              justifyContent: "center",
            }}
          />
          <FadeIn preset="blur" delay={0.3}>
            <p style={{
              fontSize: 16, color: colors.gray500, textAlign: "center",
              marginBottom: 44, lineHeight: 1.6, maxWidth: 520,
              marginLeft: "auto", marginRight: "auto",
            }}>
              {c.features.subheadline}
            </p>
          </FadeIn>

          {/* Feature cards with staggered pop */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20, marginBottom: 48,
          }}>
            {c.features.cards.map((item, i) => (
              <FadeIn key={item.title} delay={0.2 + i * 0.15} preset="rise">
                <motion.div
                  whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    padding: 28, backgroundColor: colors.white, borderRadius: 12,
                    border: `1px solid ${colors.gray100}`,
                    borderTop: `3px solid ${featureAccents[i]}`,
                    height: "100%", boxSizing: "border-box",
                    cursor: "default",
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: colors.gray500, lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {/* Product preview — mock reflection */}
          <FadeIn preset="scale" delay={0.1}>
            <div style={{
              maxWidth: 560, margin: "0 auto",
              padding: 28, backgroundColor: colors.gray50, borderRadius: 16,
              border: `1px solid ${colors.gray100}`,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: colors.gray400,
                textTransform: "uppercase", letterSpacing: 1, margin: "0 0 16px 0",
              }}>
                {c.preview.label}
              </p>
              <FadeIn preset="slide-right" delay={0.3}>
                <div style={{
                  padding: 20, backgroundColor: colors.white, borderRadius: 10,
                  border: `1px solid ${colors.gray200}`, marginBottom: 16,
                }}>
                  <p style={{ fontSize: 14, color: colors.gray400, margin: "0 0 8px 0", fontStyle: "italic" }}>
                    {c.preview.userLabel}
                  </p>
                  <p style={{ fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
                    {c.preview.userEntry}
                  </p>
                </div>
              </FadeIn>
              <FadeIn preset="slide-left" delay={0.6}>
                <div style={{
                  padding: 20, backgroundColor: colors.primaryLight, borderRadius: 10,
                  borderLeft: `3px solid ${colors.primary}`,
                }}>
                  <p style={{ fontSize: 14, color: colors.gray400, margin: "0 0 8px 0", fontStyle: "italic" }}>
                    {c.preview.reflectionLabel}
                  </p>
                  <p style={{ fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
                    {c.preview.reflectionText}
                  </p>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section style={{ padding: "64px 24px", backgroundColor: colors.gray50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <TextReveal
            text={c.interactiveDemo.headline}
            as="h2"
            stagger={0.08}
            style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 12, color: colors.black,
              justifyContent: "center",
            }}
          />
          <FadeIn preset="blur" delay={0.2}>
            <p style={{
              fontSize: 16, color: colors.gray500, textAlign: "center",
              marginBottom: 32, lineHeight: 1.6,
            }}>
              {c.interactiveDemo.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.3} preset="scale">
            <InteractiveDemo />
          </FadeIn>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "56px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <TextReveal
            text={c.steps.headline}
            as="h2"
            stagger={0.06}
            style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 40, color: colors.black,
              justifyContent: "center",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {c.steps.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.2} preset="slide-left">
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring", stiffness: 260, damping: 20,
                      delay: 0.1 + i * 0.2,
                    }}
                    style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: colors.primary, color: colors.white,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px 0", color: colors.black }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14, color: colors.gray500, margin: 0, lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Credibility ── */}
      <ParallaxSection speed={-10} style={{ backgroundColor: colors.gray50 }}>
        <section style={{ padding: "56px 24px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <TextReveal
              text={c.credibility.headline}
              as="h2"
              stagger={0.05}
              style={{
                fontSize: 28, fontWeight: 700, marginBottom: 12, color: colors.black,
                justifyContent: "center",
              }}
            />
            <FadeIn preset="blur" delay={0.3}>
              <p style={{
                fontSize: 16, color: colors.gray500, lineHeight: 1.7,
                marginBottom: 36, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
              }}>
                {c.credibility.description}
              </p>
            </FadeIn>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16, maxWidth: 560, margin: "0 auto",
            }}>
              {c.credibility.stats.map(({ label, desc }, i) => (
                <FadeIn key={label} delay={0.2 + i * 0.12} preset="pop">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      padding: 20, backgroundColor: colors.white, borderRadius: 10,
                    }}
                  >
                    <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px 0", color: colors.primary }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 13, color: colors.gray500, margin: 0 }}>
                      {desc}
                    </p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </ParallaxSection>

      {/* ── Pricing ── */}
      <section style={{ padding: "56px 24px", backgroundColor: colors.black }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <TextReveal
            text={c.pricing.headline}
            as="h2"
            stagger={0.07}
            style={{
              fontSize: 28, fontWeight: 700, color: colors.white, marginBottom: 12,
              justifyContent: "center",
            }}
          />
          <FadeIn preset="blur" delay={0.3}>
            <p style={{ fontSize: 16, color: colors.gray300, marginBottom: 32, lineHeight: 1.6 }}>
              {c.pricing.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.5} preset="scale">
            <motion.p
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
              style={{
                fontSize: 42, fontWeight: 700, color: colors.white, margin: "0 0 4px 0",
              }}
            >
              {price}
              <span style={{ fontSize: 18, fontWeight: 400, color: colors.gray400 }}>{c.pricing.interval}</span>
            </motion.p>
            <p style={{ fontSize: 14, color: colors.gray400, marginBottom: 32 }}>
              {c.pricing.disclaimer}
            </p>
            <motion.a
              href="/subscribe"
              whileHover={{ scale: 1.06, boxShadow: "0 8px 30px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "16px 48px", fontSize: 17, fontWeight: 600,
                color: colors.black, backgroundColor: colors.primary,
                borderRadius: 10, textDecoration: "none",
                display: "inline-block",
              }}
            >{c.pricing.cta}</motion.a>
          </FadeIn>
        </div>
      </section>

      {/* ── AMOD clients ── */}
      <FadeIn preset="blur">
        <section style={{
          padding: "40px 24px", backgroundColor: colors.gray50,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 15, color: colors.gray500, margin: 0, lineHeight: 1.6 }}>
            {c.clientsBanner}{" "}
            <a href={c.brand.companyUrl} target="_blank" rel="noopener noreferrer" style={{
              color: colors.primary, textDecoration: "none", fontWeight: 500,
            }}>Learn more &rarr;</a>
          </p>
        </section>
      </FadeIn>

      {/* ── Footer ── */}
      <footer style={{
        padding: "32px 24px", textAlign: "center",
        borderTop: `1px solid ${colors.gray100}`,
        backgroundColor: colors.white,
      }}>
        <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
          {c.footer.text}{" "}
          <a href={c.brand.companyUrl} target="_blank" rel="noopener noreferrer" style={{
            color: colors.gray400, textDecoration: "none",
          }}>{c.brand.companyName}</a>
        </p>
      </footer>
    </div>
  );
}
