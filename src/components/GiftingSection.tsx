"use client";

import { motion } from "framer-motion";
import { colors, fonts, radii } from "@/lib/theme";

/**
 * Shared gifting CTA. Drops into the landing page (below the waitlist cards)
 * and into each program page. Links to /refer where the full gift + referral
 * flow lives.
 */
export default function GiftingSection() {
  return (
    <section style={{ padding: "40px 24px 8px", position: "relative" }}>
      <div style={{
        maxWidth: 780,
        margin: "0 auto",
        borderRadius: 14,
        padding: "22px 26px",
        backgroundImage: "linear-gradient(180deg, rgba(24,24,28,0.72) 0%, rgba(24,24,28,0.88) 100%), url('/hiker-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 28%",
        border: `1px solid ${colors.borderDefault}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{
            fontFamily: fonts.display, fontSize: 10, fontWeight: 700,
            color: colors.coral, textTransform: "uppercase",
            letterSpacing: "0.14em", margin: "0 0 6px 0",
          }}>
            Gift or refer
          </p>
          <p style={{
            fontFamily: fonts.display, fontSize: 16, fontWeight: 700,
            color: colors.textPrimary, lineHeight: 1.35,
            margin: "0 0 4px 0", letterSpacing: "-0.01em",
          }}>
            Know someone in the thick of a career transition?
          </p>
          <p style={{
            fontFamily: fonts.bodyAlt, fontSize: 13, lineHeight: 1.5,
            color: colors.textMuted, margin: 0,
          }}>
            Gift 30 days, or share your referral code — 20% off for them, $10 back to you.
          </p>
        </div>

        <motion.a
          href="/refer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: fonts.display, fontSize: 13, fontWeight: 600,
            padding: "10px 20px", borderRadius: radii.full,
            backgroundColor: "transparent",
            color: colors.coral,
            border: `1.5px solid ${colors.coral}`,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          Gift or refer
          <span aria-hidden>→</span>
        </motion.a>
      </div>
    </section>
  );
}
