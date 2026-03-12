"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";

function SubscribeContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("checkout") === "cancelled";

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    });
  }, [supabase.auth, router]);

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const container: React.CSSProperties = {
    maxWidth: 560,
    margin: "0 auto",
    padding: "48px 24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  return (
    <div style={container}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Coaching Hub
        </h1>
        <p style={{ fontSize: 16, color: "#555", lineHeight: 1.6 }}>
          Your daily coaching companion — personalised exercises, journal reflections,
          and AI-powered insights.
        </p>
      </div>

      {cancelled && (
        <div style={{
          padding: 14, backgroundColor: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 8, marginBottom: 24, textAlign: "center",
          fontSize: 14, color: "#92400e",
        }}>
          Checkout was cancelled. You can try again when you&apos;re ready.
        </div>
      )}

      {/* Pricing card */}
      <div style={{
        padding: 32, border: "2px solid #2563eb", borderRadius: 16,
        textAlign: "center", marginBottom: 32,
      }}>
        <p style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 1 }}>
          Monthly
        </p>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 700 }}>$75</span>
          <span style={{ fontSize: 16, color: "#888" }}>/month</span>
        </div>

        <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Daily personalised coaching exercises",
            "AI-powered journal reflections",
            "12-week coaching plan",
            "Theme tracking and pattern recognition",
            "Weekly and monthly progress reviews",
            "Privacy-first — your data stays yours",
          ].map((feature) => (
            <div key={feature} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "#16a34a", fontSize: 16, lineHeight: 1.4 }}>{"\u2713"}</span>
              <span style={{ fontSize: 14, color: "#333", lineHeight: 1.4 }}>{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading || !user}
          style={{
            width: "100%", padding: "14px 32px", fontSize: 16, fontWeight: 600,
            color: "#fff", backgroundColor: loading ? "#999" : "#2563eb",
            border: "none", borderRadius: 10,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Redirecting to checkout..." : "Subscribe now"}
        </button>

        {error && (
          <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{error}</p>
        )}

        <p style={{ fontSize: 12, color: "#888", marginTop: 12 }}>
          Cancel anytime. Test with card 4242 4242 4242 4242.
        </p>
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={() => router.push("/dashboard")} style={{
          fontSize: 14, color: "#666", backgroundColor: "transparent",
          border: "none", cursor: "pointer", textDecoration: "underline",
        }}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 120 }}><p style={{ color: "#888" }}>Loading...</p></div>}>
      <SubscribeContent />
    </Suspense>
  );
}
