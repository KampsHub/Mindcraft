"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors, fonts, card } from "@/lib/theme";
import { content as c } from "@/content/site";
import Logo from "@/components/Logo";

function SubscribeContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [price, setPrice] = useState("...");
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("checkout") === "cancelled";

  useEffect(() => {
    fetch("/api/price")
      .then((r) => r.json())
      .then((d) => setPrice(d.formatted))
      .catch(() => setPrice("$29.95"));
  }, []);

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

  return (
    <div style={{ backgroundColor: colors.gray50, minHeight: "100vh", fontFamily: fonts.body }}>
      {/* Simple header — no Nav since user may not be logged in */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 960, margin: "0 auto", padding: "20px 24px",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo size={32} />
          <span style={{ fontSize: 17, fontWeight: 600, color: colors.black }}>{c.brand.name}</span>
        </a>
        <a href="/login" style={{
          fontSize: 14, fontWeight: 500, color: colors.gray500, textDecoration: "none",
        }}>
          Already a member? {c.header.signIn}
        </a>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: colors.black }}>
            {c.subscribe.headline}
          </h1>
          <p style={{ fontSize: 16, color: colors.gray500, lineHeight: 1.6 }}>
            {c.subscribe.subheadline}
          </p>
        </div>

        {cancelled && (
          <div style={{
            padding: 14, backgroundColor: colors.warningLight, border: "1px solid #fde68a",
            borderRadius: 8, marginBottom: 24, textAlign: "center",
            fontSize: 14, color: "#92400e",
          }}>
            {c.subscribe.cancelledMessage}
          </div>
        )}

        {/* Pricing card */}
        <div style={{
          ...card, padding: 32, border: `2px solid ${colors.primary}`,
          borderRadius: 16, textAlign: "center", marginBottom: 32,
        }}>
          <p style={{ fontSize: 13, color: colors.primaryDark, fontWeight: 600, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: 1 }}>
            {c.subscribe.pricingLabel}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 16 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: colors.black }}>{price}</span>
            <span style={{ fontSize: 16, color: colors.gray400 }}>{c.pricing.interval}</span>
          </div>

          <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {c.subscribe.features.map((feature) => (
              <div key={feature} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ color: colors.success, fontSize: 16, lineHeight: 1.4 }}>{"\u2713"}</span>
                <span style={{ fontSize: 14, color: colors.dark, lineHeight: 1.4 }}>{feature}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 32px", fontSize: 16, fontWeight: 600,
              color: colors.white, backgroundColor: loading ? colors.gray400 : colors.primary,
              border: "none", borderRadius: 10,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? c.subscribe.ctaLoading : c.subscribe.cta}
          </button>

          {error && (
            <p style={{ fontSize: 13, color: colors.error, marginTop: 12 }}>{error}</p>
          )}

          <p style={{ fontSize: 12, color: colors.gray400, marginTop: 12 }}>
            {c.subscribe.disclaimer}
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <a href="/" style={{
            fontSize: 14, color: colors.gray500, textDecoration: "none",
          }}>
            &larr; Back to {c.brand.name}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 120 }}><p style={{ color: colors.gray400 }}>Loading...</p></div>}>
      <SubscribeContent />
    </Suspense>
  );
}
