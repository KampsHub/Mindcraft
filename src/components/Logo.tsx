import { colors } from "@/lib/theme";

/**
 * Mindcraft Ninja logo — ninja + text inside a thin circle,
 * inspired by the All Minds on Deck circular wordmark.
 *
 * Full logo: ninja silhouette top, "Mindcraft" + "NINJA" below.
 * Icon logo: just the ninja in a smaller circle.
 */

/** Full logo: ninja + wordmark inside circle */
export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft Ninja logo"
      overflow="hidden"
    >
      {/* Thin circle */}
      <circle
        cx="100"
        cy="100"
        r="94"
        stroke={colors.black}
        strokeWidth="1.5"
      />

      {/* Clip everything to the circle */}
      <defs>
        <clipPath id="logo-clip">
          <circle cx="100" cy="100" r="93" />
        </clipPath>
      </defs>

      <g clipPath="url(#logo-clip)">
        {/* ── Ninja head — upper half of circle ── */}
        <g transform="translate(100, 58) scale(0.82)">
          {/* Head silhouette */}
          <path
            d="M0 -30 C-14 -30 -20 -21 -20 -12 C-20 -6.5 -17.5 -3 -13 0 L-13 8 C-13 11 -10 14 0 14 C10 14 13 11 13 8 L13 0 C17.5 -3 20 -6.5 20 -12 C20 -21 14 -30 0 -30Z"
            fill={colors.black}
          />
          {/* Mask band */}
          <rect x="-18" y="-16" width="36" height="9" rx="4.5" fill={colors.primary} />
          {/* Left eye */}
          <ellipse cx="-8" cy="-11.5" rx="3.2" ry="2.2" fill="white" />
          <ellipse cx="-7" cy="-11.5" rx="1.4" ry="1.4" fill={colors.black} />
          {/* Right eye */}
          <ellipse cx="8" cy="-11.5" rx="3.2" ry="2.2" fill="white" />
          <ellipse cx="9" cy="-11.5" rx="1.4" ry="1.4" fill={colors.black} />
          {/* Mask tie flowing right */}
          <path
            d="M18 -14 Q24 -16.5 28 -13 Q24 -9.5 18 -8"
            stroke={colors.primary}
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* ── Text — lower half ── */}
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fill={colors.black}
          fontFamily="'Space Grotesk', sans-serif"
          fontSize="30"
          fontWeight="300"
          letterSpacing="0.5"
        >
          Mindcraft
        </text>
        <text
          x="100"
          y="156"
          textAnchor="middle"
          fill={colors.black}
          fontFamily="'Space Grotesk', sans-serif"
          fontSize="18"
          fontWeight="600"
          letterSpacing="6"
        >
          NINJA
        </text>
      </g>
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
