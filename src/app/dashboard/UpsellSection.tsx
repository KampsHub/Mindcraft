"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { colors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";

const display = fonts.display;
const body = fonts.bodyAlt;

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: 14,
  padding: 24,
  display: "flex",
  flexDirection: "column",
};

interface UpsellSectionProps {
  showEnneagram: boolean;
  programSlug: string;
  onNavigate: (path: string) => void;
}

export default function UpsellSection({ showEnneagram, programSlug, onNavigate }: UpsellSectionProps) {
  if (!showEnneagram) {
    // Enneagram purchased — show confirmation + coaching upsell
    return (
      <FadeIn preset="fade" delay={0.1}>
        <div style={{ marginTop: 36 }}>
          <div style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 24 }} />

          {/* Enneagram confirmation */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 18px", borderRadius: 12,
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.coralWash}`,
            marginBottom: 20,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              backgroundColor: colors.coralWash,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: colors.coral, fontSize: 14, fontWeight: 700 }}>✓</span>
            </div>
            <p style={{
              fontFamily: body, fontSize: 13, color: colors.textPrimary, margin: 0, lineHeight: 1.4,
            }}>
              Enneagram results available in{" "}
              <span
                onClick={() => onNavigate("/weekly-review")}
                style={{ color: colors.coral, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
              >
                Insights
              </span>
            </p>
          </div>

          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textPrimary, marginBottom: 14, letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            Go deeper
          </p>
          <CoachingCard onNavigate={onNavigate} />
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn preset="fade" delay={0.1}>
      <div style={{ marginTop: 36 }}>
        <div style={{ height: 1, backgroundColor: colors.borderSubtle, marginBottom: 24 }} />
        <p style={{
          fontFamily: display, fontSize: 12, fontWeight: 600,
          color: colors.textPrimary, marginBottom: 14, letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          Go deeper
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}>
          <EnneagramCard />
          <CoachingCard onNavigate={onNavigate} />
        </div>
      </div>
    </FadeIn>
  );
}

function EnneagramCard() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    trackEvent("enneagram_standalone_begin_checkout", {});
    try {
      const res = await fetch("/api/checkout/enneagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else console.error("Checkout error:", data.error);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: "none",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.coralWash} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <span style={{
        alignSelf: "flex-start",
        fontFamily: body, fontSize: 9, fontWeight: 700,
        letterSpacing: 1.5, textTransform: "uppercase",
        padding: "5px 12px", borderRadius: 6,
        backgroundColor: colors.coralWash, color: colors.coral,
        marginBottom: 14,
      }}>
        Deep Insight
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 8px 0",
        letterSpacing: "-0.01em",
      }}>
        Add Enneagram
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, color: colors.textPrimary,
        lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
      }}>
        The IEQ9 Enneagram — the assessment professional coaches actually use. It shows you why you react the way you do under pressure and what patterns keep repeating. Includes a 1-hour live debrief. Your results shape every exercise.
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: display, fontSize: 15, fontWeight: 600,
          color: colors.coral,
        }}>
          $300
        </span>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={handleCheckout}
          disabled={loading}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: loading ? "default" : "pointer",
            letterSpacing: "0.01em",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Redirecting…" : "Add now"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function CoachingCard({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        ...cardStyle,
        border: "none",
        position: "relative" as const,
        overflow: "hidden" as const,
      }}
    >
      {/* Decorative glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.coralWash} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <span style={{
        alignSelf: "flex-start",
        fontFamily: body, fontSize: 9, fontWeight: 700,
        letterSpacing: 1.5, textTransform: "uppercase",
        padding: "5px 12px", borderRadius: 6,
        backgroundColor: colors.coralWash, color: colors.coralLight,
        marginBottom: 14,
      }}>
        Dedicated Expert-Coach
      </span>
      <p style={{
        fontFamily: display, fontSize: 18, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 8px 0",
        letterSpacing: "-0.01em",
      }}>
        1:1 Coaching
      </p>
      <p style={{
        fontFamily: body, fontSize: 13, color: colors.textPrimary,
        lineHeight: 1.6, margin: "0 0 20px 0", flex: 1,
      }}>
        The program builds the foundation. A coach can further accelerate it — catching blind spots in real time, pushing back when you're stuck in a loop, and helping you rehearse the conversations you're avoiding. Includes a personal Enneagram assessment to sharpen the work.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => onNavigate("/apply")}
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: "pointer",
            letterSpacing: "0.01em",
          }}
        >
          Apply
        </motion.button>
      </div>
    </motion.div>
  );
}
