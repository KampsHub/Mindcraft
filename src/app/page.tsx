"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
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
        <p style={{ color: colors.gray400, fontFamily: fonts.body }}>Loading...</p>
      </div>
    );
  }

  const hasVideo = !!c.hero.heroVideo;
  const hasImage = !!c.hero.heroImage;

  return (
    <div style={{ fontFamily: fonts.body, backgroundColor: colors.white, color: colors.black }}>
      {/* ── Header ── */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 960, margin: "0 auto", padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontSize: 17, fontWeight: 600, color: colors.black }}>{c.brand.name}</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/login" style={{
            fontSize: 14, fontWeight: 500,
            color: colors.gray500, textDecoration: "none",
          }}>{c.header.signIn}</a>
          <a href="/subscribe" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 600,
            color: colors.white, backgroundColor: colors.primary,
            textDecoration: "none", borderRadius: 6, border: "none",
          }}>{c.header.cta}</a>
        </div>
      </header>

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
              autoPlay
              muted
              loop
              playsInline
              poster={c.hero.heroPoster || undefined}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                zIndex: 0,
              }}
            >
              <source src={c.hero.heroVideo} type="video/mp4" />
            </video>
            <div style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.55)",
              zIndex: 1,
            }} />
          </>
        )}

        {/* Background image (when no video) */}
        {!hasVideo && hasImage && (
          <>
            <div style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundImage: `url(${c.hero.heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
            }} />
            <div style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1,
            }} />
          </>
        )}

        <div style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 680,
          margin: "0 auto",
        }}>
          <FadeIn delay={0.1}>
            <h1 style={{
              fontSize: 46, fontWeight: 700, lineHeight: 1.1,
              color: hasVideo || hasImage ? colors.white : colors.black,
              margin: "0 0 24px 0",
            }}>
              {c.hero.headline}<br />
              <span style={{ color: colors.primary }}>{c.hero.headlineAccent}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p style={{
              fontSize: 19,
              color: hasVideo || hasImage ? "rgba(255,255,255,0.85)" : colors.gray600,
              lineHeight: 1.7,
              margin: "0 0 40px 0",
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              {c.hero.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <a href="/subscribe" style={{
              padding: "16px 44px", fontSize: 17, fontWeight: 600,
              color: colors.white, backgroundColor: colors.primary,
              borderRadius: 10, textDecoration: "none",
              display: "inline-block",
              transition: "background-color 0.15s, transform 0.15s",
            }}>{c.hero.cta}</a>
          </FadeIn>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section style={{
        padding: "56px 24px", backgroundColor: colors.black,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{
              fontSize: 28, fontWeight: 700, color: colors.white,
              marginBottom: 24, textAlign: "center", lineHeight: 1.3,
            }}>
              {c.problem.headline}
            </h2>
          </FadeIn>
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            maxWidth: 520, margin: "0 auto",
          }}>
            {c.problem.points.map((line, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{
                    color: i === 2 ? colors.primary : colors.gray400,
                    fontSize: 20, lineHeight: 1.4, flexShrink: 0,
                  }}>
                    {i === 2 ? "\u2192" : "\u2022"}
                  </span>
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
      <FadeIn>
        <section style={{
          padding: "48px 24px", backgroundColor: colors.primaryLight,
          textAlign: "center",
        }}>
          <p style={{
            fontSize: 17, color: colors.black, margin: 0, lineHeight: 1.6,
            maxWidth: 560, marginLeft: "auto", marginRight: "auto", fontWeight: 500,
          }}>
            {c.audience.line1}<br />
            {c.audience.line2}
          </p>
        </section>
      </FadeIn>

      {/* ── What it does — with product preview ── */}
      <section style={{ padding: "64px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 12, color: colors.black,
            }}>
              {c.features.headline}
            </h2>
            <p style={{
              fontSize: 16, color: colors.gray500, textAlign: "center",
              marginBottom: 44, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto",
            }}>
              {c.features.subheadline}
            </p>
          </FadeIn>

          {/* Feature cards */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20, marginBottom: 48,
          }}>
            {c.features.cards.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1} direction="up">
                <div style={{
                  padding: 28, backgroundColor: colors.white, borderRadius: 12,
                  border: `1px solid ${colors.gray100}`,
                  borderTop: `3px solid ${featureAccents[i]}`,
                  height: "100%",
                  boxSizing: "border-box",
                }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: colors.gray500, lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Product preview — mock reflection */}
          <FadeIn>
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
              <div style={{
                padding: 20, backgroundColor: colors.white, borderRadius: 10,
                border: `1px solid ${colors.gray200}`, marginBottom: 16,
              }}>
                <p style={{
                  fontSize: 14, color: colors.gray400, margin: "0 0 8px 0",
                  fontStyle: "italic",
                }}>
                  {c.preview.userLabel}
                </p>
                <p style={{
                  fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.6,
                }}>
                  {c.preview.userEntry}
                </p>
              </div>
              <div style={{
                padding: 20, backgroundColor: colors.primaryLight, borderRadius: 10,
                borderLeft: `3px solid ${colors.primary}`,
              }}>
                <p style={{
                  fontSize: 14, color: colors.gray400, margin: "0 0 8px 0",
                  fontStyle: "italic",
                }}>
                  {c.preview.reflectionLabel}
                </p>
                <p style={{
                  fontSize: 15, color: colors.dark, margin: 0, lineHeight: 1.6,
                }}>
                  {c.preview.reflectionText}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section style={{
        padding: "64px 24px",
        backgroundColor: colors.gray50,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 12, color: colors.black,
            }}>
              {c.interactiveDemo.headline}
            </h2>
            <p style={{
              fontSize: 16, color: colors.gray500, textAlign: "center",
              marginBottom: 32, lineHeight: 1.6,
            }}>
              {c.interactiveDemo.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <InteractiveDemo />
          </FadeIn>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "56px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{
              fontSize: 28, fontWeight: 700, textAlign: "center",
              marginBottom: 40, color: colors.black,
            }}>
              {c.steps.headline}
            </h2>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {c.steps.items.map((item, i) => (
              <FadeIn key={i} delay={i * 0.15} direction="left">
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: colors.primary, color: colors.white,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
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
      <section style={{ padding: "56px 24px", backgroundColor: colors.gray50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h2 style={{
              fontSize: 28, fontWeight: 700, marginBottom: 12, color: colors.black,
            }}>
              {c.credibility.headline}
            </h2>
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
              <FadeIn key={label} delay={i * 0.1}>
                <div style={{
                  padding: 20, backgroundColor: colors.white, borderRadius: 10,
                }}>
                  <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px 0", color: colors.primary }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 13, color: colors.gray500, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{
        padding: "56px 24px",
        backgroundColor: colors.black,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.white, marginBottom: 12 }}>
              {c.pricing.headline}
            </h2>
            <p style={{ fontSize: 16, color: colors.gray300, marginBottom: 32, lineHeight: 1.6 }}>
              {c.pricing.subheadline}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{
              fontSize: 42, fontWeight: 700, color: colors.white, margin: "0 0 4px 0",
            }}>
              {price}<span style={{ fontSize: 18, fontWeight: 400, color: colors.gray400 }}>{c.pricing.interval}</span>
            </p>
            <p style={{ fontSize: 14, color: colors.gray400, marginBottom: 32 }}>
              {c.pricing.disclaimer}
            </p>
            <a href="/subscribe" style={{
              padding: "16px 48px", fontSize: 17, fontWeight: 600,
              color: colors.black, backgroundColor: colors.primary,
              borderRadius: 10, textDecoration: "none",
              display: "inline-block",
            }}>{c.pricing.cta}</a>
          </FadeIn>
        </div>
      </section>

      {/* ── AMOD clients ── */}
      <FadeIn>
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
