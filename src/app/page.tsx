"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

export default function Home() {
  const [checking, setChecking] = useState(true);
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
  }, [supabase.auth, router]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.gray400, fontFamily: fonts.body }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: fonts.body, backgroundColor: colors.white, color: colors.black }}>
      {/* ── Header ── */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 960, margin: "0 auto", padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontSize: 17, fontWeight: 600, color: colors.black }}>Mindcraft</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/login" style={{
            fontSize: 14, fontWeight: 500,
            color: colors.gray500, textDecoration: "none",
          }}>Sign in</a>
          <a href="/subscribe" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 600,
            color: colors.white, backgroundColor: colors.primary,
            textDecoration: "none", borderRadius: 6, border: "none",
          }}>Get Mindcraft</a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        textAlign: "center", padding: "72px 24px 56px",
        maxWidth: 680, margin: "0 auto",
        backgroundColor: colors.white,
      }}>
        <h1 style={{
          fontSize: 46, fontWeight: 700, lineHeight: 1.1,
          color: colors.black, margin: "0 0 24px 0",
        }}>
          Your daily<br />
          <span style={{ color: colors.primary }}>coaching companion.</span>
        </h1>
        <p style={{
          fontSize: 19, color: colors.gray600, lineHeight: 1.7,
          margin: "0 0 40px 0", maxWidth: 540, marginLeft: "auto", marginRight: "auto",
        }}>
          Journal daily. Get AI-powered reflections that see your patterns.
          Do targeted exercises from proven coaching frameworks —
          personalised to your themes.
        </p>
        <a href="/subscribe" style={{
          padding: "16px 44px", fontSize: 17, fontWeight: 600,
          color: colors.white, backgroundColor: colors.primary,
          borderRadius: 10, textDecoration: "none",
          display: "inline-block",
          transition: "background-color 0.15s",
        }}>Get Mindcraft — $75/mo</a>
        <p style={{ fontSize: 13, color: colors.gray400, marginTop: 12 }}>
          Cancel anytime. No contracts.
        </p>
      </section>

      {/* ── The Problem ── */}
      <section style={{
        padding: "56px 24px", backgroundColor: colors.black,
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, color: colors.white,
            marginBottom: 24, textAlign: "center", lineHeight: 1.3,
          }}>
            Growth shouldn&apos;t depend on someone else&apos;s calendar.
          </h2>
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            maxWidth: 520, margin: "0 auto",
          }}>
            {[
              "You read the books. Watch the talks. You know what you want to change.",
              "But insight without structure fades. Old patterns run on autopilot.",
              "You need a system — not another app that tells you to breathe.",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
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
            ))}
          </div>
          <p style={{
            fontSize: 17, color: colors.primary, fontWeight: 600,
            textAlign: "center", marginTop: 32,
          }}>
            Mindcraft is that system.
          </p>
        </div>
      </section>

      {/* ── What it does ── */}
      <section style={{ padding: "64px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center",
            marginBottom: 12, color: colors.black,
          }}>
            Not another journal app.
          </h2>
          <p style={{
            fontSize: 16, color: colors.gray500, textAlign: "center",
            marginBottom: 44, lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto",
          }}>
            A coaching system that reads what you write, reflects back what it sees,
            and gives you real work to do — matched to your patterns.
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}>
            {[
              {
                title: "Write. Get seen.",
                desc: "Journal freely. Your companion reflects back patterns, blind spots, and growth edges — not platitudes.",
                accent: colors.primary,
              },
              {
                title: "Do the real work.",
                desc: "Targeted exercises pulled from IFS, ACT, CBT, Gottman, and positive psychology. Matched to your themes. Done in minutes.",
                accent: "#7c3aed",
              },
              {
                title: "See what\u2019s shifting.",
                desc: "Weekly reviews and monthly summaries surface patterns across entries. Track your growth over time.",
                accent: "#0891b2",
              },
            ].map((item) => (
              <div key={item.title} style={{
                padding: 28, backgroundColor: colors.white, borderRadius: 12,
                border: `1px solid ${colors.gray100}`,
                borderTop: `3px solid ${item.accent}`,
              }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px 0", color: colors.black }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: colors.gray500, lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "56px 24px", backgroundColor: colors.gray50 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center",
            marginBottom: 40, color: colors.black,
          }}>
            Three steps. Then you&apos;re in.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {[
              {
                step: "1",
                title: "Tell us what you\u2019re working on",
                desc: "A short intake builds your personalised 12-week plan \u2014 frameworks matched to your situation.",
              },
              {
                step: "2",
                title: "Journal and do the work",
                desc: "Write daily. Get reflections that notice what you miss. Complete exercises that move the needle \u2014 not generic homework.",
              },
              {
                step: "3",
                title: "Watch the patterns emerge",
                desc: "Weekly reviews and monthly summaries show what\u2019s shifting. Real evidence of your growth, tracked over time.",
              },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: colors.primary, color: colors.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, flexShrink: 0,
                }}>
                  {item.step}
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
            ))}
          </div>
        </div>
      </section>

      {/* ── Credibility ── */}
      <section style={{ padding: "56px 24px", backgroundColor: colors.white }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, marginBottom: 12, color: colors.black,
          }}>
            Built on real frameworks. By real coaches.
          </h2>
          <p style={{
            fontSize: 16, color: colors.gray500, lineHeight: 1.7,
            marginBottom: 36, maxWidth: 560, marginLeft: "auto", marginRight: "auto",
          }}>
            Mindcraft is built by{" "}
            <a href="https://allmindsondeck.org" target="_blank" rel="noopener noreferrer" style={{
              color: colors.primary, textDecoration: "none", fontWeight: 500,
            }}>All Minds on Deck</a>
            {" "}&mdash; an ICF &amp; EMCC certified coaching practice with backgrounds
            in product leadership, positive psychology, and neuroscience.
            The methodology is proven. The frameworks are real.
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16, maxWidth: 560, margin: "0 auto",
          }}>
            {[
              { label: "ICF & EMCC", desc: "certified coaches" },
              { label: "12-week", desc: "structured plans" },
              { label: "6+", desc: "proven frameworks" },
              { label: "100%", desc: "your data" },
            ].map(({ label, desc }) => (
              <div key={label} style={{
                padding: 20, backgroundColor: colors.gray50, borderRadius: 10,
              }}>
                <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px 0", color: colors.primary }}>
                  {label}
                </p>
                <p style={{ fontSize: 13, color: colors.gray500, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA ── */}
      <section style={{
        padding: "56px 24px",
        backgroundColor: colors.black,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: colors.white, marginBottom: 8 }}>
            Your growth system. $75/month.
          </h2>
          <p style={{ fontSize: 16, color: colors.gray300, marginBottom: 8, lineHeight: 1.6 }}>
            Daily reflections. Personalised exercises. Pattern tracking.
            Everything you need to keep moving.
          </p>
          <p style={{
            fontSize: 42, fontWeight: 700, color: colors.white, margin: "24px 0 4px 0",
          }}>
            $75<span style={{ fontSize: 18, fontWeight: 400, color: colors.gray400 }}>/month</span>
          </p>
          <p style={{ fontSize: 14, color: colors.gray400, marginBottom: 32 }}>
            Cancel anytime. No contracts. Your data stays yours.
          </p>
          <a href="/subscribe" style={{
            padding: "16px 48px", fontSize: 17, fontWeight: 600,
            color: colors.black, backgroundColor: colors.primary,
            borderRadius: 10, textDecoration: "none",
            display: "inline-block",
          }}>Get Mindcraft</a>
        </div>
      </section>

      {/* ── AMOD clients ── */}
      <section style={{
        padding: "40px 24px", backgroundColor: colors.gray50,
        textAlign: "center",
      }}>
        <p style={{ fontSize: 15, color: colors.gray500, margin: 0, lineHeight: 1.6 }}>
          Active{" "}
          <a href="https://allmindsondeck.org" target="_blank" rel="noopener noreferrer" style={{
            color: colors.primary, textDecoration: "none", fontWeight: 500,
          }}>All Minds on Deck</a>
          {" "}coaching clients get free access to Mindcraft.{" "}
          <a href="https://allmindsondeck.org" target="_blank" rel="noopener noreferrer" style={{
            color: colors.primary, textDecoration: "none", fontWeight: 500,
          }}>Learn more &rarr;</a>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        padding: "32px 24px", textAlign: "center",
        borderTop: `1px solid ${colors.gray100}`,
        backgroundColor: colors.white,
      }}>
        <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
          Mindcraft &mdash; built by{" "}
          <a href="https://allmindsondeck.org" target="_blank" rel="noopener noreferrer" style={{
            color: colors.gray400, textDecoration: "none",
          }}>All Minds on Deck LLC</a>
        </p>
      </footer>
    </div>
  );
}
