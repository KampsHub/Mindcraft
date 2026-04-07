"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";
import Logo from "@/components/Logo";

const display = fonts.display;
const body = fonts.bodyAlt;

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.8, delay, ease: "easeOut" } as const,
});

export default function EnneagramWelcomePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }} />
    }>
      <EnneagramWelcome />
    </Suspense>
  );
}

function EnneagramWelcome() {
  const [verified, setVerified] = useState<null | boolean>(null);
  const [notified, setNotified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackEvent("welcome_page_view", { program: "enneagram" });
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setVerified(false);
      return;
    }

    fetch(`/api/checkout/verify?session_id=${sessionId}`)
      .then((res) => res.json())
      .then(async (data) => {
        setVerified(data.paid === true);
        if (data.paid) {
          trackEvent("enneagram_purchase", { tier: "standalone", amount: data.amountPaid });

          // Notify Stefanie
          try {
            await fetch("/api/enneagram-notify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customerEmail: data.customerEmail || "unknown",
                amountPaid: data.amountPaid,
              }),
            });
            setNotified(true);
          } catch (err) {
            console.error("Failed to send notification:", err);
          }
        }
      })
      .catch(() => setVerified(false));
  }, [searchParams]);

  // Loading state
  if (verified === null) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: colors.bgDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: display, fontSize: 18, color: colors.textMuted }}
        >
          Verifying your purchase…
        </motion.div>
      </div>
    );
  }

  // Not verified
  if (!verified) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: colors.bgDeep,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <p style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 12 }}>
            Something went wrong
          </p>
          <p style={{ fontFamily: body, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
            We couldn&rsquo;t verify your payment. If you were charged, please contact us and we&rsquo;ll sort it out.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              fontFamily: display, fontSize: 14, fontWeight: 600,
              padding: "12px 28px", borderRadius: 8,
              backgroundColor: colors.coral, color: colors.textPrimary,
              border: "none", cursor: "pointer",
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: colors.bgDeep,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 620, width: "100%" }}>
        <motion.div {...fade(0)} style={{ marginBottom: 32, textAlign: "center" }}>
          <Logo />
        </motion.div>

        <motion.div {...fade(0.2)} style={{ textAlign: "center" }}>
          <span style={{
            display: "inline-block",
            fontFamily: body, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase" as const,
            padding: "6px 16px", borderRadius: 6,
            backgroundColor: colors.coralWash, color: colors.coral,
            marginBottom: 20,
          }}>
            ✓ IEQ9 Enneagram
          </span>
        </motion.div>

        <motion.h1 {...fade(0.4)} style={{
          fontFamily: display, fontSize: 32, fontWeight: 700,
          color: colors.textPrimary, letterSpacing: "-0.02em",
          margin: "0 0 16px 0", textAlign: "center",
        }}>
          You&rsquo;re in.
        </motion.h1>

        <motion.p {...fade(0.5)} style={{
          fontFamily: body, fontSize: 17, color: colors.textPrimary,
          lineHeight: 1.7, margin: "0 0 32px 0", textAlign: "center",
          maxWidth: 520, marginLeft: "auto", marginRight: "auto",
        }}>
          The IEQ9 from Integrative9 — a 175-question, scientifically validated Enneagram assessment used by certified coaches and Fortune 500 leadership programs.
        </motion.p>

        {/* Step 1: Assessment link */}
        <motion.div {...fade(0.7)} style={{
          padding: "22px 26px",
          marginBottom: 16,
          borderRadius: 14,
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.coralWash}`,
        }}>
          <p style={{
            fontFamily: display, fontSize: 11, fontWeight: 700,
            color: colors.coral, margin: "0 0 6px 0",
            letterSpacing: "0.12em", textTransform: "uppercase" as const,
          }}>
            Step 1 · Assessment link
          </p>
          <p style={{
            fontFamily: body, fontSize: 16, color: colors.textPrimary,
            margin: "0 0 8px 0", lineHeight: 1.6,
          }}>
            I&rsquo;ll send your IEQ9 assessment link within <strong>48 hours</strong>. It takes about 30-40 minutes to complete and asks you to rate 175 statements.
          </p>
          <p style={{
            fontFamily: body, fontSize: 14, color: colors.textPrimary,
            margin: 0, lineHeight: 1.55, opacity: 0.85,
          }}>
            You&rsquo;ll get a 30+ page report covering your dominant type, your wings, your tritype, and how you shift under stress vs security.
          </p>
        </motion.div>

        {/* Step 2: Book the debrief */}
        <motion.div {...fade(0.85)} style={{
          padding: "22px 26px",
          marginBottom: 16,
          borderRadius: 14,
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.coralWash}`,
        }}>
          <p style={{
            fontFamily: display, fontSize: 11, fontWeight: 700,
            color: colors.coral, margin: "0 0 6px 0",
            letterSpacing: "0.12em", textTransform: "uppercase" as const,
          }}>
            Step 2 · Book your 1-hour live debrief
          </p>
          <p style={{
            fontFamily: body, fontSize: 16, color: colors.textPrimary,
            margin: "0 0 16px 0", lineHeight: 1.6,
          }}>
            Once you have your results, we&rsquo;ll spend an hour together walking through what they mean for <strong>your specific moment</strong>. Not generic Enneagram theory — your patterns, your triggers, your growth edges, applied to what you&rsquo;re navigating right now.
          </p>
          <a
            href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1GvZttZdK4XHfuoTQ0LRKf0IVVPjxJV4XRkKLdQ7_wS5fK4WR-Wjjn95OyMp-lpcy8QtqOT-zs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: display, fontSize: 14, fontWeight: 700,
              padding: "12px 24px", borderRadius: 100,
              backgroundColor: colors.coral, color: colors.bgDeep,
              border: "none", cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            Book your debrief →
          </a>
        </motion.div>

        {/* Step 3: How it shapes your daily program */}
        <motion.div {...fade(1.0)} style={{
          padding: "22px 26px",
          marginBottom: 32,
          borderRadius: 14,
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderSubtle}`,
        }}>
          <p style={{
            fontFamily: display, fontSize: 11, fontWeight: 700,
            color: colors.textPrimary, margin: "0 0 6px 0",
            letterSpacing: "0.12em", textTransform: "uppercase" as const, opacity: 0.85,
          }}>
            And then · It shapes every exercise
          </p>
          <p style={{
            fontFamily: body, fontSize: 15, color: colors.textPrimary,
            margin: 0, lineHeight: 1.6, opacity: 0.9,
          }}>
            Once your results are in, the AI weights every exercise in your daily program toward what your specific type needs — somatic work for body-resistant types, structured tools for emotional types, etc. The program adapts to who you actually are, not a generic template.
          </p>
        </motion.div>

        <motion.div {...fade(1.15)} style={{ textAlign: "center" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              fontFamily: display, fontSize: 14, fontWeight: 600,
              padding: "12px 28px", borderRadius: 100,
              backgroundColor: "transparent", color: colors.textPrimary,
              border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Back to dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
