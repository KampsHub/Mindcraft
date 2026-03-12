"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/exercise", label: "Exercise" },
  { href: "/plan", label: "Plan" },
  { href: "/weekly-review", label: "Review" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      backgroundColor: colors.white,
      borderBottom: `1px solid ${colors.gray100}`,
      fontFamily: fonts.body,
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
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}
        >
          <Logo size={32} />
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.black }}>
            Mindcraft
          </span>
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="nav-desktop">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              style={{
                padding: "6px 14px", fontSize: 14, fontWeight: 500,
                color: isActive(link.href) ? colors.primary : colors.gray600,
                backgroundColor: isActive(link.href) ? colors.primaryLight : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: colors.gray200, margin: "0 8px" }} />
          <button
            onClick={() => router.push("/privacy")}
            style={{
              padding: "6px 10px", fontSize: 13, color: colors.gray400,
              backgroundColor: "transparent", border: "none", cursor: "pointer",
            }}
          >
            Settings
          </button>
          <button
            onClick={handleSignOut}
            style={{
              padding: "6px 10px", fontSize: 13, color: colors.gray400,
              backgroundColor: "transparent", border: "none", cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="nav-mobile-toggle"
          style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", padding: 4, fontSize: 22, color: colors.black,
          }}
        >
          {menuOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          padding: "8px 24px 16px",
          borderTop: `1px solid ${colors.gray100}`,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => { router.push(link.href); setMenuOpen(false); }}
              style={{
                padding: "10px 12px", fontSize: 15, fontWeight: 500,
                color: isActive(link.href) ? colors.primary : colors.gray600,
                backgroundColor: isActive(link.href) ? colors.primaryLight : "transparent",
                border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ height: 1, backgroundColor: colors.gray100, margin: "8px 0" }} />
          <button
            onClick={() => { router.push("/privacy"); setMenuOpen(false); }}
            style={{ padding: "10px 12px", fontSize: 14, color: colors.gray400, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            Settings
          </button>
          <button
            onClick={handleSignOut}
            style={{ padding: "10px 12px", fontSize: 14, color: colors.gray400, backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            Sign out
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
  );
}
