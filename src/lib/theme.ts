/**
 * Mindcraft — Design System
 * Brand of All Minds on Deck
 * Dark-first, plum + coral, warm neutral typography.
 */

// ── Colors ──

export const colors = {
  // Backgrounds (dark-first, neutral gray)
  bgDeep: "#18181C",       // Page background
  bgRecessed: "#26262C",   // Bottom nav tiles, subtle containers
  bgInput: "#28282E",      // Text inputs, recessed fields
  bgSurface: "#333339",    // Cards, panels, main content areas
  bgElevated: "#3E3E46",   // Active nav, hover states, popovers
  bgLight: "#F0EDE6",      // Light sections for contrast (warm white)

  // Text — all on the dark-first canvas. Per CLAUDE.md visual standard:
  // "All text on authenticated pages: white (#ffffff), not grey."
  // textMuted is intentionally close to textPrimary so even "muted" text
  // stays legible — use opacity at the call site for explicit de-emphasis.
  textPrimary: "#F5F2EB",  // Headings, primary content (warm white)
  textSecondary: "#EBE8E0", // Subtitles, labels, nav links (warm near-white)
  textBody: "#EBE8E0",     // Body text on cards (warm near-white)
  textMuted: "#D8D4CC",    // Section labels, hints, metadata (legible warm light)

  // Accent: Warm Ochre
  coralLight: "#D4A84E",
  coral: "#C4943A",
  coralPressed: "#A67A2A",
  coralOnDark: "#6B5020",
  coralWash: "rgba(196, 148, 58, 0.12)",

  // Accent: Navy (depth + reflection)
  plumLight: "#7B9AAD",
  plum: "#3D6278",
  plumPressed: "#2E4D62",
  plumDeep: "#1B3345",
  plumWash: "rgba(61, 98, 120, 0.15)",

  // Borders
  borderSubtle: "#2C2C30",  // Nav dividers, section separators
  borderDefault: "#44444C", // Card dividers, input borders

  // Semantic
  success: "#6AB282",
  successWash: "rgba(106, 178, 130, 0.12)",
  warning: "#D6B65D",
  warningWash: "rgba(214, 182, 93, 0.12)",
  error: "#D25858",
  errorWash: "rgba(210, 88, 88, 0.12)",
};

// ── Fonts ──

export const fonts = {
  body: "var(--font-space-grotesk), 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  display: "var(--font-sora), 'Sora', -apple-system, sans-serif",
  bodyAlt: "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif",
  serif: "var(--font-playfair), 'Playfair Display', Georgia, 'Times New Roman', serif",
};

// ── Spacing (4-point grid) ──

export const space = {
  0: 0,
  1: 4,    // tight: inline icon gaps
  2: 8,    // compact: between related items
  3: 12,   // default gap: between list items
  4: 16,   // section gap: between cards
  5: 24,   // content padding
  6: 32,   // section separation
  7: 48,   // major section break
  8: 64,   // page-level spacing
} as const;

// ── Typography scale ──

export const text = {
  // Page titles, hero text
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: 700 as const,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },
  // Section headings, card titles
  heading: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: 700 as const,
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  // Body text, instructions, journal content
  // Per CLAUDE.md: "Body text: minimum 15-16px"
  body: {
    fontFamily: fonts.bodyAlt,
    fontSize: 16,
    fontWeight: 400 as const,
    lineHeight: 1.7,
  },
  // Secondary info, subtitles, metadata
  // Bumped from 13 → 14 per testing feedback ("some of these font
  // sizes are too small. Make sure across the entire post login
  // experience, that the fonts are not that small.")
  secondary: {
    fontFamily: fonts.bodyAlt,
    fontSize: 14,
    fontWeight: 500 as const,
    lineHeight: 1.6,
  },
  // Small labels, badges, timestamps
  // Bumped from 11 → 12 with bolder weight for readability.
  caption: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: 700 as const,
    lineHeight: 1.4,
    letterSpacing: "0.04em",
  },
} as const;

// ── Border radius ──

export const radii = {
  sm: 8,      // small buttons, tags
  md: 12,     // cards, inputs
  lg: 16,     // panels, modals
  full: 9999, // pills, avatars
} as const;

// ── Elevation / shadows ──

export const shadow = {
  none: "none",
  sm: "0 1px 3px rgba(0,0,0,0.2)",
  md: "0 4px 12px rgba(0,0,0,0.25)",
  lg: "0 8px 24px rgba(0,0,0,0.3)",
} as const;

// ── Layout containers ──

export const layout = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: `0 ${space[5]}px`,
    fontFamily: fonts.body,
  } as React.CSSProperties,

  pageWide: {
    maxWidth: 960,
    margin: "0 auto",
    padding: `0 ${space[5]}px`,
    fontFamily: fonts.body,
  } as React.CSSProperties,
};

// ── Button presets ──

export const button = {
  primary: {
    padding: `${space[3]}px ${space[6]}px`,
    fontSize: text.body.fontSize,
    fontWeight: 600,
    color: colors.bgDeep,
    backgroundColor: colors.coral,
    border: "none",
    borderRadius: radii.full,
    cursor: "pointer",
    transition: "background-color 0.15s",
  } as React.CSSProperties,

  secondary: {
    padding: `${space[3]}px ${space[6]}px`,
    fontSize: text.body.fontSize,
    fontWeight: 600,
    color: colors.coral,
    backgroundColor: colors.bgSurface,
    border: `2px solid ${colors.coral}`,
    borderRadius: radii.full,
    cursor: "pointer",
    transition: "all 0.15s",
  } as React.CSSProperties,

  ghost: {
    padding: `${space[2]}px ${space[4]}px`,
    fontSize: text.secondary.fontSize,
    color: colors.textMuted,
    backgroundColor: "transparent",
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radii.sm,
    cursor: "pointer",
  } as React.CSSProperties,

  link: {
    fontSize: text.secondary.fontSize,
    color: colors.textMuted,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  } as React.CSSProperties,
};

// ── Card preset ──

export const card = {
  padding: space[5],
  backgroundColor: colors.bgSurface,
  borderRadius: radii.md,
  border: `1px solid ${colors.borderDefault}`,
} as React.CSSProperties;
