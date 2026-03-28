"use client";

import { useState } from "react";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";

const display = fonts.display;
const body = fonts.bodyAlt;

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 24px",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo size={20} />
        </a>
      </header>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 24px" }}>
        {sent ? (
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: display,
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 16,
                color: colors.textPrimary,
              }}
            >
              Message sent.
            </h1>
            <p
              style={{
                fontFamily: body,
                fontSize: 16,
                color: colors.textSecondary,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Thanks for reaching out. We'll get back to you soon.
            </p>
            <a
              href="/"
              style={{
                fontFamily: display,
                fontSize: 14,
                fontWeight: 600,
                color: colors.textPrimary,
                backgroundColor: colors.coral,
                padding: "12px 28px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        ) : (
          <>
            <h1
              style={{
                fontFamily: display,
                fontSize: 28,
                fontWeight: 700,
                marginBottom: 8,
                color: colors.textPrimary,
              }}
            >
              Get in touch.
            </h1>
            <p
              style={{
                fontFamily: body,
                fontSize: 16,
                color: colors.textSecondary,
                lineHeight: 1.6,
                marginBottom: 32,
              }}
            >
              Questions, feedback, or just want to say hi? We'd love to hear from you.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontFamily: body,
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Message
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="What's on your mind?"
                />
              </div>

              {error && (
                <p style={{ fontSize: 14, color: colors.error, margin: 0, fontFamily: body }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                style={{
                  fontFamily: display,
                  fontSize: 15,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  backgroundColor: colors.coral,
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 28px",
                  cursor: sending ? "wait" : "pointer",
                  opacity: sending ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {sending ? "Sending..." : "Send message"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
