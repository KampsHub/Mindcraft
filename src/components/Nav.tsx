"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import ContactModal from "@/components/ContactModal";

const navLinks = [
  { href: "/dashboard", label: "Today" },
  { href: "/goals", label: "Plan & Progress" },
  { href: "/weekly-review", label: "Insights" },
  { href: "/search", label: "Search", icon: true },
];

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${colors.coral}, ${colors.coral})`,
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

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.querySelector('.nav-mobile-menu');
      const toggle = document.querySelector('.nav-mobile-toggle');
      if (menu && !menu.contains(e.target as Node) && toggle && !toggle.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpen]);

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
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 0,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <Logo size={14} />
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="nav-desktop desktop-nav-links">
          {navLinks.map((link: { href: string; label: string; icon?: boolean }) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              aria-label={link.label}
              style={{
                padding: link.icon ? "6px 8px" : "6px 14px", fontSize: 14, fontWeight: 500,
                color: isActive(link.href) ? colors.coral : colors.textPrimary,
                backgroundColor: isActive(link.href) ? colors.coralWash : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer",
                transition: "all 0.15s",
                display: "flex", alignItems: "center",
              }}
            >
              {link.icon ? (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              ) : link.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: colors.borderSubtle, margin: "0 8px" }} />
          <button
            onClick={() => router.push("/my-account")}
            style={{
              padding: "6px 10px", fontSize: 13, color: colors.textPrimary,
              backgroundColor: "transparent", border: "none", cursor: "pointer",
            }}
          >
            My Account
          </button>
          {/* Contact moved to FloatingActions (bottom-right) */}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-toggle"
          aria-label="Menu"
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
                color: isActive(link.href) ? colors.coral : colors.textPrimary,
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
            style={{ padding: "10px 12px", fontSize: 14, color: colors.textPrimary, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            My Account
          </button>
          {/* Contact moved to FloatingActions */}
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

    {/* Floating buttons moved to FloatingActions component in PageShell */}
    </>
  );
}
