"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

  if (success) {
    return (
      <div style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: "80px 24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Check your email</h1>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account, then come back to sign in.
        </p>
        <a
          href="/login"
          style={{
            display: "inline-block",
            marginTop: 24,
            color: "#2563eb",
            textDecoration: "none",
            fontSize: 15,
          }}
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: "0 auto",
      padding: "80px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Create your account</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Start your daily coaching journey.
      </p>

      <form onSubmit={handleSignup}>
        <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 16,
            boxSizing: "border-box",
          }}
        />

        <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 24,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <div style={{
            padding: 12,
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            color: "#dc2626",
            fontSize: 14,
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            fontWeight: 500,
            color: "#fff",
            backgroundColor: loading ? "#999" : "#2563eb",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#666" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#2563eb", textDecoration: "none" }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
