"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase will automatically exchange the token from the URL hash
    // and establish the session when the page loads. We listen for
    // the PASSWORD_RECOVERY event to know the user is authenticated.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if there's already a session (e.g. if onAuthStateChange
    // fires before this listener is set up)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/login?message=password-updated");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    fontSize: 15,
    border: `1px solid ${colors.gray200}`,
    borderRadius: 8,
    marginBottom: 16,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.15s",
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    fontFamily: fonts.body,
  };

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.gray50,
          fontFamily: fonts.body,
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: "40px 32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: `1px solid ${colors.gray100}`,
            textAlign: "center",
          }}
        >
          <p style={{ color: colors.gray500, fontSize: 14 }}>
            Verifying your reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.gray50,
        fontFamily: fonts.body,
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: colors.white,
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: `1px solid ${colors.gray100}`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-block", marginBottom: 16 }}>
            <Logo size={44} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 4px 0",
              color: colors.black,
              fontFamily: fonts.display,
            }}
          >
            Set a new password
          </h1>
          <p style={{ fontSize: 14, color: colors.gray500, margin: 0 }}>
            Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleUpdate}>
          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              fontWeight: 500,
              color: colors.gray600,
            }}
          >
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <label
            style={{
              display: "block",
              marginBottom: 4,
              fontSize: 13,
              fontWeight: 500,
              color: colors.gray600,
            }}
          >
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ ...inputStyle, marginBottom: 24 }}
          />

          {error && (
            <div
              style={{
                padding: 12,
                backgroundColor: colors.errorLight,
                border: "1px solid #fecaca",
                borderRadius: 8,
                color: colors.error,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 13,
              fontSize: 15,
              fontWeight: 600,
              color: colors.white,
              backgroundColor: loading ? colors.gray400 : colors.primary,
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <p
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 14,
            color: colors.gray500,
          }}
        >
          <a
            href="/login"
            style={{
              color: colors.primary,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  );
}
