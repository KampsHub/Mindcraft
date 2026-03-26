"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface CrisisBannerProps {
  /** Called when user clicks "I'm okay -- continue" */
  onDismiss: () => void;
  /** Enrollment ID for logging */
  enrollmentId: string;
  /** Day number for logging */
  dayNumber: number;
  /** Where this was triggered from */
  source: "process-journal" | "daily-summary";
}

export default function CrisisBanner({
  onDismiss,
  enrollmentId,
  dayNumber,
  source,
}: CrisisBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  async function handleDismiss() {
    // Log the dismissal interaction
    try {
      await fetch("/api/crisis-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          dayNumber,
          source,
          action: "dismissed",
        }),
      });
    } catch {
      // Non-blocking -- logging failure should not prevent dismissal
    }
    setDismissed(true);
    onDismiss();
  }

  async function handleGetHelp() {
    // Log that user clicked "Get help now"
    try {
      await fetch("/api/crisis-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          dayNumber,
          source,
          action: "get-help-clicked",
        }),
      });
    } catch {
      // Non-blocking
    }
    window.open("tel:988", "_blank");
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: colors.coralWash,
            border: `1px solid ${colors.coral}`,
            borderRadius: 14,
            padding: "24px 22px",
            marginBottom: 20,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: "rgba(224, 149, 133, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}>
              {/* Warning icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <h3 style={{
              fontFamily: display,
              fontSize: 16,
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
              letterSpacing: "-0.01em",
            }}>
              We noticed something important
            </h3>
          </div>

          {/* Body text */}
          <p style={{
            fontSize: 14,
            color: colors.textBody,
            lineHeight: 1.65,
            margin: "0 0 20px 0",
            fontFamily: body,
          }}>
            What you wrote carries real weight, and it deserves more than exercises can hold right now.
            Please reach out to someone who can be fully present with you.
          </p>

          {/* Resources */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 22,
          }}>
            {/* 988 Lifeline */}
            <a
              href="tel:988"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                backgroundColor: "rgba(224, 149, 133, 0.08)",
                borderRadius: 12,
                border: `1px solid rgba(224, 149, 133, 0.18)`,
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{
                fontSize: 18,
                lineHeight: 1,
                flexShrink: 0,
                marginTop: 1,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div>
                <p style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: "0 0 2px 0",
                  fontFamily: display,
                }}>
                  988 Suicide &amp; Crisis Lifeline
                </p>
                <p style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: body,
                }}>
                  Call or text <strong style={{ color: colors.coral }}>988</strong> &mdash; free, confidential, 24/7
                </p>
              </div>
            </a>

            {/* Crisis Text Line */}
            <a
              href="sms:741741&body=HOME"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                backgroundColor: "rgba(224, 149, 133, 0.08)",
                borderRadius: 12,
                border: `1px solid rgba(224, 149, 133, 0.18)`,
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{
                fontSize: 18,
                lineHeight: 1,
                flexShrink: 0,
                marginTop: 1,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <div>
                <p style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: "0 0 2px 0",
                  fontFamily: display,
                }}>
                  Crisis Text Line
                </p>
                <p style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: body,
                }}>
                  Text <strong style={{ color: colors.coral }}>HOME</strong> to <strong style={{ color: colors.coral }}>741741</strong>
                </p>
              </div>
            </a>

            {/* Coach email */}
            <a
              href="mailto:crew@allmindsondeck.com?subject=Reaching%20out%20from%20Mindcraft"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                backgroundColor: "rgba(224, 149, 133, 0.08)",
                borderRadius: 12,
                border: `1px solid rgba(224, 149, 133, 0.18)`,
                textDecoration: "none",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{
                fontSize: 18,
                lineHeight: 1,
                flexShrink: 0,
                marginTop: 1,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <div>
                <p style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  margin: "0 0 2px 0",
                  fontFamily: display,
                }}>
                  Your coach, Stefanie
                </p>
                <p style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  margin: 0,
                  fontFamily: body,
                }}>
                  crew@allmindsondeck.com
                </p>
              </div>
            </a>
          </div>

          {/* Action buttons */}
          <div style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleDismiss}
              style={{
                padding: "11px 22px",
                fontSize: 13,
                fontWeight: 600,
                color: colors.textSecondary,
                backgroundColor: "rgba(224, 149, 133, 0.10)",
                border: `1px solid rgba(224, 149, 133, 0.25)`,
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: display,
                letterSpacing: "0.01em",
                transition: "background-color 0.15s",
              }}
            >
              I&rsquo;m okay &mdash; continue
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGetHelp}
              style={{
                padding: "11px 22px",
                fontSize: 13,
                fontWeight: 700,
                color: colors.bgDeep,
                backgroundColor: colors.coral,
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: display,
                letterSpacing: "0.01em",
              }}
            >
              Get help now
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
