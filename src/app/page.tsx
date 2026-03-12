"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";

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
          <div style={{
            width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: colors.white,
          }}>A</div>
          <span style={{ fontSize: 16, fontWeight: 600, color: colors.black }}>All Minds on Deck</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/login" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 500,
            color: colors.gray600, textDecoration: "none", borderRadius: 6,
            border: `1px solid ${colors.gray200}`,
          }}>Sign in</a>
          <a href="/signup" style={{
            padding: "8px 20px", fontSize: 14, fontWeight: 500,
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
        }}>Coaching Hub</p>
        <h1 style={{
          fontSize: 42, fontWeight: 800, lineHeight: 1.15,
          color: colors.black, margin: "0 0 20px 0",
        }}>
          Your daily coaching companion.
        </h1>
        <p style={{
          fontSize: 18, color: colors.gray600, lineHeight: 1.7,
          margin: "0 0 36px 0",
        }}>
          Personalised exercises, AI-powered journal reflections, and structured
          growth plans — between sessions, every day.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/signup" style={{
            padding: "14px 36px", fontSize: 16, fontWeight: 600,
            color: colors.white, backgroundColor: colors.primary,
            borderRadius: 10, textDecoration: "none",
          }}>Start your journey</a>
          <a href="/login" style={{
            padding: "14px 36px", fontSize: 16, fontWeight: 600,
            color: colors.primary, backgroundColor: colors.white,
            borderRadius: 10, textDecoration: "none",
            border: `2px solid ${colors.primary}`,
          }}>Sign in</a>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: "48px 24px 64px", backgroundColor: colors.gray50,
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20, maxWidth: 860, margin: "0 auto",
        }}>
          {[
            { icon: "\u270D\uFE0F", title: "Daily Journaling", desc: "Write freely and receive AI coaching reflections grounded in real frameworks." },
            { icon: "\uD83C\uDFAF", title: "Personalised Exercises", desc: "Selected from a curated library, matched to your themes and growth edges." },
            { icon: "\uD83D\uDCC8", title: "Progress Tracking", desc: "Weekly reviews, monthly summaries, and pattern recognition over time." },
            { icon: "\uD83D\uDD12", title: "Privacy First", desc: "Your data belongs to you. Full control over how it's used and shared." },
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

      {/* Footer */}
      <footer style={{
        padding: "32px 24px", textAlign: "center",
        borderTop: `1px solid ${colors.gray100}`,
      }}>
        <p style={{ fontSize: 13, color: colors.gray400, margin: 0 }}>
          Built by All Minds on Deck LLC
        </p>
      </footer>
    </div>
  );
}
