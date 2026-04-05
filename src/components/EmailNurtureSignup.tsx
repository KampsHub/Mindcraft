"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import FadeIn from "@/components/FadeIn";

const display = fonts.display;
const body = fonts.bodyAlt;

export default function EmailNurtureSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Enter your email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, program: "Weekly Insights Newsletter" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        padding: "64px 24px",
        background: colors.bgSurface,
        borderTop: `1px solid ${colors.borderSubtle}`,
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <FadeIn preset="slide-up">
          <h3
            style={{
              fontFamily: display,
              fontSize: 22,
              fontWeight: 600,
              color: colors.textPrimary,
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Get weekly insights
          </h3>
          <p
            style={{
              fontFamily: body,
              fontSize: 15,
              color: colors.textSecondary,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            One email a week. Frameworks, patterns, and practical tools for navigating career disruptions. No fluff.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: body,
                fontSize: 15,
                color: "#8BC48A",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#8BC48A" />
                <path
                  d="M5 8L7 10L11 6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              You&apos;re in. First email coming soon.
            </motion.div>
          ) : (
            <div
              style={{
                display: "flex",
                gap: 8,
                maxWidth: 400,
                margin: "0 auto",
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontFamily: body,
                  fontSize: 14,
                  color: colors.textPrimary,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 8,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  fontFamily: display,
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.bgDeep,
                  backgroundColor: colors.coral,
                  border: "none",
                  borderRadius: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </div>
          )}

          {error && (
            <p
              style={{
                fontFamily: body,
                fontSize: 13,
                color: "#E08585",
                marginTop: 8,
              }}
            >
              {error}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
