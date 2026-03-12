"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/journal");
      router.refresh();
    }
  }

  return (
    <div style={{
      maxWidth: 400,
      margin: "0 auto",
      padding: "80px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Sign in</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Welcome back to your coaching companion.
      </p>

      <form onSubmit={handleLogin}>
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", fontSize: 14, color: "#666" }}>
        Don&apos;t have an account?{" "}
        <a href="/signup" style={{ color: "#2563eb", textDecoration: "none" }}>
          Sign up
        </a>
      </p>
    </div>
  );
}
