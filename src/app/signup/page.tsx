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
    border: `1px solid ${colors.gray200}`, borderRadius: 8,
    marginBottom: 16, boxSizing: "border-box",
    outline: "none", transition: "border-color 0.15s",
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: colors.gray50,
        fontFamily: fonts.body, padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 400, backgroundColor: colors.white,
          borderRadius: 16, padding: "40px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${colors.gray100}`, textAlign: "center",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", backgroundColor: colors.success,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: colors.white, marginBottom: 16,
          }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0", color: colors.black }}>
            {c.signup.success.headline}
          </h1>
          <p style={{ color: colors.gray500, lineHeight: 1.6, fontSize: 14 }}>
            Confirmation link sent to <strong>{email}</strong>{c.signup.success.messageAfter}
          </p>
          <a
            href="/login"
            style={{
              display: "inline-block", marginTop: 24,
              color: colors.primary, fontWeight: 500,
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
      justifyContent: "center", backgroundColor: colors.gray50,
      fontFamily: fonts.body, padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 400, backgroundColor: colors.white,
        borderRadius: 16, padding: "40px 32px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: `1px solid ${colors.gray100}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", marginBottom: 16 }}>
            <Logo size={44} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px 0", color: colors.black }}>
            {c.signup.headline}
          </h1>
          <p style={{ fontSize: 14, color: colors.gray500, margin: 0 }}>
            {c.signup.subheadline}
          </p>
        </div>

        <form onSubmit={handleSignup}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.gray600 }}>
            {c.signup.emailLabel}
          </label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder={c.signup.emailPlaceholder} style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.gray600 }}>
            {c.signup.passwordLabel}
          </label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6} style={{ ...inputStyle, marginBottom: 24 }}
          />

          {error && (
            <div style={{
              padding: 12, backgroundColor: colors.errorLight,
              border: "1px solid #fecaca", borderRadius: 8,
              color: colors.error, fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: 13, fontSize: 15, fontWeight: 600,
            color: colors.white,
            backgroundColor: loading ? colors.gray400 : colors.primary,
            border: "none", borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.15s",
          }}>
            {loading ? c.signup.submitLoading : c.signup.submitButton}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: colors.gray500 }}>
          {c.signup.haveAccount}{" "}
          <a href="/login" style={{ color: colors.primary, fontWeight: 500, textDecoration: "none" }}>
            {c.signup.haveAccountLink}
          </a>
        </p>
      </div>
    </div>
  );
}
