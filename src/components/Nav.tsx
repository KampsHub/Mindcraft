"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import ContactModal from "@/components/ContactModal";

const navLinks = [
  { href: "/dashboard", label: "Today" },
  { href: "/goals", label: "Progress" },
  { href: "/weekly-review", label: "Insights" },
];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${colors.coral}, ${colors.plum})`,
        transformOrigin: "0%", scaleX, zIndex: 200,
      }}
    />
  );
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
    <ScrollProgress />
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(24,24,28,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${colors.borderSubtle}`,
      fontFamily: fonts.display,
    }}>
      <div style={{
        maxWidth: 960, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        {/* Logo */}
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 0,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <Logo size={14} />
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="nav-desktop">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                padding: "6px 14px", fontSize: 14, fontWeight: 500,
                color: isActive(link.href) ? colors.coral : colors.textSecondary,
                backgroundColor: isActive(link.href) ? colors.coralWash : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: colors.borderSubtle, margin: "0 8px" }} />
          <button
            onClick={() => router.push("/my-account")}
            style={{
              padding: "6px 10px", fontSize: 13, color: colors.textMuted,
              backgroundColor: "transparent", border: "none", cursor: "pointer",
            }}
          >
            My Account
          </button>
          <button
            onClick={() => setContactOpen(true)}
            style={{
              padding: "6px 14px", fontSize: 13, fontWeight: 600,
              color: colors.coral, backgroundColor: "transparent",
              border: "none", cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            Contact
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-toggle"
          style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", padding: 4, fontSize: 22, color: colors.textPrimary,
          }}
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          padding: "8px 24px 16px",
          backgroundColor: colors.bgRecessed,
          borderTop: `1px solid ${colors.borderSubtle}`,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => { router.push(link.href); setMenuOpen(false); }}
              style={{
                padding: "10px 12px", fontSize: 15, fontWeight: 500,
                color: isActive(link.href) ? colors.coral : colors.textSecondary,
                backgroundColor: isActive(link.href) ? colors.coralWash : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ height: 1, backgroundColor: colors.borderSubtle, margin: "8px 0" }} />
          <button
            onClick={() => { router.push("/my-account"); setMenuOpen(false); }}
            style={{ padding: "10px 12px", fontSize: 14, color: colors.textMuted, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            My Account
          </button>
          <button
            onClick={() => { setContactOpen(true); setMenuOpen(false); }}
            style={{ padding: "10px 12px", fontSize: 14, fontWeight: 600, color: colors.coral, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            Contact
          </button>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
    <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />

    {/* Floating "Capture a thought" button — hidden on /day pages (FreeFlowCapture handles it there) */}
    {!pathname.startsWith("/day/") && (
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 1000 }}>
        {/* Warm glow pulse behind the button */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.coral}30 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 22 }}
          whileHover={{ scale: 1.1, boxShadow: `0 8px 28px ${colors.coral}50` }}
          whileTap={{ scale: 0.92 }}
          onClick={() => router.push("/mindful-journal")}
          title="Capture a thought"
          style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, ${colors.coralLight}, ${colors.coral})`,
            color: colors.bgDeep,
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            fontWeight: 700,
            boxShadow: `0 4px 20px ${colors.coral}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.display,
          }}
        >
          ✎
        </motion.button>
      </div>
    )}
    </>
  );
}
