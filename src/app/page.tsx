"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
        <p style={{ color: "#888", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>Loading...</p>
      </div>
    );
  }

  const container: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#fafafa",
  };

  return (
    <div style={container}>
      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 600, marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, backgroundColor: "#2563eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", fontSize: 28, fontWeight: 700, color: "#fff",
        }}>
          CH
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px 0", color: "#111" }}>
          Coaching Hub
        </h1>
        <p style={{ fontSize: 14, color: "#2563eb", fontWeight: 600, margin: "0 0 20px 0", textTransform: "uppercase", letterSpacing: 1.5 }}>
          All Minds on Deck
        </p>
        <p style={{ fontSize: 18, color: "#555", lineHeight: 1.7, margin: "0 0 32px 0" }}>
          Your daily coaching companion. Personalised exercises, AI-powered journal
          reflections, and structured growth plans — all in one place.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/signup"
            style={{
              padding: "14px 32px", fontSize: 16, fontWeight: 600,
              color: "#fff", backgroundColor: "#2563eb", borderRadius: 10,
              textDecoration: "none", border: "none",
            }}
          >
            Get started
          </a>
          <a
            href="/login"
            style={{
              padding: "14px 32px", fontSize: 16, fontWeight: 600,
              color: "#2563eb", backgroundColor: "#fff", borderRadius: 10,
              textDecoration: "none", border: "2px solid #2563eb",
            }}
          >
            Sign in
          </a>
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20, maxWidth: 800, width: "100%", marginBottom: 48,
      }}>
        {[
          { icon: "\u270D\uFE0F", title: "Daily Journaling", desc: "Write freely and receive AI coaching reflections grounded in real frameworks." },
          { icon: "\uD83C\uDFAF", title: "Personalised Exercises", desc: "Exercises selected from a curated framework library, matched to your themes." },
          { icon: "\uD83D\uDCC8", title: "Progress Tracking", desc: "Weekly reviews, monthly summaries, and pattern recognition over time." },
          { icon: "\uD83D\uDD12", title: "Privacy First", desc: "Your data belongs to you. Full control over how it's used and shared." },
        ].map((f) => (
          <div key={f.title} style={{
            padding: 24, backgroundColor: "#fff", borderRadius: 12,
            border: "1px solid #e5e7eb",
          }}>
            <span style={{ fontSize: 28, display: "block", marginBottom: 12 }}>{f.icon}</span>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px 0", color: "#111" }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{ fontSize: 13, color: "#999" }}>
        Built by All Minds on Deck LLC
      </p>
    </div>
  );
}
