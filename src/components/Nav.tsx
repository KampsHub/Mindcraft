"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

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
          {/* Reset Journal icon */}
          <button
            onClick={() => router.push("/mindful-journal")}
            title="Reset Journal"
            style={{
              padding: "4px 8px",
              background: isActive("/mindful-journal") ? colors.coralWash : "transparent",
              border: "none", borderRadius: 6, cursor: "pointer",
              display: "flex", alignItems: "center",
              transition: "all 0.15s",
              opacity: isActive("/mindful-journal") ? 1 : 0.6,
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={isActive("/mindful-journal") ? colors.coral : colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
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
          <button
            onClick={() => { router.push("/mindful-journal"); setMenuOpen(false); }}
            style={{
              padding: "10px 12px", fontSize: 15, fontWeight: 500,
              color: isActive("/mindful-journal") ? colors.coral : colors.textSecondary,
              backgroundColor: isActive("/mindful-journal") ? colors.coralWash : "transparent",
              border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={isActive("/mindful-journal") ? colors.coral : colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Reset Journal
          </button>
          <div style={{ height: 1, backgroundColor: colors.borderSubtle, margin: "8px 0" }} />
          <button
            onClick={() => { router.push("/my-account"); setMenuOpen(false); }}
            style={{ padding: "10px 12px", fontSize: 14, color: colors.textMuted, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            My Account
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
    </>
  );
}
