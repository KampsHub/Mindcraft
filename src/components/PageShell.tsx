"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";
import { colors, fonts } from "@/lib/theme";
import { content as c } from "@/content/site";

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
      <AnimatePresence>
        {showBgImage && bgImage && (
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
              zIndex: 0,
              filter: "brightness(1.15)",
            }}
          >
            {/* Dark gradient overlay for readability */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(
                to bottom,
                rgba(24, 24, 28, 0.35) 0%,
                rgba(24, 24, 28, 0.55) 30%,
                rgba(24, 24, 28, 0.8) 60%,
                ${colors.bgDeep} 85%
              )`,
            }} />
          </motion.div>
        )}
      </AnimatePresence>

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
              background: colors.plum, pointerEvents: "none", filter: "blur(50px)",
              zIndex: 1,
            }}
          />
        </>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <div style={{ maxWidth, margin: "0 auto", padding: "40px 24px 80px", position: "relative" }}>
          {children}
        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", borderTop: `1px solid ${colors.borderSubtle}`, position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#ffffff", alignItems: "center" }}>
            <span>
              {c.footer.copyright} &middot; Made with{" "}
              <span style={{ color: colors.coral, fontSize: 18 }}>&#9829;</span> by{" "}
              <a
                href="https://allmindsondeck.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                All Minds On Deck
              </a>
            </span>
            <a href="/privacy" style={{ color: "#ffffff", textDecoration: "none" }}>
              Privacy
            </a>
            <a href="/contact" style={{ color: "#ffffff", textDecoration: "none" }}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
