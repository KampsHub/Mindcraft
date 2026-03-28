"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { colors, fonts, space, radii } from "@/lib/theme";
import { content as c } from "@/content/site";
import BottomNav from "@/components/BottomNav";
import FloatingActions from "@/components/FloatingActions";

const body = fonts.bodyAlt;

/* ── Program background images ── */
const PROGRAM_BG_IMAGES: Record<string, string[]> = {
  parachute: [
    "/hero-parachute.jpg",
    "/shutterstock_2758752955.jpg",
    "/shutterstock_2758753407.jpg",
    "/shutterstock_2758753475.jpg",
    "/shutterstock_2758773487.jpg",
    "/shutterstock_2758773645.jpg",
    "/shutterstock_2758773677.jpg",
    "/shutterstock_2758773863.jpg",
    "/shutterstock_2758774471.jpg",
  ],
  jetstream: [
    "/jetstream-hero-bg.jpg",
    "/shutterstock_2758780005.jpg",
    "/shutterstock_2758780047.jpg",
    "/shutterstock_2758780709.jpg",
    "/shutterstock_2758781481.jpg",
    "/shutterstock_2758781721.jpg",
    "/shutterstock_2758781913.jpg",
    "/shutterstock_2758782247.jpg",
  ],
  basecamp: [
    "/basecamp-hero-bg.jpg",
    "/shutterstock_2758783389.jpg",
    "/shutterstock_2758783589.jpg",
    "/shutterstock_2758783845.jpg",
    "/shutterstock_2758783917.jpg",
    "/shutterstock_2758784169.jpg",
    "/shutterstock_2758784713.jpg",
    "/shutterstock_2758784965.jpg",
    "/shutterstock_2758785201.jpg",
    "/shutterstock_2758785621.jpg",
    "/shutterstock_2758785777.jpg",
    "/shutterstock_2758786195.jpg",
  ],
};

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
  showBgImage?: boolean;
  programSlug?: string;
}

export default function PageShell({
  children,
  maxWidth = 720,
  showBlobs = true,
  blobVariant = "default",
  showBgImage = false,
  programSlug,
}: PageShellProps) {
  const positions = blobPositions[blobVariant];

  // Pick a background image — rotates daily, stable within a session
  const [bgImage, setBgImage] = useState<string | null>(null);
  useEffect(() => {
    if (!showBgImage) return;
    const pool = PROGRAM_BG_IMAGES[programSlug || "parachute"] || PROGRAM_BG_IMAGES.parachute;
    const day = Math.floor(Date.now() / 86400000); // days since epoch
    const idx = day % pool.length;
    setBgImage(pool[idx]);
  }, [showBgImage, programSlug]);

  return (
    <div style={{ backgroundColor: colors.bgDeep, minHeight: "100vh", fontFamily: body, position: "relative", overflow: "hidden" }}>
      {/* Background image */}
      {showBgImage && bgImage && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {showBlobs && !showBgImage && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            style={{
              position: "absolute", ...positions.coral,
              width: 180, height: 180, borderRadius: "50%",
              background: colors.coral, pointerEvents: "none", filter: "blur(60px)",
              zIndex: 1,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.08, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute", ...positions.plum,
              width: 140, height: 140, borderRadius: "50%",
              background: colors.coral, pointerEvents: "none", filter: "blur(50px)",
              zIndex: 1,
            }}
          />
        </>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <div className="page-content-mobile page-shell-inner" style={{ maxWidth, margin: "0 auto", padding: `${space[7]}px ${space[5]}px 80px`, position: "relative" }}>
          {showBgImage ? (
            <div className="content-panel-inner" style={{
              backgroundColor: "rgba(51, 51, 57, 0.5)",
              borderRadius: radii.lg,
              padding: `${space[6]}px ${space[5]}px`,
              border: `1px solid rgba(255, 255, 255, 0.06)`,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>

      </div>

      <BottomNav />
      <FloatingActions />

      {/* Footer */}
      <footer style={{ padding: `${space[7]}px ${space[5]}px`, borderTop: showBgImage ? "none" : `1px solid ${colors.borderSubtle}`, position: "relative", zIndex: 1 }}>
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
          <div style={{ display: "flex", gap: space[5], fontSize: 13, color: colors.textPrimary, alignItems: "center" }}>
            <span>
              {c.footer.copyright} &middot; Made with{" "}
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
    </div>
  );
}
