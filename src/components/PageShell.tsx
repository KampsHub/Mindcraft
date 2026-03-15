"use client";

import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

const body = fonts.bodyAlt;

const blobPositions = {
  default: {
    coral: { top: "8%", right: "12%" },
    plum: { top: "18%", left: "8%" },
  },
  journal: {
    coral: { top: "12%", right: "6%" },
    plum: { top: "30%", left: "10%" },
  },
  goals: {
    coral: { top: "5%", left: "15%" },
    plum: { top: "22%", right: "8%" },
  },
};

interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: number;
  showBlobs?: boolean;
  blobVariant?: keyof typeof blobPositions;
}

export default function PageShell({
  children,
  maxWidth = 720,
  showBlobs = true,
  blobVariant = "default",
}: PageShellProps) {
  const positions = blobPositions[blobVariant];

  return (
    <div style={{ backgroundColor: colors.bgDeep, minHeight: "100vh", fontFamily: body, position: "relative" }}>
      {showBlobs && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            style={{
              position: "absolute", ...positions.coral,
              width: 180, height: 180, borderRadius: "50%",
              background: colors.coral, pointerEvents: "none", filter: "blur(60px)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute", ...positions.plum,
              width: 140, height: 140, borderRadius: "50%",
              background: colors.plum, pointerEvents: "none", filter: "blur(50px)",
            }}
          />
        </>
      )}
      <Nav />
      <div style={{ maxWidth, margin: "0 auto", padding: "40px 24px 80px", position: "relative" }}>
        {children}
      </div>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${colors.borderSubtle}` }}>
        <div style={{
          maxWidth, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <a href="/dashboard" style={{ textDecoration: "none" }}>
            <Logo size={16} />
          </a>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: colors.textMuted }}>
            <span>{c.footer.copyright}</span>
            <a href={c.brand.companyUrl} target="_blank" rel="noopener noreferrer"
              style={{ color: colors.textMuted, textDecoration: "none" }}>
              All Minds on Deck
            </a>
            <a href="/privacy-policy" style={{ color: colors.textMuted, textDecoration: "none" }}>
              {c.footer.privacyLink}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
