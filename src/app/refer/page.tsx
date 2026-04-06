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
  const [gifts, setGifts] = useState<{ gift_code: string; program: string; status: string; recipient_email?: string; purchased_at?: string }[]>([]);
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
            May the craft be with you(r friends).
          </h1>
          <p style={{
            fontFamily: body, fontSize: 16, color: colors.textMuted,
            textAlign: "center", marginBottom: 48, maxWidth: 500, marginLeft: "auto", marginRight: "auto",
          }}>
            Know someone in the thick of a career transition? Get them the support they may need.
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
                Tell your friends about us
              </h2>
              <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                They receive 20% off the regular program prices. You receive a $10 Amazon Gift Card once they complete their first week as a Thank You.
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
                  Sign in to get your personalized code
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
                Gift our programs
              </h2>
              <p style={{ fontFamily: body, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                You want to provide someone with extra support? Pay for a program and receive a unique code you can send to them. They use it at checkout to enroll for free.
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
                      <span style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: colors.textPrimary, display: "block" }}>
                        {prog.name}
                      </span>
                      <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>
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

        {/* ── How it works — 3 steps ── */}
        <FadeIn preset="slide-up" delay={0.2} triggerOnMount>
          <div style={{ marginTop: 64, textAlign: "center" }}>
            <h2 style={{ fontFamily: display, fontSize: 20, fontWeight: 700, marginBottom: 32, color: colors.textPrimary }}>
              How it works
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {[
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  ),
                  title: "Share your code",
                  desc: "Sign in and generate your personalized referral code. Share it however you like.",
                },
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  ),
                  title: "They sign up",
                  desc: "Your friend enters the code at checkout and gets 20% off the regular price.",
                },
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                      <path d="M12 8V6a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" />
                    </svg>
                  ),
                  title: "You get rewarded",
                  desc: "After they complete their first week, you receive a $10 Amazon Gift Card.",
                },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    backgroundColor: `${colors.coral}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontFamily: display, fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, lineHeight: 1.5, margin: 0, maxWidth: 220 }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── Sharing History ── */}
        {user && (referrals.length > 0 || gifts.length > 0) && (
          <FadeIn preset="fade" delay={0.25} triggerOnMount>
            <div style={{
              marginTop: 56,
              backgroundColor: colors.bgSurface, borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`, padding: 28,
            }}>
              <h2 style={{ fontFamily: display, fontSize: 16, fontWeight: 700, marginBottom: 16, color: colors.textPrimary }}>
                Your sharing history
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
                    <th style={{ padding: "8px 0", textAlign: "left", color: colors.textMuted, fontWeight: 500 }}>Recipient</th>
                    <th style={{ padding: "8px 0", textAlign: "left", color: colors.textMuted, fontWeight: 500 }}>Type</th>
                    <th style={{ padding: "8px 0", textAlign: "left", color: colors.textMuted, fontWeight: 500 }}>Status</th>
                    <th style={{ padding: "8px 0", textAlign: "right", color: colors.textMuted, fontWeight: 500 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r, i) => (
                    <tr key={`r-${i}`} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
                      <td style={{ padding: "10px 0", color: colors.textSecondary }}>{r.referred_email || "Pending"}</td>
                      <td style={{ padding: "10px 0" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: `${colors.coral}15`, color: colors.coral }}>Referral</span>
                      </td>
                      <td style={{ padding: "10px 0" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          backgroundColor: r.status === "rewarded" ? "#34d39920" : r.status === "redeemed" ? "#60a5fa20" : `rgba(255,255,255,0.06)`,
                          color: r.status === "rewarded" ? "#34d399" : r.status === "redeemed" ? "#60a5fa" : colors.textMuted,
                        }}>{r.status}</span>
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right", color: colors.textMuted }}>{r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                  {gifts.map((g, i) => (
                    <tr key={`g-${i}`} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
                      <td style={{ padding: "10px 0", color: colors.textSecondary }}>{g.recipient_email || `Code: ${g.gift_code}`}</td>
                      <td style={{ padding: "10px 0" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#8b5cf620", color: "#8b5cf6" }}>Gift — {g.program}</span>
                      </td>
                      <td style={{ padding: "10px 0" }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          backgroundColor: g.status === "redeemed" ? "#34d39920" : `rgba(255,255,255,0.06)`,
                          color: g.status === "redeemed" ? "#34d399" : colors.textMuted,
                        }}>{g.status}</span>
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right", color: colors.textMuted }}>{g.purchased_at ? new Date(g.purchased_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}

        {/* ── FAQ ── */}
        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontFamily: display, fontSize: 18, fontWeight: 700, marginBottom: 20, color: colors.textPrimary }}>
              Questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { q: "Who can refer?", a: "Anyone with a Mindcraft account. You don\u2019t need to have completed a program." },
                { q: "What discount does the referred person get?", a: "20% off any standard-priced program (Parachute, Jetstream, or Basecamp at $49). Sliding scale prices are not eligible for the referral discount." },
                { q: "When do I get my gift card?", a: "7 days after the person you referred completes their purchase. This is our refund window \u2014 once it closes, your $10 Amazon Gift Card is sent automatically to your email." },
                { q: "Can I refer multiple people?", a: "Yes, unlimited. Each person who signs up with your code earns you a $10 gift card." },
                { q: "How does gifting work?", a: "You pay the full program price ($49). We generate a unique single-use code and email it to you. Send it to whoever you\u2019d like \u2014 they enter it at checkout and get the program for free." },
                { q: "Can the gift code be used on any program?", a: "The gift code gives 100% off any program at checkout. It\u2019s single-use \u2014 one code, one person." },
                { q: "What if my referral requests a refund?", a: "If the referred person refunds within 7 days, the gift card is automatically cancelled. You\u2019re never charged for a referral that didn\u2019t stick." },
              ].map((faq, i) => (
                <details key={i} style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  <summary style={{
                    padding: "18px 0", cursor: "pointer",
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    color: colors.textSecondary, listStyle: "none",
                  }}>
                    {faq.q}
                  </summary>
                  <p style={{
                    fontFamily: body, fontSize: 13, color: colors.textMuted,
                    lineHeight: 1.6, margin: 0, paddingBottom: 18,
                  }}>
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
