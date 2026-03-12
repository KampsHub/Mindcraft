import { colors } from "@/lib/theme";

/**
 * Mindcraft logo — a brain/compass hybrid mark.
 * Two overlapping curves suggesting both a mind (organic shape)
 * and a compass needle (directional purpose).
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
      {/* Background circle */}
      <rect width="40" height="40" rx="10" fill={colors.primary} />

      {/* Brain/compass mark — stylised M made of two connected arcs */}
      <path
        d="M10 28 L10 18 C10 13 14 9 18 9 C22 9 22 14 20 17 C18 20 18 14 22 9 C26 9 30 13 30 18 L30 28"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Compass dot — center point of awareness */}
      <circle cx="20" cy="30" r="2" fill="white" />
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
