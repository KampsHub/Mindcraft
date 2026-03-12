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
import ParallaxSection from "@/components/ParallaxSection";
import InteractiveDemo from "@/components/InteractiveDemo";

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
      {/* ── Header — AMOD-style thin, clean ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: 1100, margin: "0 auto", padding: "24px 32px",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Logo size={90} />
        </a>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="/login" style={{
            fontSize: 14, fontWeight: 400, color: colors.gray500,
            textDecoration: "none", letterSpacing: "0.01em",
          }}>{c.header.signIn}</a>
          <motion.a
            href="/subscribe"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              padding: "10px 28px", fontSize: 14, fontWeight: 500,
              color: colors.white, backgroundColor: colors.primary,
              textDecoration: "none", borderRadius: 24,
              display: "inline-block", letterSpacing: "0.01em",
            }}
          >{c.header.cta}</motion.a>
        </div>
      </motion.header>

      {/* ── Hero — big, bold, Framer-style ── */}
      <section style={{
        position: "relative",
        textAlign: "center",
        padding: hasVideo || hasImage ? "120px 32px 100px" : "80px 32px 64px",
        maxWidth: hasVideo || hasImage ? "none" : "none",
        margin: "0 auto",
        overflow: "hidden",
      }}>
        {hasVideo && (
          <>
            <video autoPlay muted loop playsInline poster={c.hero.heroPoster || undefined}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
              <source src={c.hero.heroVideo} type="video/mp4" />
            </video>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1 }} />
          </>
        )}
        {!hasVideo && hasImage && (
          <>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: `url(${c.hero.heroImage})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1 }} />
          </>
        )}

        <div style={{ position: "relative", zIndex: 2, maxWidth: 800, margin: "0 auto" }}>
          {/* AMOD-style: bold headline with black highlight box */}
          <TextReveal
            text={c.hero.headline}
            as="h1"
            triggerOnMount
            delay={0.2}
            stagger={0.06}
            duration={0.6}
            style={{
              fontSize: 64, fontWeight: 700, lineHeight: 1.05,
              color: hasVideo || hasImage ? colors.white : colors.black,
              margin: "0 0 8px 0",
              justifyContent: "center",
              letterSpacing: "-0.03em",
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
              fontSize: 64, fontWeight: 700, lineHeight: 1.05,
              color: colors.primary,
              margin: "0 0 32px 0",
              justifyContent: "center",
              letterSpacing: "-0.03em",
            }}
          />

          <FadeIn delay={1.0} preset="blur" duration={0.9} triggerOnMount>
            <p style={{
              fontSize: 20, fontWeight: 300,
              color: hasVideo || hasImage ? "rgba(255,255,255,0.85)" : colors.gray500,
              lineHeight: 1.7,
              marginTop: 0, marginBottom: 48, marginLeft: "auto", marginRight: "auto",
              maxWidth: 520,
              letterSpacing: "0.01em",
            }}>
              {c.hero.subheadline}
            </p>
          </FadeIn>

          <FadeIn delay={1.4} preset="pop" triggerOnMount>
            <motion.a
              href="/subscribe"
              whileHover={{ scale: 1.06, boxShadow: "0 12px 40px rgba(240, 142, 128, 0.35)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "18px 52px", fontSize: 16, fontWeight: 500,
                color: colors.white, backgroundColor: colors.black,
                borderRadius: 32, textDecoration: "none",
                display: "inline-block", letterSpacing: "0.02em",
              }}
            >{c.hero.cta}</motion.a>
          </FadeIn>
        </div>
      </section>

      {/* ── The Problem — AMOD-style black section ── */}
      <section style={{ padding: "80px 32px", backgroundColor: colors.black }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <TextReveal
            text={c.problem.headline}
            as="h2"
            stagger={0.05}
            duration={0.5}
            style={{
              fontSize: 40, fontWeight: 700, color: colors.white,
              marginBottom: 36, justifyContent: "center", lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          />
          <div style={{
            display: "flex", flexDirection: "column", gap: 20,
            maxWidth: 560, margin: "0 auto",
          }}>
            {c.problem.points.map((line, i) => (
              <FadeIn key={i} delay={0.3 + i * 0.2} preset={i === 2 ? "rise" : "slide-left"}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{
                    color: i === 2 ? colors.primary : colors.gray400,
                    fontSize: 22, lineHeight: 1.4, flexShrink: 0,
                  }}>
                    {i === 2 ? "\u2192" : "\u2022"}
                  </span>
                  <p style={{
                    fontSize: 17, color: i === 2 ? colors.white : colors.gray300,
                    margin: 0, lineHeight: 1.7,
                    fontWeight: i === 2 ? 500 : 300,
                    letterSpacing: "0.01em",
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
      <ParallaxSection speed={-12} style={{ backgroundColor: colors.primaryLight }}>
        <section style={{ padding: "56px 32px", textAlign: "center" }}>
          <TextReveal
            text={c.audience.line1}
            as="p"
            stagger={0.03}
            style={{
              fontSize: 20, color: colors.black, margin: "0 auto", lineHeight: 1.6,
              maxWidth: 600, fontWeight: 400, justifyContent: "center",
              letterSpacing: "0.01em",
            }}
          />
          <TextReveal
            text={c.audience.line2}
            as="p"
            delay={0.4}
            stagger={0.03}
            style={{
              fontSize: 20, color: colors.black, margin: "0 auto", lineHeight: 1.6,
              maxWidth: 600, fontWeight: 600, justifyContent: "center",
            }}
          />
        </section>
      </ParallaxSection>

      {/* ── Features ── */}
      <section style={{ padding: "88px 32px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <TextReveal
            text={c.features.headline}
            as="h2"
            stagger={0.06}
            style={{
              fontSize: 40, fontWeight: 700, textAlign: "center",
              marginBottom: 16, color: colors.black,
              justifyContent: "center", letterSpacing: "-0.02em",
            }}
          />
          <FadeIn preset="blur" delay={0.3}>
            <p style={{
              fontSize: 17, color: colors.gray500, textAlign: "center",
              marginBottom: 56, lineHeight: 1.7, maxWidth: 540,
              marginLeft: "auto", marginRight: "auto", fontWeight: 300,
            }}>
              {c.features.subheadline}
            </p>
          </FadeIn>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24, marginBottom: 56,
          }}>
            {c.features.cards.map((item, i) => (
              <FadeIn key={item.title} delay={0.2 + i * 0.15} preset="rise">
                <motion.div
                  whileHover={{ y: -8, boxShadow: "0 16px 40px rgba(0,0,0,0.06)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    padding: 32, backgroundColor: colors.white, borderRadius: 16,
                    border: `1px solid ${colors.gray100}`,
                    height: "100%", boxSizing: "border-box",
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: [colors.primary, "#7c3aed", "#0891b2"][i],
                    marginBottom: 16,
                  }} />
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 10px 0", color: colors.black }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 15, color: colors.gray500, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                    {item.desc}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {/* Product preview */}
          <FadeIn preset="scale" delay={0.1}>
            <div style={{
              maxWidth: 580, margin: "0 auto",
              padding: 32, backgroundColor: colors.gray50, borderRadius: 20,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 600, color: colors.gray400,
                textTransform: "uppercase", letterSpacing: 2, margin: "0 0 20px 0",
              }}>
                {c.preview.label}
              </p>
              <FadeIn preset="slide-right" delay={0.3}>
                <div style={{
                  padding: 24, backgroundColor: colors.white, borderRadius: 12,
                  border: `1px solid ${colors.gray200}`, marginBottom: 16,
                }}>
                  <p style={{ fontSize: 13, color: colors.gray400, margin: "0 0 8px 0", fontWeight: 500 }}>
                    {c.preview.userLabel}
                  </p>
                  <p style={{ fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.7, fontWeight: 300 }}>
                    {c.preview.userEntry}
                  </p>
                </div>
              </FadeIn>
              <FadeIn preset="slide-left" delay={0.6}>
                <div style={{
                  padding: 24, backgroundColor: colors.primaryLight, borderRadius: 12,
                  borderLeft: `3px solid ${colors.primary}`,
                }}>
                  <p style={{ fontSize: 13, color: colors.gray400, margin: "0 0 8px 0", fontWeight: 500 }}>
                    {c.preview.reflectionLabel}
                  </p>
                  <p style={{ fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.7, fontWeight: 300 }}>
                    {c.preview.reflectionText}
                  </p>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section style={{ padding: "88px 32px", backgroundColor: colors.gray50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <TextReveal
            text={c.interactiveDemo.headline}
            as="h2"
            stagger={0.08}
            style={{
              fontSize: 40, fontWeight: 700, textAlign: "center",
              marginBottom: 16, color: colors.black,
              justifyContent: "center", letterSpacing: "-0.02em",
            }}
          />
          <FadeIn preset="blur" delay={0.2}>
            <p style={{
              fontSize: 17, color: colors.gray500, textAlign: "center",
              marginBottom: 40, lineHeight: 1.7, fontWeight: 300,
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
      <section style={{ padding: "88px 32px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <TextReveal
            text={c.steps.headline}
            as="h2"
            stagger={0.06}
            style={{
              fontSize: 40, fontWeight: 700, textAlign: "center",
              marginBottom: 48, color: colors.black,
              justifyContent: "center", letterSpacing: "-0.02em",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {c.steps.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.2} preset="slide-left">
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 + i * 0.2 }}
                    style={{
                      width: 44, height: 44, borderRadius: "50%",
                      backgroundColor: colors.black, color: colors.white,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 600, flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px 0", color: colors.black }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 15, color: colors.gray500, margin: 0, lineHeight: 1.7, fontWeight: 300 }}>
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
      <ParallaxSection speed={-8} style={{ backgroundColor: colors.gray50 }}>
        <section style={{ padding: "80px 32px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <TextReveal
              text={c.credibility.headline}
              as="h2"
              stagger={0.05}
              style={{
                fontSize: 36, fontWeight: 700, marginBottom: 16, color: colors.black,
                justifyContent: "center", letterSpacing: "-0.02em",
              }}
            />
            <FadeIn preset="blur" delay={0.3}>
              <p style={{
                fontSize: 16, color: colors.gray500, lineHeight: 1.8,
                marginBottom: 44, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
                fontWeight: 300,
              }}>
                {c.credibility.description}
              </p>
            </FadeIn>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20, maxWidth: 600, margin: "0 auto",
            }}>
              {c.credibility.stats.map(({ label, desc }, i) => (
                <FadeIn key={label} delay={0.2 + i * 0.12} preset="pop">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      padding: 24, backgroundColor: colors.white, borderRadius: 14,
                    }}
                  >
                    <p style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>
                      {label}
                    </p>
                    <p style={{ fontSize: 12, color: colors.gray400, margin: 0, fontWeight: 400 }}>
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
      <section style={{ padding: "88px 32px", backgroundColor: colors.black }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <TextReveal
            text={c.pricing.headline}
            as="h2"
            stagger={0.07}
            style={{
              fontSize: 40, fontWeight: 700, color: colors.white, marginBottom: 16,
              justifyContent: "center", letterSpacing: "-0.02em",
            }}
          />
          <FadeIn preset="blur" delay={0.3}>
            <p style={{
              fontSize: 17, color: colors.gray300, marginBottom: 40, lineHeight: 1.7,
              fontWeight: 300,
            }}>
              {c.pricing.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.5} preset="scale">
            <p style={{
              fontSize: 56, fontWeight: 700, color: colors.white, margin: "0 0 4px 0",
              letterSpacing: "-0.03em",
            }}>
              {price}
              <span style={{ fontSize: 20, fontWeight: 300, color: colors.gray400 }}>{c.pricing.interval}</span>
            </p>
            <p style={{ fontSize: 14, color: colors.gray400, marginBottom: 40, fontWeight: 300 }}>
              {c.pricing.disclaimer}
            </p>
            <motion.a
              href="/subscribe"
              whileHover={{ scale: 1.06, boxShadow: "0 12px 40px rgba(240, 142, 128, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                padding: "18px 56px", fontSize: 16, fontWeight: 500,
                color: colors.black, backgroundColor: colors.primary,
                borderRadius: 32, textDecoration: "none",
                display: "inline-block", letterSpacing: "0.02em",
              }}
            >{c.pricing.cta}</motion.a>
          </FadeIn>
        </div>
      </section>

      {/* ── AMOD clients ── */}
      <FadeIn preset="blur">
        <section style={{ padding: "48px 32px", backgroundColor: colors.gray50, textAlign: "center" }}>
          <p style={{ fontSize: 15, color: colors.gray500, margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
            {c.clientsBanner}{" "}
            <a href={c.brand.companyUrl} target="_blank" rel="noopener noreferrer" style={{
              color: colors.primary, textDecoration: "none", fontWeight: 500,
            }}>Learn more &rarr;</a>
          </p>
        </section>
      </FadeIn>

      {/* ── Footer ── */}
      <footer style={{
        padding: "40px 32px", textAlign: "center",
        borderTop: `1px solid ${colors.gray100}`,
        backgroundColor: colors.white,
      }}>
        <p style={{ fontSize: 13, color: colors.gray400, margin: 0, fontWeight: 300 }}>
          {c.footer.text}{" "}
          <a href={c.brand.companyUrl} target="_blank" rel="noopener noreferrer" style={{
            color: colors.gray400, textDecoration: "none",
          }}>{c.brand.companyName}</a>
        </p>
      </footer>
    </div>
  );
}
