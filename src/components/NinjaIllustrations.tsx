"use client";

import { colors } from "@/lib/theme";

/**
 * Monochrome ninja illustrations — chibi-style mascots in black & white.
 * Used across cards, empty states, and feature sections.
 */

/* ── Palette (B&W on dark background) ── */
const INK = "#E4DDE2";        // light "white" on dark
const INK_MED = "#B5ADB6";    // mid-tone
const INK_DIM = "#99929B";    // muted
const DARK = "#1c1917";       // true dark for fills
const SURFACE = "#333339";    // card surface
const ELEVATED = "#3E3E46";   // elevated

function NinjaBase({
  size,
  children,
}: {
  size: number;
  children?: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Round head */}
      <circle cx="40" cy="36" r="22" fill={INK} />
      {/* Mask band */}
      <rect x="20" y="29" width="40" height="11" rx="5.5" fill={DARK} />
      {/* Left eye */}
      <ellipse cx="32" cy="34.5" rx="4" ry="3" fill="white" />
      <circle cx="33" cy="34.5" r="1.8" fill={DARK} />
      <circle cx="34.2" cy="33.2" r="0.7" fill="white" />
      {/* Right eye */}
      <ellipse cx="48" cy="34.5" rx="4" ry="3" fill="white" />
      <circle cx="49" cy="34.5" r="1.8" fill={DARK} />
      <circle cx="50.2" cy="33.2" r="0.7" fill="white" />
      {/* Mask tie */}
      <path
        d="M60 32 Q66 29 68 34 Q66 39 60 37"
        stroke={DARK}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Body */}
      <ellipse cx="40" cy="64" rx="14" ry="10" fill={INK} opacity={0.85} />
      {children}
    </svg>
  );
}

/** Ninja with journal — journaling features */
export function NinjaWriter({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <rect x="26" y="52" width="16" height="20" rx="2" fill={DARK} />
      <rect x="28" y="54" width="12" height="16" rx="1" fill={INK_DIM} opacity={0.2} />
      <line x1="30" y1="58" x2="38" y2="58" stroke={INK_DIM} strokeWidth="1" opacity={0.5} />
      <line x1="30" y1="61" x2="36" y2="61" stroke={INK_DIM} strokeWidth="1" opacity={0.5} />
      <line x1="30" y1="64" x2="37" y2="64" stroke={INK_DIM} strokeWidth="1" opacity={0.5} />
      <line x1="50" y1="50" x2="56" y2="42" stroke={INK_MED} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="56.5" cy="41.5" r="1.5" fill={INK} />
    </NinjaBase>
  );
}

/** Ninja with glasses — analysis features */
export function NinjaAnalyst({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <circle cx="32" cy="34" r="6" stroke={INK_MED} strokeWidth="1.8" fill="none" />
      <circle cx="48" cy="34" r="6" stroke={INK_MED} strokeWidth="1.8" fill="none" />
      <line x1="38" y1="34" x2="42" y2="34" stroke={INK_MED} strokeWidth="1.8" />
      <line x1="26" y1="34" x2="22" y2="32" stroke={INK_MED} strokeWidth="1.5" />
      <line x1="54" y1="34" x2="58" y2="32" stroke={INK_MED} strokeWidth="1.5" />
      <rect x="48" y="54" width="14" height="11" rx="2" fill={DARK} />
      <polyline points="50,62 53,59 56,61 59,56" stroke={INK} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </NinjaBase>
  );
}

/** Ninja meditating — chibi style with big head, recognizable at small sizes */
export function NinjaMeditator({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* ── Big chibi head (60% of height) ── */}
      <circle cx="40" cy="30" r="22" fill={INK} />
      {/* Headband — dark band across forehead */}
      <rect x="18" y="22" width="44" height="8" rx="4" fill={DARK} />
      {/* Headband knot + flowing tail */}
      <circle cx="60" cy="26" r="3.5" fill={DARK} />
      <path d="M63 25 Q68 20 70 26 Q68 31 66 28" stroke={DARK} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M69 25 Q73 22 74 27" stroke={DARK} strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Happy closed eyes — ^_^ style */}
      <path d="M30 30 Q33 34 36 30" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M44 30 Q47 34 50 30" stroke={DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Blush marks — cute detail */}
      <ellipse cx="28" cy="34" rx="3" ry="1.5" fill={INK_MED} opacity={0.35} />
      <ellipse cx="52" cy="34" rx="3" ry="1.5" fill={INK_MED} opacity={0.35} />
      {/* Mask covering nose/mouth */}
      <path d="M28 35 Q40 44 52 35 L52 40 Q40 48 28 40 Z" fill={DARK} />
      {/* ── Small compact body ── */}
      <path d="M32 50 Q40 48 48 50 L50 60 Q40 62 30 60 Z" fill={INK} opacity={0.85} />
      {/* Cross-legged base */}
      <ellipse cx="40" cy="64" rx="14" ry="5" fill={INK} opacity={0.7} />
      <path d="M28 62 Q32 68 38 64" stroke={INK_DIM} strokeWidth="1.2" fill="none" opacity={0.4} />
      <path d="M52 62 Q48 68 42 64" stroke={INK_DIM} strokeWidth="1.2" fill="none" opacity={0.4} />
      {/* Hands together — meditation mudra */}
      <ellipse cx="40" cy="57" rx="5" ry="3.5" fill={INK} />
      <path d="M36 56 Q40 59 44 56" stroke={INK_DIM} strokeWidth="1" fill="none" opacity={0.3} />
    </svg>
  );
}

/** Ninja with laptop — tech features */
export function NinjaHacker({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <rect x="24" y="56" width="32" height="18" rx="3" fill={DARK} />
      <rect x="26" y="48" width="28" height="16" rx="2" fill={ELEVATED} />
      <rect x="28" y="50" width="24" height="12" rx="1" fill={DARK} />
      <line x1="30" y1="53" x2="38" y2="53" stroke={INK_MED} strokeWidth="1" opacity={0.6} />
      <line x1="30" y1="56" x2="42" y2="56" stroke={INK_DIM} strokeWidth="1" opacity={0.6} />
      <line x1="30" y1="59" x2="36" y2="59" stroke={INK_MED} strokeWidth="1" opacity={0.6} />
    </NinjaBase>
  );
}

/** Ninja with shield — privacy features */
export function NinjaGuard({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <path
        d="M42 50 L56 54 L56 66 Q56 72 42 76 Q28 72 28 66 L28 54 Z"
        fill={DARK}
      />
      <path
        d="M42 54 L52 57 L52 65 Q52 69 42 72 Q32 69 32 65 L32 57 Z"
        fill={INK_DIM}
        opacity={0.15}
      />
      <rect x="38" y="61" width="8" height="6" rx="1" fill={INK} />
      <path d="M40 61 L40 58 Q40 55 42 55 Q44 55 44 58 L44 61" stroke={INK} strokeWidth="1.5" fill="none" />
    </NinjaBase>
  );
}

/** Ninja waving — welcome/onboarding */
export function NinjaWelcome({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <circle cx="62" cy="26" r="5" fill={INK} />
      <line x1="56" y1="40" x2="62" y2="28" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="26" cy="38" rx="3" ry="1.5" fill={INK_DIM} opacity={0.2} />
      <ellipse cx="54" cy="38" rx="3" ry="1.5" fill={INK_DIM} opacity={0.2} />
      <path d="M29 34 Q32 31 35 34" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 34 Q48 31 51 34" stroke={DARK} strokeWidth="2" fill="none" strokeLinecap="round" />
    </NinjaBase>
  );
}

/** Ninja with compass — direction/goals */
export function NinjaNavigator({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <circle cx="56" cy="52" r="9" fill={DARK} stroke={INK_DIM} strokeWidth="1.5" />
      <circle cx="56" cy="52" r="6" fill={ELEVATED} />
      <line x1="56" y1="47" x2="56" y2="52" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="52" x2="56" y2="57" stroke={INK_DIM} strokeWidth="2" strokeLinecap="round" />
      <circle cx="56" cy="52" r="1.5" fill={INK} />
      <text x="54" y="46" fontSize="5" fill={INK} fontWeight="bold">N</text>
    </NinjaBase>
  );
}

/** Ninja with heart — coaching/support */
export function NinjaCoach({ size = 80 }: { size?: number }) {
  return (
    <NinjaBase size={size}>
      <path
        d="M40 16 Q40 12 44 12 Q48 12 48 16 Q48 20 40 24 Q32 20 32 16 Q32 12 36 12 Q40 12 40 16"
        fill={INK_MED}
      />
      <path d="M36 41 Q40 44 44 41" stroke={INK} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity={0.3} />
      <line x1="22" y1="56" x2="16" y2="50" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="56" x2="64" y2="50" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </NinjaBase>
  );
}

/** Boxed ninja — in a card container with optional label */
export function NinjaBox({
  ninja,
  label,
  size = 120,
}: {
  ninja: React.ReactNode;
  label?: string;
  size?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 20,
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        {ninja}
      </div>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: colors.textMuted,
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
