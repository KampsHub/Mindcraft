"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

/**
 * Shared marketing-site header. Used on the landing page and public subpages
 * like /refer. Fixed position — pages should leave ~80px top padding.
 */
export default function MarketingHeader() {
  const display = fonts.display;
  const links = [
    { label: "Programs", href: "/#programs" },
    { label: "How it works", href: "/#how" },
    { label: "FAQ", href: "/#faq" },
    { label: "Refer & Gift", href: "/refer" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        background: "rgba(24,24,28,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Logo size={20} />
        </a>
        <div className="nav-desktop-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {links.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              whileHover={{ color: colors.coral }}
              style={{
                fontSize: 14, fontWeight: 500, color: "#ffffff",
                textDecoration: "none", fontFamily: display,
                transition: "color 0.2s",
              }}
            >
              {label}
            </motion.a>
          ))}
          <motion.a
            href="/login"
            whileHover={{ color: colors.coral }}
            style={{
              fontSize: 14, fontWeight: 500, color: "#ffffff",
              textDecoration: "none", fontFamily: display,
              transition: "color 0.2s",
            }}
          >
            Sign in
          </motion.a>
          <motion.a
            href="/#programs"
            whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              padding: "10px 24px", fontSize: 13, fontWeight: 600,
              color: "#ffffff", backgroundColor: colors.coral,
              textDecoration: "none", borderRadius: 100,
              fontFamily: display, letterSpacing: "0.01em",
            }}
          >
            Get started
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}
