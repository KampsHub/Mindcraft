import { colors } from "@/lib/theme";

/**
 * Mindcraft Ninja logo — ninja silhouette inside a thin circle,
 * inspired by the All Minds on Deck circular logo aesthetic.
 */
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft Ninja logo"
    >
      {/* Circle — slightly thicker for presence */}
      <circle
        cx="24"
        cy="24"
        r="22.5"
        stroke={colors.black}
        strokeWidth="1.6"
      />

      {/* Ninja head — larger, fills more of the circle */}
      <path
        d="M24 8 C16 8 11.5 13.5 11.5 19.5 C11.5 23 13 25.5 16 27.5 L16 33 C16 35.5 18.5 38 24 38 C29.5 38 32 35.5 32 33 L32 27.5 C35 25.5 36.5 23 36.5 19.5 C36.5 13.5 32 8 24 8Z"
        fill={colors.black}
      />

      {/* Mask band across eyes — wider */}
      <rect
        x="13"
        y="17.5"
        width="22"
        height="6"
        rx="3"
        fill={colors.primary}
      />

      {/* Left eye */}
      <ellipse cx="19" cy="20.5" rx="2.3" ry="1.5" fill="white" />
      <ellipse cx="19.4" cy="20.5" rx="1" ry="1" fill={colors.black} />

      {/* Right eye */}
      <ellipse cx="29" cy="20.5" rx="2.3" ry="1.5" fill="white" />
      <ellipse cx="29.4" cy="20.5" rx="1" ry="1" fill={colors.black} />

      {/* Mask tie flowing right */}
      <path
        d="M35 19 Q38.5 17.5 41 19.5 Q38.5 21.5 35 23"
        stroke={colors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Wordmark: Logo + "Mindcraft Ninja" — tightly integrated */
export function LogoWithText({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={size} />
      <span style={{
        fontSize: size * 0.5,
        fontWeight: 300,
        color: colors.black,
        letterSpacing: "0.02em",
      }}>
        Mindcraft<span style={{ fontWeight: 600 }}> Ninja</span>
      </span>
    </div>
  );
}
