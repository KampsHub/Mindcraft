"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("message") === "password-updated") {
      setSuccessMessage("Password updated. Sign in below.");
      setMode("password");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { trackEvent("login_success", { method: "password" }); window.location.href = "/dashboard"; }
  }

  async function handleMagicLink() {
    if (!email) return;
    setMagicLinkLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setMagicLinkLoading(false);
    if (error) setError(error.message);
    else setMagicLinkSent(true);
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Google sign-in failed. Try the magic link instead.");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: 15,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: 10,
    boxSizing: "border-box",
    outline: "none",
    fontFamily: body,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.bgDeep,
        fontFamily: body,
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <Logo size={20} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: 0,
              color: colors.textPrimary,
              fontFamily: display,
              letterSpacing: "-0.02em",
            }}
          >
            Sign in
          </h1>
        </div>

        {successMessage && (
          <div
            style={{
              padding: 12,
              backgroundColor: colors.successWash,
              border: `1px solid ${colors.success}44`,
              borderRadius: 10,
              color: colors.success,
              fontSize: 14,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Magic link sent state */}
        {magicLinkSent ? (
          <div
            style={{
              padding: 32,
              backgroundColor: colors.bgSurface,
              borderRadius: 16,
              border: `1px solid ${colors.borderDefault}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: colors.successWash,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, margin: "0 0 8px", fontFamily: display }}>
              Check your email
            </p>
            <p style={{ fontSize: 14, color: colors.textSecondary, margin: "0 0 20px", lineHeight: 1.5 }}>
              We sent a sign-in link to <strong style={{ color: colors.textPrimary }}>{email}</strong>
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
                padding: 14,
                fontSize: 15,
                fontWeight: 500,
                color: colors.textPrimary,
                fontFamily: body,
                backgroundColor: colors.bgSurface,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: 10,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 20,
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

            <p style={{
              fontSize: 11, color: colors.textMuted,
              margin: "8px 0 20px", textAlign: "center",
            }}>
              Securely hosted by{" "}
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: colors.textMuted, textDecoration: "underline" }}>
                Supabase
              </a>
            </p>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: colors.borderDefault }} />
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: display, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: colors.borderDefault }} />
            </div>

            {/* Email input — shared between modes */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mode === "magic") handleMagicLink();
                }}
                style={inputStyle}
              />
            </div>

            {mode === "magic" ? (
              /* Magic link button */
              <button
                type="button"
                disabled={!email || magicLinkLoading}
                onClick={handleMagicLink}
                style={{
                  width: "100%",
                  padding: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: display,
                  color: !email || magicLinkLoading ? colors.textMuted : colors.bgDeep,
                  backgroundColor: !email || magicLinkLoading ? colors.bgElevated : colors.coral,
                  border: "none",
                  borderRadius: 10,
                  cursor: !email || magicLinkLoading ? "not-allowed" : "pointer",
                  marginBottom: 16,
                }}
              >
                {magicLinkLoading ? "Sending..." : "Send sign-in link"}
              </button>
            ) : (
              /* Password form */
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{ ...inputStyle, marginBottom: 16 }}
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    width: "100%",
                    padding: 14,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: display,
                    color: loading ? colors.textMuted : colors.bgDeep,
                    backgroundColor: loading ? colors.bgElevated : colors.coral,
                    border: "none",
                    borderRadius: 10,
                    cursor: loading ? "not-allowed" : "pointer",
                    marginBottom: 8,
                  }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <p style={{ textAlign: "center", margin: "0 0 16px" }}>
                  <a
                    href="/forgot-password"
                    style={{ fontSize: 13, color: colors.textMuted, textDecoration: "none" }}
                  >
                    Forgot password?
                  </a>
                </p>
              </form>
            )}

            {/* Mode toggle */}
            <p style={{ textAlign: "center", margin: 0 }}>
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
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {mode === "magic" ? "Use password instead" : "Use email link instead"}
              </button>
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: 12,
              backgroundColor: colors.errorWash,
              border: `1px solid ${colors.error}44`,
              borderRadius: 10,
              color: colors.error,
              fontSize: 13,
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 18, color: colors.textSecondary, margin: "0 0 12px", fontWeight: 500 }}>
            New here?{" "}
            <a href="/#programs" style={{
              color: colors.coral, fontWeight: 700, textDecoration: "none",
              fontSize: 20, borderBottom: `2px solid ${colors.coral}`, paddingBottom: 2,
            }}>
              Start your journey →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
