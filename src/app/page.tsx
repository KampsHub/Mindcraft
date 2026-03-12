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
    <div style={{ fontFamily: fonts.body }}>
      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 960, margin: "0 auto", padding: "20px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={36} />
          <span style={{ fontSize: 17, fontWeight: 600, color: colors.black }}>Mindcraft</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/login" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 500,
            color: colors.gray600, textDecoration: "none", borderRadius: 6,
            border: `1px solid ${colors.gray200}`,
          }}>Sign in</a>
          <a href="/subscribe" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 600,
            color: colors.white, backgroundColor: colors.primary,
            textDecoration: "none", borderRadius: 6, border: "none",
          }}>Get started</a>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        textAlign: "center", padding: "80px 24px 64px",
        maxWidth: 640, margin: "0 auto",
      }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: colors.primary,
          textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16,
        }}>by All Minds on Deck</p>
        <h1 style={{
          fontSize: 44, fontWeight: 700, lineHeight: 1.12,
          color: colors.black, margin: "0 0 20px 0",
        }}>
          Your growth?<br />On autopilot.
        </h1>
        <p style={{
          fontSize: 18, color: colors.gray600, lineHeight: 1.7,
          margin: "0 0 36px 0",
        }}>
          Real coaching frameworks. Personalised exercises. AI-powered reflections.
          Not theory — real work, every day, between sessions.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/subscribe" style={{
            padding: "14px 36px", fontSize: 16, fontWeight: 600,
            color: colors.white, backgroundColor: colors.primary,
            borderRadius: 10, textDecoration: "none",
            transition: "background-color 0.15s",
          }}>Start your journey</a>
          <a href="/login" style={{
            padding: "14px 36px", fontSize: 16, fontWeight: 600,
            color: colors.primary, backgroundColor: colors.white,
            borderRadius: 10, textDecoration: "none",
            border: `2px solid ${colors.primary}`,
          }}>Sign in</a>
        </div>
      </section>

      {/* Value props — AMOD voice */}
      <section style={{
        padding: "48px 24px 64px", backgroundColor: colors.gray50,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20, maxWidth: 860, margin: "0 auto",
        }}>
          {[
            {
              icon: "\u270D\uFE0F",
              title: "Journal. Get seen.",
              desc: "Write freely. Your coaching companion reflects back what it notices — patterns, blind spots, growth edges.",
            },
            {
              icon: "\uD83C\uDFAF",
              title: "Exercises that fit.",
              desc: "Pulled from proven frameworks, matched to your themes. Not generic homework — targeted practice.",
            },
            {
              icon: "\uD83D\uDCC8",
              title: "Track what matters.",
              desc: "Weekly reviews. Monthly patterns. See where you're growing and where you're stuck. In days, not months.",
            },
            {
              icon: "\uD83D\uDD12",
              title: "Your data. Full stop.",
              desc: "You own everything. Full control over sharing, export, and deletion. No training on your entries. Ever.",
            },
          ].map((f) => (
            <div key={f.title} style={{
              padding: 28, backgroundColor: colors.white, borderRadius: 12,
              border: `1px solid ${colors.gray100}`,
            }}>
              <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{f.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px 0", color: colors.black }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: colors.gray500, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "56px 24px", maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8, color: colors.black }}>
          Not reinventing the wheel.
        </h2>
        <p style={{ fontSize: 16, color: colors.gray500, textAlign: "center", marginBottom: 40, lineHeight: 1.6 }}>
          But holding the compass. Here&apos;s how it works.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { step: "1", title: "Subscribe & intake", desc: "Tell us what brought you here. We build your personalised 12-week coaching plan." },
            { step: "2", title: "Journal daily", desc: "Write what's real. Your AI companion reflects back what it sees — no fluff, no platitudes." },
            { step: "3", title: "Do the work", desc: "Targeted exercises from proven frameworks. Matched to your themes. Completed in minutes." },
            { step: "4", title: "See the patterns", desc: "Weekly reviews and monthly summaries surface what's shifting. Discussions become decisions." },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: colors.primaryLight, color: colors.primaryDark,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, flexShrink: 0,
              }}>
                {item.step}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 4px 0", color: colors.black }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: colors.gray500, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "48px 24px", textAlign: "center",
        backgroundColor: colors.black,
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: colors.white, marginBottom: 8 }}>
          Ready to do the work?
        </h2>
        <p style={{ fontSize: 15, color: colors.gray300, marginBottom: 28, lineHeight: 1.6 }}>
          $75/month. Cancel anytime. Real frameworks. Real growth.
        </p>
        <a href="/subscribe" style={{
          padding: "14px 40px", fontSize: 16, fontWeight: 600,
          color: colors.black, backgroundColor: colors.primary,
          borderRadius: 10, textDecoration: "none",
          display: "inline-block",
        }}>Start your journey</a>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px", textAlign: "center",
        borderTop: `1px solid ${colors.gray100}`,
      }}>
        <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
          Mindcraft — built by All Minds on Deck LLC
        </p>
      </footer>
    </div>
  );
}
