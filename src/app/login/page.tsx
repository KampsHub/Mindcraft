"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { colors as darkColors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";

// Dark-mode palette for the login page — high-contrast text on near-black bg
const colors = {
  ...darkColors,
  bgDeep:        "#0E0E11",   // outer page bg — near black, slightly warm
  bgRecessed:    "#16161A",
  bgInput:       "#1F1F25",   // form field bg
  bgSurface:     "#1A1A1F",   // card bg
  bgElevated:    "#2A2A30",
  textPrimary:   "#FFFFFF",   // pure white for max contrast
  textSecondary: "#EBE8E0",   // near-white for body text
  textBody:      "#DAD7D0",
  textMuted:     "#B5B5BC",   // bumped from #8A8A92 for legibility
  borderSubtle:  "rgba(255,255,255,0.10)",
  borderDefault: "rgba(255,255,255,0.18)",
};

const display = fonts.display;
const body = fonts.bodyAlt;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("message") === "password-updated") {
      setSuccessMessage("Password updated. Sign in below.");
      setMode("password");
    }
  }, [searchParams]);

  // ?next=/refer routes the user to that page after auth instead of /dashboard.
  // Used by the referrer-only signup flow on the /refer page.
  const nextPath = searchParams.get("next") || "";
  const callbackUrl = (typeof window !== "undefined")
    ? `${window.location.origin}/auth/callback${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`
    : "";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      trackEvent("auth_login_failed", { method: "password", error_message: error.message });
      setError(error.message);
      setLoading(false);
    }
    else {
      trackEvent("login_success", { method: "password" });
      window.location.href = nextPath || "/dashboard";
    }
  }

  async function handleMagicLink() {
    if (!email) return;
    setMagicLinkLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    setMagicLinkLoading(false);
    if (error) {
      trackEvent("auth_magic_link_failed", { error_message: error.message });
      setError(error.message);
    } else {
      trackEvent("auth_magic_link_sent", {});
      setMagicLinkSent(true);
    }
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (error) {
      trackEvent("auth_google_failed", { error_message: error.message });
      setError("Google sign-in failed. Try the email link instead.");
    }
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    border: `1.5px solid ${focused ? colors.coral : "rgba(255,255,255,0.10)"}`,
    borderRadius: 12,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: body,
    transition: "border-color 0.15s, box-shadow 0.15s, background-color 0.15s",
    boxShadow: focused ? `0 0 0 4px rgba(196,148,58,0.18)` : "none",
  });

  const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: 15,
    fontWeight: 700,
    fontFamily: display,
    letterSpacing: "0.01em",
    color: disabled ? "rgba(255,255,255,0.55)" : "#18181C",
    backgroundColor: disabled ? "rgba(196,148,58,0.20)" : colors.coral,
    border: disabled ? "1.5px solid rgba(196,148,58,0.4)" : "1.5px solid transparent",
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform 0.15s, box-shadow 0.15s, background-color 0.15s",
    boxShadow: disabled ? "none" : "0 8px 24px rgba(196,148,58,0.35)",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 20% 0%, rgba(196,148,58,0.14) 0%, transparent 45%),
          radial-gradient(circle at 85% 15%, rgba(123,154,173,0.10) 0%, transparent 55%),
          radial-gradient(circle at 50% 100%, rgba(196,148,58,0.08) 0%, transparent 50%),
          ${colors.bgDeep}
        `,
        fontFamily: body,
        position: "relative",
        overflow: "hidden",
        color: colors.textPrimary,
      }}
    >
      {/* Brand sliver header with logo */}
      <header
        style={{
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 2,
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
        }}
      >
        <Logo size={22} />
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px 96px",
          position: "relative",
          zIndex: 1,
        }}
      >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          {/* Decorative little dot with glow */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: colors.coral,
              margin: "0 auto 18px",
              boxShadow: `0 0 0 6px rgba(196,148,58,0.18), 0 0 24px rgba(196,148,58,0.6)`,
            }}
          />
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              margin: "0 0 10px 0",
              color: colors.textPrimary,
              fontFamily: display,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Welcome back.
          </h1>
          <p style={{
            fontSize: 16,
            color: colors.textMuted,
            margin: 0,
            lineHeight: 1.55,
            fontFamily: fonts.serif,
            fontStyle: "italic",
          }}>
            Sign in to continue your program.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: colors.bgSurface,
            borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.06)`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            padding: "36px 32px 32px",
          }}
        >
          {successMessage && (
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(139,196,138,0.15)",
                border: "1px solid rgba(139,196,138,0.4)",
                borderRadius: 10,
                color: "#9DD89A",
                fontSize: 13,
                marginBottom: 20,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {successMessage}
            </div>
          )}

          {magicLinkSent ? (
            <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "rgba(196,148,58,0.15)",
                  border: "1px solid rgba(196,148,58,0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, margin: "0 0 10px", fontFamily: display, letterSpacing: "-0.01em" }}>
                Check your email
              </p>
              <p style={{ fontSize: 14, color: colors.textMuted, margin: "0 0 24px", lineHeight: 1.55 }}>
                We sent a sign-in link to<br />
                <strong style={{ color: colors.textPrimary }}>{email}</strong>
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(""); }}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.coral,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: body,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              {/* Google — one click, top */}
              <button
                type="button"
                onClick={handleGoogle}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  fontFamily: body,
                  backgroundColor: colors.bgInput,
                  border: "1.5px solid rgba(255,255,255,0.10)",
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "background-color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgElevated;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bgInput;
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.10)" }} />
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.10)" }} />
              </div>

              {/* Email */}
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                placeholder="you@example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mode === "magic") handleMagicLink();
                }}
                style={{ ...inputStyle(emailFocus), marginBottom: mode === "password" ? 16 : 20 }}
              />

              {mode === "password" && (
                <>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    placeholder="••••••••"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && email && password) handleLogin(e as unknown as React.FormEvent);
                    }}
                    style={{ ...inputStyle(passwordFocus), marginBottom: 20 }}
                  />
                </>
              )}

              {mode === "magic" ? (
                <button
                  type="button"
                  disabled={!email || magicLinkLoading}
                  onClick={handleMagicLink}
                  style={primaryButtonStyle(!email || magicLinkLoading)}
                >
                  {magicLinkLoading ? "Sending..." : "Send sign-in link"}
                </button>
              ) : (
                <form onSubmit={handleLogin}>
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    style={primaryButtonStyle(loading || !email || !password)}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              )}

              {mode === "password" && (
                <p style={{ textAlign: "center", margin: "14px 0 0" }}>
                  <a href="/forgot-password" style={{ fontSize: 13, color: colors.textMuted, textDecoration: "none" }}>
                    Forgot password?
                  </a>
                </p>
              )}

              {/* Mode toggle */}
              <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.borderSubtle}` }}>
                <button
                  type="button"
                  onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(""); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.textMuted,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: body,
                  }}
                >
                  {mode === "magic" ? "Sign in with password instead" : "Sign in with email link instead"}
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                backgroundColor: "rgba(184,69,58,0.15)",
                border: "1px solid rgba(184,69,58,0.4)",
                borderRadius: 10,
                color: "#E89086",
                fontSize: 13,
                marginTop: 16,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Supabase trust note */}
        <p style={{
          fontSize: 11,
          color: colors.textMuted,
          margin: "16px 0 0",
          textAlign: "center",
          letterSpacing: "0.02em",
        }}>
          🔒 Securely hosted by{" "}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: colors.textMuted, textDecoration: "underline" }}>
            Supabase
          </a>
        </p>

        {/* New user CTA */}
        <div
          style={{
            marginTop: 32,
            padding: "20px 24px",
            backgroundColor: "rgba(196,148,58,0.10)",
            border: `1px solid rgba(196,148,58,0.25)`,
            borderRadius: 14,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 8px", lineHeight: 1.5 }}>
            New to Mindcraft?
          </p>
          <a
            href="/#programs"
            style={{
              display: "inline-block",
              color: colors.coral,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              fontFamily: display,
              letterSpacing: "-0.005em",
            }}
          >
            Start your journey →
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: display,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#C5C0BA",
  marginBottom: 8,
};
