"use client";

import { colors, fonts } from "@/lib/theme";

/**
 * Minimal geometric mark — overlapping circles evoking a mind/craft metaphor.
 */
function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Plum circle — left */}
      <circle cx="12" cy="16" r="10" fill={colors.plum} opacity={0.85} />
      {/* Coral circle — right, overlapping */}
      <circle cx="20" cy="16" r="10" fill={colors.coral} opacity={0.85} />
      {/* Blend intersection */}
      <path
        d="M16.47 7.13A10 10 0 0 0 12 26a10 10 0 0 0 4.47-18.87Z"
        fill={colors.plumLight}
        opacity={0.5}
      />
    </svg>
  );
}

/**
 * Mindcraft logo — geometric mark + typographic wordmark.
 */
export default function Logo({ size = 20 }: { size?: number }) {
  const iconSize = size * 1.4;
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
          fontSize: size,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "baseline",
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
