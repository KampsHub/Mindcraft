"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageShell from "@/components/PageShell";
import FadeIn from "@/components/FadeIn";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";
import { colors, fonts, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

const PROGRAMS = [
  {
    slug: "parachute",
    label: "Layoff recovery",
    blurb: "A 30-day program for someone rebuilding footing after a layoff \u2014 clarity, confidence, and a plan for what comes next.",
  },
  {
    slug: "jetstream",
    label: "PIP navigation",
    blurb: "For someone mid-PIP who needs to steady, read the room, and decide whether to fight for the role or land somewhere new.",
  },
  {
    slug: "basecamp",
    label: "New role confidence",
    blurb: "For someone starting a new role and carrying doubt with them \u2014 30 days to rebuild trust with themselves at work.",
  },
];

export default function ReferPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<{ referred_email: string; status: string; redeemed_at: string }[]>([]);
  const [gifts, setGifts] = useState<{ gift_code: string; program: string; status: string; recipient_email?: string; purchased_at?: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [giftLoading, setGiftLoading] = useState<string | null>(null);
  const [giftPrice, setGiftPrice] = useState<string>("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/price")
      .then(r => r.json())
      .then(d => { if (d?.formatted) setGiftPrice(d.formatted); })
      .catch(() => {});
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

  function handleGiftCheckout(program: typeof PROGRAMS[0]) {
    setGiftLoading(program.slug);
    // Navigate to the program page with gift pre-selected. The program page's
    // pricing section reads ?gift=1 and pre-checks its "This is a gift" checkbox.
    window.location.href = `/${program.slug}?gift=1#pricing`;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      <MarketingHeader />

      {/* Top (hero) */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "128px 24px 40px" }}>
        <FadeIn preset="slide-up" triggerOnMount>
          <h1 style={{
            fontFamily: display,
            fontSize: "clamp(20px, 3.4vw, 40px)",
            fontWeight: 800,
            lineHeight: 1.15,
            color: colors.textPrimary,
            textAlign: "center",
            marginBottom: 16,
            letterSpacing: "-0.03em",
            whiteSpace: "nowrap",
          }}>
            May the craft be with you(r friends).
          </h1>
          <p style={{
            fontFamily: body, fontSize: 17, lineHeight: 1.55, color: colors.textSecondary,
            textAlign: "center", marginBottom: 0, maxWidth: 640, marginLeft: "auto", marginRight: "auto",
          }}>
            Know someone in the thick of a career transition?<br />
            Get them the support they may need.
          </p>
        </FadeIn>
      </div>

      {/* ── Full-width hiker section containing the two cards ── */}
      <section style={{
        position: "relative",
        width: "100%",
        padding: "72px 24px",
        backgroundImage: "linear-gradient(180deg, rgba(24,24,28,0.55) 0%, rgba(24,24,28,0.78) 100%), url('/hiker-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 15%",
        backgroundAttachment: "fixed",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── LEFT: Referral ── */}
          <FadeIn preset="slide-up" delay={0.1} triggerOnMount>
            <div style={{
              backgroundColor: "rgba(51, 51, 57, 0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 16,
              border: `1px solid rgba(255,255,255,0.08)`, padding: 32,
              height: "100%", display: "flex", flexDirection: "column",
            }}>
              {/* Visual header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: `linear-gradient(135deg, ${colors.coral}30, ${colors.coral}10)`,
                  border: `1px solid ${colors.coral}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: display, fontSize: 22, fontWeight: 800, color: colors.coral }}>20%</span>
                </div>
                <div>
                  <h2 style={{ fontFamily: display, fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" }}>
                    Tell your friends about us
                  </h2>
                  <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
                    They save. You get thanked.
                  </p>
                </div>
              </div>

              {/* Value props */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2} strokeLinecap="round"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  <span style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary }}>They get <strong style={{ color: colors.textPrimary }}>20% off</strong> regular program prices</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={2} strokeLinecap="round"><path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                  <span style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary }}>You get a <strong style={{ color: colors.textPrimary }}>$10 Amazon Gift Card</strong> after their first week</span>
                </div>
              </div>

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

                </div>
              )}

              {/* How referrals work — inline steps */}
              <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <p style={{ fontFamily: display, fontSize: 10, fontWeight: 700, color: colors.coral, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, textAlign: "center" }}>
                  How referrals work
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { num: "1", title: "Share your code", desc: "Generate your personalized code and send it to anyone." },
                    { num: "2", title: "They get 20% off", desc: "Your friend enters the code at checkout." },
                    { num: "3", title: "You get $10", desc: "Amazon Gift Card sent to you after their first week." },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{
                        fontFamily: display, fontSize: 12, fontWeight: 700,
                        width: 24, height: 24, borderRadius: "50%",
                        backgroundColor: `${colors.coral}15`, color: colors.coral,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>{step.num}</span>
                      <div>
                        <p style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: "0 0 2px 0" }}>{step.title}</p>
                        <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ── RIGHT: Gift ── */}
          <FadeIn preset="slide-up" delay={0.15} triggerOnMount>
            <div style={{
              backgroundColor: "rgba(51, 51, 57, 0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: 16,
              border: `1px solid rgba(255,255,255,0.08)`, padding: 32,
              height: "100%", display: "flex", flexDirection: "column",
            }}>
              {/* Visual header */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "linear-gradient(135deg, #7B9AAD30, #7B9AAD10)",
                  border: "1px solid #7B9AAD30",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#7B9AAD" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="2" /><path d="M12 8V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                    <path d="M12 8V6a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontFamily: display, fontSize: 18, fontWeight: 700, margin: "0 0 4px 0" }}>
                    Gift our programs
                  </h2>
                  <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
                    Give someone 30 days of support.
                  </p>
                </div>
              </div>

              <p style={{ fontFamily: body, fontSize: 13, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>
                Pay for a program. We send you a unique code. Share it however feels right — they enroll for free.
              </p>
              <p style={{
                fontFamily: body, fontSize: 12, color: colors.coralLight,
                lineHeight: 1.5, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.coralLight} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
                Gift option is auto-activated at checkout — no extra steps.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PROGRAMS.map((prog) => (
                  <motion.button
                    key={prog.slug}
                    whileHover={{ scale: 1.015, backgroundColor: "rgba(196, 148, 58, 0.08)" }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    onClick={() => handleGiftCheckout(prog)}
                    disabled={giftLoading === prog.slug}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16,
                      padding: "16px 18px", borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.03)",
                      border: `1px solid ${colors.borderDefault}`,
                      cursor: "pointer", textAlign: "left",
                      opacity: giftLoading === prog.slug ? 0.6 : 1,
                      color: "inherit",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: display, fontSize: 15, fontWeight: 700, color: colors.textPrimary, display: "block", marginBottom: 4 }}>
                        {prog.label}
                      </span>
                      <span style={{ fontFamily: body, fontSize: 12, lineHeight: 1.5, color: colors.textMuted, display: "block" }}>
                        {prog.blurb}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: display, fontSize: 14, fontWeight: 700,
                      color: colors.coral, flexShrink: 0, whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      {giftLoading === prog.slug ? "..." : (
                        <>
                          {giftPrice || ""}
                          <span style={{ fontSize: 13, opacity: 0.85 }}>Gift →</span>
                        </>
                      )}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* How gifting works — inline steps */}
              <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <p style={{ fontFamily: display, fontSize: 10, fontWeight: 700, color: "#7B9AAD", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, textAlign: "center" }}>
                  How gifting works
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { num: "1", title: "Pick a program", desc: "Choose the program that works for their situation." },
                    { num: "2", title: "Complete checkout", desc: "We generate a unique single-use code." },
                    { num: "3", title: "Send the code", desc: "We email it to you. Forward it to whoever you\u2019d like \u2014 they enroll for free." },
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <span style={{
                        fontFamily: display, fontSize: 12, fontWeight: 700,
                        width: 24, height: 24, borderRadius: "50%",
                        backgroundColor: "#7B9AAD15", color: "#7B9AAD",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>{step.num}</span>
                      <div>
                        <p style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color: colors.textPrimary, margin: "0 0 2px 0" }}>{step.title}</p>
                        <p style={{ fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0, lineHeight: 1.4 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Bottom (history, tips, FAQ) */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>

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
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, backgroundColor: "#7B9AAD20", color: "#7B9AAD" }}>Gift — {g.program}</span>
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

        {/* ── Tips for sharing ── */}
        <FadeIn preset="fade" delay={0.27} triggerOnMount>
          <div style={{
            marginTop: 56,
            backgroundColor: colors.bgSurface,
            borderRadius: 16,
            border: `1px solid ${colors.borderDefault}`,
            padding: "36px 32px",
          }}>
            <h2 style={{
              fontFamily: display, fontSize: 20, fontWeight: 700,
              color: colors.textPrimary, textAlign: "center",
              marginBottom: 32, letterSpacing: "-0.01em",
            }}>
              3 tips for sharing with someone in a career transition
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 28 }}>
              {[
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  ),
                  title: "Your code is yours alone",
                  body: "Your friend has to enter your personalized code at checkout for you to earn your gift card. Generate it once, share it often.",
                },
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                  title: "Lead with care, not advice",
                  body: "You don\u2019t have to pitch anything. Try: \u201CI came across this and thought of you.\u201D The program will speak for itself.",
                },
                {
                  icon: (
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  ),
                  title: "Share where they already are",
                  body: "Drop your code in a DM, a group chat, or a LinkedIn post. Anyone rebuilding after a layoff or navigating a hard role is welcome.",
                },
              ].map((tip, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ textAlign: "center", cursor: "default" }}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: `linear-gradient(135deg, ${colors.coral}25, ${colors.coral}08)`,
                      border: `1px solid ${colors.coral}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 16px",
                  }}>
                    {tip.icon}
                  </motion.div>
                  <h3 style={{
                    fontFamily: display, fontSize: 14, fontWeight: 700,
                    color: colors.textPrimary, margin: "0 0 8px 0",
                  }}>
                    {tip.title}
                  </h3>
                  <p style={{
                    fontFamily: body, fontSize: 13, color: colors.textMuted,
                    lineHeight: 1.55, margin: 0,
                  }}>
                    {tip.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── FAQ ── */}
        <FadeIn preset="fade" delay={0.3} triggerOnMount>
          <div style={{
            marginTop: 56,
            backgroundColor: colors.bgLight,
            borderRadius: 16,
            padding: "40px 36px",
            color: "#18181C",
          }}>
            <h2 style={{ fontFamily: display, fontSize: 22, fontWeight: 700, marginBottom: 28, color: "#18181C", letterSpacing: "-0.01em" }}>
              Questions
            </h2>

            {([
              {
                label: "General",
                accent: "#18181C",
                items: [
                  { q: "How do I bring this up without overstepping?", a: "You know them. You noticed something. That\u2019s enough. You don\u2019t have to diagnose what they\u2019re going through \u2014 you can just say: \u201CI came across this and thought of you.\u201D The program meets them where they are. They decide what to do with it." },
                  { q: "Who can refer or gift?", a: "Anyone with a Mindcraft account. You don\u2019t need to have completed a program yourself \u2014 you just need to believe it might help someone you care about." },
                ],
              },
              {
                label: "Referrals",
                accent: colors.coral,
                items: [
                  { q: "What does the person I refer get?", a: "20% off any standard-priced program ($49). It\u2019s a real discount, not a trial \u2014 they get the full 30-day experience. Sliding scale prices are already reduced and aren\u2019t eligible for the referral discount." },
                  { q: "When do I get my gift card?", a: "7 days after they purchase. We wait because that\u2019s our refund window \u2014 once it closes, your $10 Amazon Gift Card is sent to your email automatically." },
                  { q: "Can I refer more than one person?", a: "Yes, as many as you\u2019d like. Each person who signs up earns you a gift card. No cap." },
                  { q: "What if my referral requests a refund?", a: "If they refund within 7 days, your gift card is automatically cancelled. You\u2019re never out anything for a referral that didn\u2019t stick." },
                ],
              },
              {
                label: "Gifting",
                accent: "#7B9AAD",
                items: [
                  { q: "What if I want to gift it but I\u2019m not sure which program fits?", a: "That\u2019s okay. The gift code works at checkout for any program. You pick one when you pay, but your friend can use the code on whichever program feels right for them." },
                  { q: "Will they know I bought it?", a: "We email the gift code to you \u2014 not to them. You decide how and when to share it. If you want to send it with a personal note, you can. If you want to drop it in their inbox without a word, that works too." },
                  { q: "What if they don\u2019t use it?", a: "The code doesn\u2019t expire. It\u2019ll be there when they\u2019re ready \u2014 even if that\u2019s not right now." },
                  { q: "What if they really don\u2019t want it?", a: "If your friend doesn\u2019t want the gift, we\u2019ll refund you in full. Just email us at crew@allmindsondeck.com \u2014 no questions asked. The thought still mattered." },
                ],
              },
            ]).map((section) => (
              <div key={section.label} style={{ marginBottom: 32 }}>
                <p style={{
                  fontFamily: display, fontSize: 10, fontWeight: 700,
                  color: section.accent, textTransform: "uppercase",
                  letterSpacing: "0.12em", marginBottom: 8,
                }}>
                  {section.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {section.items.map((faq, i) => (
                    <details key={i} style={{ borderBottom: "1px solid rgba(24,24,28,0.12)" }}>
                      <summary style={{
                        padding: "18px 0", cursor: "pointer",
                        fontFamily: display, fontSize: 15, fontWeight: 600,
                        color: "#18181C", listStyle: "none",
                      }}>
                        {faq.q}
                      </summary>
                      <p style={{
                        fontFamily: body, fontSize: 14, color: "rgba(24,24,28,0.72)",
                        lineHeight: 1.6, margin: 0, paddingBottom: 18,
                      }}>
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <Footer />
    </div>
  );
}
