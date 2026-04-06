"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import Logo from "@/components/Logo";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const PROGRAMS = [
  { slug: "parachute", name: "Parachute", desc: "Layoff recovery", href: "/api/checkout/parachute" },
  { slug: "jetstream", name: "Jetstream", desc: "PIP navigation", href: "/api/checkout/jetstream" },
  { slug: "basecamp", name: "Basecamp", desc: "New role confidence", href: "/api/checkout/basecamp" },
];

export default function ReferPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<{ referred_email: string; status: string; redeemed_at: string }[]>([]);
  const [gifts, setGifts] = useState<{ gift_code: string; program: string; status: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [giftLoading, setGiftLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUser({ id: user.id, email: user.email });
        // Load existing referral data
        fetch("/api/referral/status").then(r => r.json()).then(data => {
          if (data.referral) setReferralCode(data.referral.code);
          if (data.redemptions) setReferrals(data.redemptions);
          if (data.gifts) setGifts(data.gifts);
        }).catch(() => {});
      }
    });
  }, [supabase.auth]);

  async function generateCode() {
    setGenerating(true);
    try {
      const res = await fetch("/api/referral/generate", { method: "POST" });
      const data = await res.json();
      if (data.code) setReferralCode(data.code);
    } catch {}
    setGenerating(false);
  }

  function copyCode() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGiftCheckout(program: typeof PROGRAMS[0]) {
    setGiftLoading(program.slug);
    try {
      const res = await fetch(program.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "standard", is_gift: true }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {}
    setGiftLoading(null);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Logo */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <a href="/" style={{ textDecoration: "none" }}><Logo size={28} /></a>
        </div>

        <FadeIn preset="slide-up" triggerOnMount>
          <h1 style={{
            fontFamily: display, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700,
            color: colors.textPrimary, textAlign: "center", marginBottom: 12,
            letterSpacing: "-0.02em",
          }}>
            Share Mindcraft
          </h1>
          <p style={{
            fontFamily: body, fontSize: 16, color: colors.textMuted,
            textAlign: "center", marginBottom: 48, maxWidth: 500, marginLeft: "auto", marginRight: "auto",
          }}>
            Know someone navigating a career crisis? Refer them or gift them a program.
          </p>
        </FadeIn>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── LEFT: Referral ── */}
          <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
            <div style={{
              backgroundColor: colors.bgSurface, borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`, padding: 32,
              height: "100%", display: "flex", flexDirection: "column",
            }}>
              <h2 style={{ fontFamily: display, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Refer a friend
              </h2>
              <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                They get 20% off any standard program. You get a $10 Amazon gift card once they complete their first week.
              </p>

              {!user ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/login?redirect=/refer")}
                  style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    padding: "12px 24px", borderRadius: radii.full,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: "pointer",
                  }}
                >
                  Sign in to get your code
                </motion.button>
              ) : !referralCode ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={generateCode}
                  disabled={generating}
                  style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    padding: "12px 24px", borderRadius: radii.full,
                    backgroundColor: colors.coral, color: colors.bgDeep,
                    border: "none", cursor: "pointer",
                    opacity: generating ? 0.6 : 1,
                  }}
                >
                  {generating ? "Generating..." : "Generate my referral code"}
                </motion.button>
              ) : (
                <div>
                  {/* Code display */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                    padding: "14px 18px", backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 10, border: `1px solid ${colors.borderDefault}`,
                  }}>
                    <span style={{
                      fontFamily: display, fontSize: 20, fontWeight: 700,
                      color: colors.coral, letterSpacing: "0.06em", flex: 1,
                    }}>
                      {referralCode}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={copyCode}
                      style={{
                        fontFamily: display, fontSize: 12, fontWeight: 600,
                        padding: "6px 14px", borderRadius: radii.full,
                        backgroundColor: copied ? "#34d399" : colors.bgElevated,
                        color: copied ? colors.bgDeep : colors.textPrimary,
                        border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </motion.button>
                  </div>

                  <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>
                    Share this code with anyone. They enter it at checkout for 20% off standard prices.
                  </p>

                  {/* Referral stats */}
                  {referrals.length > 0 && (
                    <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: 12 }}>
                      <p style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        Your referrals
                      </p>
                      {referrals.map((r, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 0", fontSize: 12, fontFamily: body,
                        }}>
                          <span style={{ color: colors.textSecondary }}>{r.referred_email}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                            backgroundColor: r.status === "rewarded" ? "#34d39920" : `${colors.coral}15`,
                            color: r.status === "rewarded" ? "#34d399" : colors.coral,
                          }}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {/* ── RIGHT: Gift ── */}
          <FadeIn preset="slide-up" delay={0.15} triggerOnMount>
            <div style={{
              backgroundColor: colors.bgSurface, borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`, padding: 32,
              height: "100%", display: "flex", flexDirection: "column",
            }}>
              <h2 style={{ fontFamily: display, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Gift a program
              </h2>
              <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                Pay for a program and receive a unique code to send to whoever you&rsquo;d like. They use it at checkout to enroll for free.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PROGRAMS.map((prog) => (
                  <motion.button
                    key={prog.slug}
                    whileHover={{ borderColor: `${colors.coral}40` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGiftCheckout(prog)}
                    disabled={giftLoading === prog.slug}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "14px 18px", borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${colors.borderDefault}`,
                      cursor: "pointer", textAlign: "left",
                      opacity: giftLoading === prog.slug ? 0.6 : 1,
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
                        {prog.name}
                      </span>
                      <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, marginLeft: 8 }}>
                        {prog.desc}
                      </span>
                    </div>
                    <span style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.coral }}>
                      {giftLoading === prog.slug ? "..." : "$49"}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Gift history */}
              {gifts.length > 0 && (
                <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: 12, marginTop: 16 }}>
                  <p style={{ fontFamily: display, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Your gifts
                  </p>
                  {gifts.map((g, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "6px 0", fontSize: 12, fontFamily: body,
                    }}>
                      <span style={{ color: colors.textSecondary }}>{g.gift_code} — {g.program}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        backgroundColor: g.status === "redeemed" ? "#34d39920" : `${colors.coral}15`,
                        color: g.status === "redeemed" ? "#34d399" : colors.coral,
                      }}>
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
