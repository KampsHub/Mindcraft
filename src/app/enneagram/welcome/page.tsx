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
              backgroundColor: colors.coral, color: "#ffffff",
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
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <motion.div {...fade(0)} style={{ marginBottom: 32 }}>
          <Logo />
        </motion.div>

        <motion.div {...fade(0.2)}>
          <span style={{
            display: "inline-block",
            fontFamily: body, fontSize: 10, fontWeight: 700,
            letterSpacing: 1.5, textTransform: "uppercase" as const,
            padding: "6px 16px", borderRadius: 6,
            backgroundColor: "rgba(224, 149, 133, 0.12)", color: colors.coral,
            marginBottom: 20,
          }}>
            ✓ Enneagram Assessment
          </span>
        </motion.div>

        <motion.h1 {...fade(0.4)} style={{
          fontFamily: display, fontSize: 28, fontWeight: 700,
          color: colors.textPrimary, letterSpacing: "-0.02em",
          margin: "0 0 16px 0",
        }}>
          You&rsquo;re in.
        </motion.h1>

        <motion.p {...fade(0.6)} style={{
          fontFamily: body, fontSize: 16, color: colors.textSecondary,
          lineHeight: 1.7, margin: "0 0 12px 0",
        }}>
          I&rsquo;ll send your IEQ9 assessment link within <strong style={{ color: colors.textPrimary }}>48 hours</strong>.
        </motion.p>

        <motion.p {...fade(0.7)} style={{
          fontFamily: body, fontSize: 15, color: colors.textMuted,
          lineHeight: 1.7, margin: "0 0 36px 0",
        }}>
          In the meantime, you can keep working through your program &mdash; the Enneagram results will deepen every exercise once they&rsquo;re in.
        </motion.p>

        <motion.div {...fade(0.9)}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              fontFamily: display, fontSize: 15, fontWeight: 600,
              padding: "14px 36px", borderRadius: 8,
              backgroundColor: colors.coral, color: "#ffffff",
              border: "none", cursor: "pointer",
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
