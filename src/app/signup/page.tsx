"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import { content as c } from "@/content/site";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: 12, fontSize: 15,
    border: `1px solid ${colors.borderSubtle}`, borderRadius: 8,
    marginBottom: 16, boxSizing: "border-box",
    outline: "none", transition: "border-color 0.15s",
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: colors.bgDeep,
        fontFamily: fonts.body, padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 400, backgroundColor: colors.bgSurface,
          borderRadius: 16, padding: "40px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${colors.bgRecessed}`, textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", backgroundColor: colors.coral,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: colors.bgDeep, marginBottom: 16,
          }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0", color: colors.textPrimary }}>
            {c.signup.success.headline}
          </h1>
          <p style={{ color: colors.textMuted, lineHeight: 1.6, fontSize: 14 }}>
            Confirmation link sent to <strong>{email}</strong>{c.signup.success.messageAfter}
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block", marginTop: 24,
              color: colors.coral, fontWeight: 500,
              textDecoration: "none", fontSize: 15,
            }}
          >
            {c.signup.success.backLink}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", backgroundColor: colors.bgDeep,
      fontFamily: fonts.body, padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400, backgroundColor: colors.bgSurface,
        borderRadius: 16, padding: "40px 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: `1px solid ${colors.bgRecessed}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", marginBottom: 16 }}>
            <Logo size={20} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.textPrimary }}>
            {c.signup.headline}
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>
            {c.signup.subheadline}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
              },
            });
            if (error) console.error("Google login error:", error);
          }}
          style={{
            width: "100%", padding: 13, fontSize: 15, fontWeight: 500,
            color: colors.textPrimary,
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.borderSubtle}`, borderRadius: 8,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 10,
            transition: "background-color 0.15s",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign up with Google
        </button>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", margin: "20px 0",
          gap: 12,
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
          <span style={{ fontSize: 13, color: colors.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: colors.borderSubtle }} />
        </div>

        <form onSubmit={handleSignup}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textSecondary }}>
            {c.signup.emailLabel}
          </label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder={c.signup.emailPlaceholder} style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.textSecondary }}>
            {c.signup.passwordLabel}
          </label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6} style={{ ...inputStyle, marginBottom: 24 }}
          />

          {error && (
            <div style={{
              padding: 12, backgroundColor: colors.errorWash,
              border: "1px solid #fecaca", borderRadius: 8,
              color: colors.error, fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 13, fontSize: 15, fontWeight: 600,
            color: colors.bgDeep,
            backgroundColor: loading ? colors.textMuted : colors.coral,
            border: "none", borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
          }}>
            {loading ? c.signup.submitLoading : c.signup.submitButton}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: colors.textMuted }}>
          {c.signup.haveAccount}{" "}
          <a href="/login" style={{ color: colors.coral, fontWeight: 500, textDecoration: "none" }}>
            {c.signup.haveAccountLink}
          </a>
        </p>
      </div>
    </div>
  );
}
