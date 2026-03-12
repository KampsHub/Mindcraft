import { colors } from "@/lib/theme";

/**
 * Mindcraft logo — circular mark inspired by the AMOD aesthetic.
 * A coral circle with thin outer ring and a clean geometric M
 * that suggests both a mind (two hemispheres) and craft (precision).
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mindcraft logo"
    >
      {/* Thin outer ring — mirrors AMOD's circular border */}
      <circle cx="20" cy="20" r="19.2" stroke={colors.primary} strokeWidth="1" opacity="0.35" />
      {/* Main circle */}
      <circle cx="20" cy="20" r="16" fill={colors.primary} />
      {/* Geometric M — two peaks meeting at center */}
      <path
        d="M11 27 L11 14 L20 23 L29 14 L29 27"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Wordmark: Logo + "Mindcraft" text */
export function LogoWithText({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Logo size={size} />
      <span style={{
        fontSize: size * 0.47,
        fontWeight: 600,
        color: colors.black,
        letterSpacing: "-0.01em",
      }}>
        Mindcraft
      </span>
    </div>
  );
}
