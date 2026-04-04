"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, radii, space } from "@/lib/theme";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no preference saved
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    // Disable Google Analytics
    if (typeof window !== "undefined") {
      // @ts-expect-error - gtag is globally defined
      window["ga-disable-G-6HTGC2PZMW"] = true;
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            right: 20,
            maxWidth: 480,
            margin: "0 auto",
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: radii.lg,
            padding: `${space[4]}px ${space[5]}px`,
            zIndex: 99999,
            fontFamily: fonts.bodyAlt,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <p style={{
            fontSize: 14, color: colors.textPrimary,
            margin: `0 0 ${space[3]}px 0`, lineHeight: 1.6,
          }}>
            We use essential cookies for authentication and optional analytics cookies to improve the product.{" "}
            <a href="/privacy-policy#cookies" style={{ color: colors.coral, textDecoration: "none" }}>
              Learn more
            </a>
          </p>
          <div style={{ display: "flex", gap: space[2] }}>
            <button
              onClick={accept}
              style={{
                padding: `${space[2]}px ${space[4]}px`,
                fontSize: 13, fontWeight: 600,
                fontFamily: fonts.display,
                backgroundColor: colors.coral,
                color: colors.bgDeep,
                border: "none", borderRadius: radii.full,
                cursor: "pointer",
              }}
            >
              Accept all
            </button>
            <button
              onClick={decline}
              style={{
                padding: `${space[2]}px ${space[4]}px`,
                fontSize: 13, fontWeight: 600,
                fontFamily: fonts.display,
                backgroundColor: "transparent",
                color: colors.textMuted,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: radii.full,
                cursor: "pointer",
              }}
            >
              Essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
