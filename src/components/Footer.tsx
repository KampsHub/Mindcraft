"use client";

import { colors, fonts, radii, space } from "@/lib/theme";

/**
 * Shared site footer. Used by PageShell (authenticated pages) and
 * standalone subpages like /refer.
 */
export default function Footer({ maxWidth = 900 }: { maxWidth?: number }) {
  return (
    <footer style={{
      padding: `${space[7]}px ${space[5]}px`,
      borderTop: `1px solid ${colors.borderSubtle}`,
      position: "relative",
      zIndex: 1,
    }}>
      <div style={{
        maxWidth, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexWrap: "wrap", gap: space[4],
        backgroundColor: "rgba(24, 24, 28, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: radii.md,
        padding: `${space[4]}px ${space[5]}px`,
      }}>
        <div style={{
          display: "flex", gap: space[5], fontSize: 13,
          fontFamily: fonts.bodyAlt, color: colors.textPrimary, alignItems: "center",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          <span>
            &copy; {new Date().getFullYear()} Mindcraft &middot; Made with{" "}
            <span style={{ color: colors.coral, fontSize: 18 }}>&#9829;</span> by{" "}
            <a
              href="https://allmindsondeck.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.textPrimary, textDecoration: "underline" }}
            >
              All Minds On Deck
            </a>
          </span>
          <a href="/privacy" style={{ color: colors.textPrimary, textDecoration: "none" }}>
            Privacy
          </a>
          <a href="/contact" style={{ color: colors.textPrimary, textDecoration: "none" }}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
