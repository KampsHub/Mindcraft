"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const body = fonts.bodyAlt;

interface ForTomorrowData {
  watch_for?: string;
  try_this?: string;
  sit_with?: string;
}

interface ForTomorrowCardProps {
  forTomorrow: ForTomorrowData;
}

export default function ForTomorrowCard({ forTomorrow }: ForTomorrowCardProps) {
  if (!forTomorrow) return null;

  const { watch_for, try_this, sit_with } = forTomorrow;

  // Don't render if all fields are empty
  if (!watch_for && !try_this && !sit_with) return null;

  const items = [
    { icon: "\uD83D\uDC41", label: "Watch for", text: watch_for },
    { icon: "\uD83D\uDD04", label: "Try this", text: try_this },
    { icon: "\uD83D\uDCAD", label: "Sit with", text: sit_with },
  ].filter((item) => item.text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "16px 20px",
        backgroundColor: colors.bgSurface,
        borderRadius: 12,
        border: `1px solid ${colors.borderDefault}`,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          margin: "0 0 12px 0",
          fontFamily: body,
          fontWeight: 500,
        }}
      >
        From yesterday&apos;s closing:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 15,
                lineHeight: "1.4",
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {item.icon}
            </span>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: fonts.display,
                }}
              >
                {item.label}:
              </span>
              <p
                style={{
                  fontSize: 14,
                  color: colors.textBody,
                  margin: "2px 0 0 0",
                  lineHeight: 1.55,
                  fontFamily: body,
                }}
              >
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
