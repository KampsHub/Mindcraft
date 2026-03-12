import { colors } from "@/lib/theme";

/**
 * Mindcraft Ninja logo — ninja silhouette inside a thin circle,
 * inspired by the All Minds on Deck circular logo aesthetic.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft Ninja logo"
    >
      {/* Thin circle — matches AMOD logo style */}
      <circle
        cx="24"
        cy="24"
        r="22.5"
        stroke={colors.black}
        strokeWidth="1.2"
      />

      {/* Ninja head — hooded silhouette */}
      <path
        d="M24 10 C17 10 13 15 13 20 C13 23 14.5 25.5 17 27 L17 32 C17 34 19 36 24 36 C29 36 31 34 31 32 L31 27 C33.5 25.5 35 23 35 20 C35 15 31 10 24 10Z"
        fill={colors.black}
      />

      {/* Mask band across eyes */}
      <rect
        x="14.5"
        y="18"
        width="19"
        height="5.5"
        rx="2.5"
        fill={colors.primary}
      />

      {/* Left eye */}
      <ellipse cx="19.5" cy="20.8" rx="2" ry="1.3" fill="white" />
      <ellipse cx="19.8" cy="20.8" rx="0.9" ry="0.9" fill={colors.black} />

      {/* Right eye */}
      <ellipse cx="28.5" cy="20.8" rx="2" ry="1.3" fill="white" />
      <ellipse cx="28.8" cy="20.8" rx="0.9" ry="0.9" fill={colors.black} />

      {/* Mask tie flowing right */}
      <path
        d="M33.5 19.5 Q37 18 39 20 Q37 22 33.5 23.5"
        stroke={colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Wordmark: Logo + "Mindcraft Ninja" text — AMOD-style thin weight */
export function LogoWithText({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={size} />
      <span style={{
        fontSize: size * 0.47,
        fontWeight: 300,
        color: colors.black,
        letterSpacing: "0.02em",
      }}>
        Mindcraft Ninja
      </span>
    </div>
  );
}
