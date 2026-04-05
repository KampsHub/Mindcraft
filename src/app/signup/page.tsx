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
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", fontSize: 15,
    backgroundColor: colors.bgInput,
    color: colors.textPrimary,
    border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
    marginBottom: 12, boxSizing: "border-box",
    outline: "none", transition: "border-color 0.15s",
    fontFamily: fonts.bodyAlt,
  };

  if (success) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: colors.bgDeep,
        fontFamily: fonts.bodyAlt, padding: 24,
      }}>
        <div style={{
          width: "100%", maxWidth: 420, backgroundColor: colors.bgSurface,
          borderRadius: 20, padding: "48px 36px",
          border: `1px solid ${colors.borderDefault}`, textAlign: "center",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", backgroundColor: colors.coral,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: colors.bgDeep, marginBottom: 20,
          }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px 0", color: colors.textPrimary, fontFamily: fonts.display }}>
            {c.signup.success.headline}
          </h1>
          <p style={{ color: colors.textPrimary, lineHeight: 1.6, fontSize: 15, margin: "0 0 24px 0" }}>
            Confirmation link sent to <strong style={{ color: colors.textPrimary }}>{email}</strong>{c.signup.success.messageAfter}
          </p>
          <a href="/login" style={{
            display: "inline-block", color: colors.coral, fontWeight: 600,
            textDecoration: "none", fontSize: 15, fontFamily: fonts.display,
          }}>
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
      fontFamily: fonts.bodyAlt, padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        backgroundColor: colors.bgSurface,
        borderRadius: 20, padding: "48px 36px 36px",
        border: `1px solid ${colors.borderDefault}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-block", marginBottom: 12 }}>
            <Logo size={20} />
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, margin: "0 0 6px 0",
            color: colors.textPrimary, fontFamily: fonts.display,
            letterSpacing: "-0.02em",
          }}>
            {c.signup.headline}
          </h1>
          <p style={{ fontSize: 15, color: colors.textPrimary, margin: 0 }}>
            {c.signup.subheadline}
          </p>
        </div>

        {/* Email + Magic Link — primary */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: "block", marginBottom: 6, fontSize: 13,
            fontWeight: 600, color: colors.textPrimary,
            fontFamily: fonts.display, letterSpacing: "0.01em",
          }}>
            {c.signup.emailLabel}
          </label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.signup.emailPlaceholder}
            style={inputStyle}
          />

          {magicLinkSent ? (
            <div style={{
              padding: 20, backgroundColor: colors.successWash,
              border: `1px solid ${colors.success}44`, borderRadius: 12,
              textAlign: "center",
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: colors.success, margin: "0 0 6px 0", fontFamily: fonts.display }}>
                Check your email
              </p>
              <p style={{ fontSize: 14, color: colors.textPrimary, margin: 0, lineHeight: 1.5 }}>
                We sent a sign-up link to <strong style={{ color: colors.textPrimary }}>{email}</strong>
              </p>
            </div>
          ) : (
            <>
            {/* Terms & Privacy consent */}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              marginBottom: 14, cursor: "pointer",
              fontSize: 13, color: colors.textPrimary, lineHeight: 1.5,
              fontFamily: fonts.bodyAlt,
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: 18, height: 18, marginTop: 2, flexShrink: 0,
                  accentColor: colors.coral, cursor: "pointer",
                }}
              />
              <span>
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "underline" }}>
                  Terms & Conditions
                </a>{" "}and{" "}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: colors.coral, textDecoration: "underline" }}>
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="button"
              disabled={!email || !agreedToTerms || magicLinkLoading}
              onClick={async () => {
                if (!email || !agreedToTerms) return;
                setMagicLinkLoading(true);
                setError("");
                const { error } = await supabase.auth.signInWithOtp({
                  email,
                  options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                });
                setMagicLinkLoading(false);
                if (error) setError(error.message);
                else setMagicLinkSent(true);
              }}
              style={{
                width: "100%", padding: 14, fontSize: 15, fontWeight: 600,
                fontFamily: fonts.display, letterSpacing: "-0.01em",
                color: (!email || !agreedToTerms || magicLinkLoading) ? colors.textPrimary : colors.bgDeep,
                backgroundColor: (!email || !agreedToTerms || magicLinkLoading) ? colors.bgElevated : colors.coral,
                border: "none", borderRadius: 10,
                cursor: (!email || !agreedToTerms || magicLinkLoading) ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {magicLinkLoading ? "Sending..." : "Create account"}
            </button>
            </>
          )}
        </div>

        {/* Divider */}
        <div style={{
          display: "flex", alignItems: "center", margin: "4px 0 20px",
          gap: 14,
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: colors.borderDefault }} />
          <span style={{ fontSize: 12, color: colors.textPrimary, fontFamily: fonts.display, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>or</span>
          <div style={{ flex: 1, height: 1, backgroundColor: colors.borderDefault }} />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={async () => {
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) console.error("Google login error:", error);
          }}
          style={{
            width: "100%", padding: 14, fontSize: 15, fontWeight: 500,
            color: colors.textPrimary, fontFamily: fonts.bodyAlt,
            backgroundColor: colors.bgRecessed,
            border: `1px solid ${colors.borderDefault}`, borderRadius: 10,
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
        <p style={{ fontSize: 11, color: colors.textPrimary, textAlign: "center", margin: "8px 0 0 0" }}>
          Securely hosted by <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: colors.textPrimary, textDecoration: "underline" }}>Supabase</a>
        </p>

        {/* Password option — collapsible */}
        {!magicLinkSent && (
          <>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{
                background: "none", border: "none", color: colors.textPrimary,
                fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center",
                padding: "12px 0 4px", fontFamily: fonts.bodyAlt,
              }}
            >
              {showPasswordForm ? "Hide password signup" : "Sign up with password"}
            </button>

            {showPasswordForm && (
              <form onSubmit={handleSignup} style={{ marginTop: 12 }}>
                <label style={{
                  display: "block", marginBottom: 6, fontSize: 13,
                  fontWeight: 600, color: colors.textPrimary,
                  fontFamily: fonts.display, letterSpacing: "0.01em",
                }}>
                  {c.signup.passwordLabel}
                </label>
                <input
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} style={{ ...inputStyle, marginBottom: 16 }}
                />

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: 14, fontSize: 15, fontWeight: 600,
                  fontFamily: fonts.display,
                  color: loading ? colors.textPrimary : colors.textPrimary,
                  backgroundColor: loading ? colors.bgElevated : colors.bgRecessed,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 10,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}>
                  {loading ? c.signup.submitLoading : c.signup.submitButton}
                </button>
              </form>
            )}
          </>
        )}

        {error && (
          <div style={{
            padding: 12, backgroundColor: colors.errorWash,
            border: `1px solid ${colors.error}44`, borderRadius: 10,
            color: colors.error, fontSize: 13, marginTop: 16, textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: `1px solid ${colors.borderDefault}`,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 14, color: colors.textPrimary, margin: 0 }}>
            {c.signup.haveAccount}{" "}
            <a href="/login" style={{ color: colors.coral, fontWeight: 600, textDecoration: "none" }}>
              {c.signup.haveAccountLink}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
