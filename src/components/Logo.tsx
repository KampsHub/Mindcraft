import { colors } from "@/lib/theme";

/**
 * Mindcraft Ninja logo — ninja inside the upper part of a thin circle,
 * with "Mindcraft" + "NINJA" text below. AMOD-inspired wordmark.
 */

/** Full logo: ninja in upper circle, text below */
export default function Logo({ size = 90 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft Ninja logo"
    >
      {/* Circle — slightly bigger to give text room */}
      <circle
        cx="100"
        cy="100"
        r="97"
        stroke={colors.black}
        strokeWidth="1.5"
      />

      {/* ── Ninja head — starts in the upper part of the circle ── */}
      <g transform="translate(100, 52) scale(0.78)">
        {/* Head silhouette */}
        <path
          d="M0 -28 C-13 -28 -18 -20 -18 -11 C-18 -6 -16 -2.5 -12 0 L-12 7 C-12 10 -9 13 0 13 C9 13 12 10 12 7 L12 0 C16 -2.5 18 -6 18 -11 C18 -20 13 -28 0 -28Z"
          fill={colors.black}
        />
        {/* Mask band */}
        <rect x="-16" y="-15" width="32" height="8.5" rx="4" fill={colors.primary} />
        {/* Left eye */}
        <ellipse cx="-7" cy="-10.8" rx="3" ry="2" fill="white" />
        <ellipse cx="-6.2" cy="-10.8" rx="1.3" ry="1.3" fill={colors.black} />
        {/* Right eye */}
        <ellipse cx="7" cy="-10.8" rx="3" ry="2" fill="white" />
        <ellipse cx="7.8" cy="-10.8" rx="1.3" ry="1.3" fill={colors.black} />
        {/* Mask tie */}
        <path
          d="M16 -13 Q22 -15.5 26 -12 Q22 -8.5 16 -7"
          stroke={colors.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ── Text inside circle ── */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fill={colors.black}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="33"
        fontWeight="400"
        letterSpacing="0.5"
      >
        Mindcraft
      </text>
      <text
        x="100"
        y="155"
        textAnchor="middle"
        fill={colors.black}
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="19"
        fontWeight="400"
        letterSpacing="6"
      >
        NINJA
      </text>
    </svg>
  );
}

/** Icon-only logo — just the ninja in a circle (for small contexts / favicon) */
export function LogoIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft Ninja"
    >
      <circle cx="24" cy="24" r="22.5" stroke={colors.black} strokeWidth="1.6" />
      <path
        d="M24 8 C16 8 11.5 13.5 11.5 19.5 C11.5 23 13 25.5 16 27.5 L16 33 C16 35.5 18.5 38 24 38 C29.5 38 32 35.5 32 33 L32 27.5 C35 25.5 36.5 23 36.5 19.5 C36.5 13.5 32 8 24 8Z"
        fill={colors.black}
      />
      <rect x="13" y="17.5" width="22" height="6" rx="3" fill={colors.primary} />
      <ellipse cx="19" cy="20.5" rx="2.3" ry="1.5" fill="white" />
      <ellipse cx="19.4" cy="20.5" rx="1" ry="1" fill={colors.black} />
      <ellipse cx="29" cy="20.5" rx="2.3" ry="1.5" fill="white" />
      <ellipse cx="29.4" cy="20.5" rx="1" ry="1" fill={colors.black} />
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
