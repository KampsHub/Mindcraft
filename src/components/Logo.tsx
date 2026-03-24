"use client";

import { colors, fonts } from "@/lib/theme";

/**
 * Minimal geometric mark — overlapping circles evoking a mind/craft metaphor.
 */
function LogoMark({ size }: { size: number }) {
  return (
    <img
      src="/mindcraft-logo.svg"
      alt=""
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}

/**
 * Mindcraft logo — geometric mark + typographic wordmark.
 */
export default function Logo({ size = 20 }: { size?: number }) {
  const iconSize = size * 4;
  return (
    <span
      aria-label="Mindcraft"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.35,
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <LogoMark size={iconSize} />
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: size * 1.2,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: colors.textPrimary }}>mindcraft</span>
      </span>
    </span>
  );
}

/** Compact icon for small contexts (favicon, mobile nav) */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-label="Mindcraft"
      style={{
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <LogoMark size={size} />
    </span>
  );
}
