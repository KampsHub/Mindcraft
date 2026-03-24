"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { createClient } from "@/lib/supabase";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";

const display = fonts.display;
const body = fonts.bodyAlt;

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease: "easeOut" } as const,
});

export default function ParachuteWelcomePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }} />
    }>
      <ParachuteWelcome />
    </Suspense>
  );
}

function ParachuteWelcome() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState<"new" | "returning">("new");

  /* ── Stripe verification state ── */
  const [verified, setVerified] = useState<null | boolean>(null);
  const [tier, setTier] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ── Verify Stripe session on mount ── */
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setVerified(false);
      return;
    }

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setVerified(data.paid === true);
        setTier(data.tier || "standard");
        if (data.paid) {
          const tierLabel = (data.tier || "standard") === "pay_what_you_can" ? "pay_what_you_can" : (data.tier || "standard") === "pay_it_forward" ? "pay_it_forward" : "standard";
          trackEvent(`layoff_${tierLabel}_purchase`, { tier: data.tier || "standard", amount: data.amountPaid });
        }
      })
      .catch(() => setVerified(false));
  }, [searchParams]);

  async function createEnrollmentIfNeeded(userId: string, userEmail: string) {
    // Ensure client row exists (needed as FK for program_enrollments)
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingClient) {
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          id: userId,
          email: userEmail,
          name: userEmail.split("@")[0],
          subscription_status: "active",
        });
      if (clientError) {
        console.error("Failed to create client row:", clientError);
        // Try via API as fallback
        await fetch("/api/create-enrollment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ program: "parachute" }),
        });
        return;
      }
    }

    // Look up the program ID for parachute
    const { data: program } = await supabase
      .from("programs")
      .select("id")
      .eq("slug", "parachute")
      .single();

    if (!program) { console.error("Program 'parachute' not found"); return; }

    // Check if enrollment already exists
    const { data: existing } = await supabase
      .from("program_enrollments")
      .select("id")
      .eq("client_id", userId)
      .eq("program_id", program.id)
      .maybeSingle();

    if (existing) return; // Already enrolled

    // Create enrollment in pre_start status so it shows on dashboard immediately
    const { error: enrollError } = await supabase
      .from("program_enrollments")
      .insert({
        client_id: userId,
        program_id: program.id,
        status: "pre_start",
        current_day: 1,
        started_at: new Date().toISOString(),
      });

    if (enrollError) {
      console.error("Failed to create enrollment:", enrollError);
      // Try via API as fallback
      await fetch("/api/create-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: "parachute" }),
      });
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { accepted_terms_at: new Date().toISOString() },
      },
    });

    if (error) {
      // If user already exists, try signing them in directly
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
        const { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError && signInData.user) {
          await createEnrollmentIfNeeded(signInData.user.id, signInData.user.email || email);
          router.push("/intake?program=parachute");
          return;
        }
        setError("An account with this email already exists. Switch to the \"I have an account\" tab to sign in.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // If email confirmation is off, user is auto-authenticated → go to intake
    if (data.session && data.user) {
      await createEnrollmentIfNeeded(data.user.id, data.user.email || email);
      router.push("/intake?program=parachute");
      return;
    }

    // Fallback: email confirmation is on → show "check inbox" message
    setSuccess(true);
    setLoading(false);
  }

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await createEnrollmentIfNeeded(data.user.id, data.user.email || email);
    }
    router.push("/intake?program=parachute");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: body,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: 8,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const tierLabel = tier === "enneagram" ? "Enneagram" : "Standard";
  const tierBadgeBg = tier === "enneagram" ? colors.plumWash : colors.coralWash;
  const tierBadgeColor = tier === "enneagram" ? colors.plumLight : colors.coral;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      {/* Soft gradient wash */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 400,
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123, 82, 120, 0.08) 0%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "80px 24px 64px" }}>
        {/* Logo */}
        <motion.div {...fade(0)} style={{ marginBottom: 48 }}>
          <Logo size={32} />
        </motion.div>

        {/* ── Loading state ── */}
        {verified === null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", paddingTop: 48 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: `3px solid ${colors.borderDefault}`,
                borderTopColor: colors.coral,
                borderRadius: "50%",
                margin: "0 auto 20px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ fontFamily: body, fontSize: 15, color: colors.textMuted }}>
              Confirming your payment…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {/* ── Error state: payment not verified ── */}
        {verified === false && (
          <motion.div {...fade(0.3)}>
            <div
              style={{
                backgroundColor: colors.bgRecessed,
                borderRadius: 12,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: colors.warningWash,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 style={{ fontFamily: display, fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                We couldn&rsquo;t confirm your payment.
              </h2>
              <p style={{ fontFamily: body, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
                This can happen if the checkout session expired or the link was incomplete. Try again from the program page.
              </p>
              <a
                href="/parachute#pricing"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: display,
                  color: colors.bgDeep,
                  backgroundColor: colors.coral,
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
              >
                Back to Parachute
              </a>
            </div>
          </motion.div>
        )}

        {/* ── Verified: show signup flow ── */}
        {verified === true && (
          <>
            {/* Heading */}
            <motion.h1
              {...fade(0.3)}
              style={{
                fontFamily: display,
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: 12,
                letterSpacing: "-0.01em",
              }}
            >
              You&rsquo;re not starting over. You&rsquo;re starting from here.
            </motion.h1>

            {/* Tier badge */}
            <motion.div {...fade(0.4)} style={{ marginBottom: 20 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: display,
                  color: tierBadgeColor,
                  backgroundColor: tierBadgeBg,
                  borderRadius: 20,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                ✓ Parachute · {tierLabel}
              </span>
            </motion.div>

            <motion.p
              {...fade(0.5)}
              style={{
                fontFamily: body,
                fontSize: 16,
                color: colors.textSecondary,
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              You chose to walk toward this instead of away from it. That takes something. Create your account and you can start whenever you&rsquo;re ready.
            </motion.p>

            {/* ── Account creation / sign-in ── */}
            {!success ? (
              <motion.div {...fade(0.7)}>
                <div
                  style={{
                    backgroundColor: colors.bgRecessed,
                    borderRadius: 12,
                    padding: "28px 24px",
                    marginBottom: 40,
                  }}
                >
                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
                    {(["new", "returning"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setMode(tab); setError(""); }}
                        style={{
                          flex: 1,
                          padding: "12px 0",
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: display,
                          color: mode === tab ? colors.coral : colors.textMuted,
                          backgroundColor: "transparent",
                          border: "none",
                          borderBottom: `2px solid ${mode === tab ? colors.coral : colors.borderDefault}`,
                          cursor: "pointer",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {tab === "new" ? "New account" : "I have an account"}
                      </button>
                    ))}
                  </div>

                  {/* New account form */}
                  {mode === "new" && (
                    <form onSubmit={handleSignup}>
                      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textSecondary, fontFamily: body }}>
                        Email
                      </label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={{ ...inputStyle, marginBottom: 16 }} />

                      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textSecondary, fontFamily: body }}>
                        Password
                      </label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" style={{ ...inputStyle, marginBottom: 20 }} />

                      {/* Terms & Privacy consent */}
                      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: !agreed ? 8 : 24, cursor: "pointer", fontSize: 13, color: colors.textSecondary, fontFamily: body, lineHeight: 1.5 }}>
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: colors.coral, width: 16, height: 16, flexShrink: 0 }} />
                        <span>
                          I agree to the{" "}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "none" }}>Privacy Policy</a>
                          {" "}and{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "none" }}>Terms &amp; Conditions</a>
                        </span>
                      </label>
                      {!agreed && (
                        <p style={{ fontSize: 12, color: colors.textMuted, fontFamily: body, margin: "0 0 16px 0" }}>
                          You must agree to continue.
                        </p>
                      )}

                      {error && (
                        <div style={{ padding: 12, backgroundColor: colors.errorWash, border: `1px solid ${colors.error}`, borderRadius: 8, color: colors.error, fontSize: 13, fontFamily: body, marginBottom: 16 }}>
                          {error}
                        </div>
                      )}

                      <button type="submit" disabled={loading || !agreed} style={{ width: "100%", padding: 13, fontSize: 15, fontWeight: 600, fontFamily: display, color: colors.bgDeep, backgroundColor: (loading || !agreed) ? colors.bgElevated : colors.coral, border: "none", borderRadius: 8, cursor: (loading || !agreed) ? "not-allowed" : "pointer", transition: "background-color 0.2s", opacity: !agreed ? 0.5 : 1 }}>
                        {loading ? "Setting up\u2026" : "Create account & start"}
                      </button>
                    </form>
                  )}

                  {/* Returning user sign-in form */}
                  {mode === "returning" && (
                    <form onSubmit={handleSignin}>
                      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textSecondary, fontFamily: body }}>
                        Email
                      </label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={{ ...inputStyle, marginBottom: 16 }} />

                      <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 500, color: colors.textSecondary, fontFamily: body }}>
                        Password
                      </label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inputStyle, marginBottom: 20 }} />

                      {error && (
                        <div style={{ padding: 12, backgroundColor: colors.errorWash, border: `1px solid ${colors.error}`, borderRadius: 8, color: colors.error, fontSize: 13, fontFamily: body, marginBottom: 16 }}>
                          {error}
                        </div>
                      )}

                      <button type="submit" disabled={loading} style={{ width: "100%", padding: 13, fontSize: 15, fontWeight: 600, fontFamily: display, color: colors.bgDeep, backgroundColor: loading ? colors.bgElevated : colors.coral, border: "none", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", transition: "background-color 0.2s" }}>
                        {loading ? "Signing in\u2026" : "Sign in & continue"}
                      </button>
                    </form>
                  )}
                </div>

                {/* What happens after */}
                <motion.div {...fade(0.9)}>
                  <p
                    style={{
                      fontFamily: display,
                      fontSize: 13,
                      fontWeight: 600,
                      color: colors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 16,
                    }}
                  >
                    Then what
                  </p>
                  {[
                    "Answer 6 short questions so the program fits you.",
                    "Day 1 arrives the next morning. No prep needed.",
                  ].map((text, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "baseline",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: body,
                          fontSize: 14,
                          color: colors.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}.
                      </span>
                      <p
                        style={{
                          fontFamily: body,
                          fontSize: 15,
                          color: colors.textBody,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {text}
                      </p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              /* ── Success: email sent ── */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  backgroundColor: colors.bgRecessed,
                  borderRadius: 12,
                  padding: "32px 24px",
                  marginBottom: 40,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: colors.coral,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={colors.bgDeep}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h2
                  style={{
                    fontFamily: display,
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}
                >
                  Check your inbox.
                </h2>
                <p
                  style={{
                    fontFamily: body,
                    fontSize: 15,
                    color: colors.textSecondary,
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  We sent a confirmation link to{" "}
                  <strong style={{ color: colors.textPrimary }}>{email}</strong>.
                  Click it, then sign in. Your program is waiting.
                </p>

                <a
                  href="/login"
                  style={{
                    display: "inline-block",
                    marginTop: 24,
                    fontFamily: body,
                    fontSize: 14,
                    color: colors.coral,
                    textDecoration: "none",
                  }}
                >
                  Go to sign in →
                </a>
              </motion.div>
            )}

            {/* Quiet closing */}
            <motion.p
              {...fade(success ? 0.3 : 1.1)}
              style={{
                fontFamily: body,
                fontSize: 14,
                color: colors.textMuted,
                lineHeight: 1.6,
                fontStyle: "italic",
                marginTop: 40,
              }}
            >
              You don&rsquo;t need to feel ready. You just need to show up.
            </motion.p>
          </>
        )}
      </div>
    </div>
  );
}
