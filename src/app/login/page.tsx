"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import { content as c } from "@/content/site";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("message") === "password-updated") {
      setSuccessMessage("Password updated successfully. Sign in with your new password.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: 12, fontSize: 15,
    border: `1px solid ${colors.gray200}`, borderRadius: 8,
    marginBottom: 16, boxSizing: "border-box",
    outline: "none", transition: "border-color 0.15s",
  };

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
            {c.login.headline}
          </h1>
          <p style={{ fontSize: 14, color: colors.gray500, margin: 0 }}>
            {c.login.subheadline}
          </p>
        </div>

        {successMessage && (
          <div style={{
            padding: 12, backgroundColor: colors.coralWash,
            border: `1px solid rgba(224, 149, 133, 0.25)`, borderRadius: 8,
            color: colors.coral, fontSize: 13, marginBottom: 16, textAlign: "center",
          }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.gray600 }}>
            {c.login.emailLabel}
          </label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required placeholder={c.login.emailPlaceholder} style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 500, color: colors.gray600 }}>
            {c.login.passwordLabel}
          </label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            required style={{ ...inputStyle, marginBottom: 24 }}
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
            {loading ? c.login.submitLoading : c.login.submitButton}
          </button>

          <p style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: colors.gray500 }}>
            <a href="/forgot-password" style={{ color: colors.gray500, textDecoration: "none" }}>
              Forgot password?
            </a>
          </p>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: colors.gray500 }}>
          {c.login.newHere}{" "}
          <a href="/subscribe" style={{ color: colors.primary, fontWeight: 500, textDecoration: "none" }}>
            {c.login.newHereLink}
          </a>
        </p>
      </div>
    </div>
  );
}
