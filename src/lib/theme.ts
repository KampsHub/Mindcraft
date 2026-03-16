/**
 * Mindcraft — Design Tokens
 * Brand of All Minds on Deck
 * Option E extended: Dark-first, plum + coral, warm neutral typography.
 * Font: Space Grotesk (closest match to roc-grotesk)
 */

export const colors = {
  // ── Backgrounds (dark-first, neutral gray) ──
  bgDeep: "#18181C",       // Page background
  bgRecessed: "#26262C",   // Bottom nav tiles, subtle containers
  bgInput: "#28282E",      // Text inputs, recessed fields
  bgSurface: "#333339",    // Cards, panels, main content areas
  bgElevated: "#3E3E46",   // Active nav, hover states, popovers

  // ── Text ──
  textPrimary: "#E4DDE2",  // Headings, primary content
  textSecondary: "#B5ADB6", // Subtitles, labels, nav links
  textBody: "#D0C9CF",     // Body text on cards
  textMuted: "#99929B",    // Section labels, hints, metadata

  // ── Accent: Coral (action + progress) ──
  coralLight: "#F4B5A9",
  coral: "#E09585",
  coralPressed: "#B56E5E",
  coralOnDark: "#6B3F37",  // Text on dark backgrounds
  coralWash: "rgba(224, 149, 133, 0.12)",

  // ── Accent: Plum (depth + reflection) ──
  plumLight: "#B08DAD",
  plum: "#7B5278",
  plumPressed: "#5C3D5A",
  plumDeep: "#3D2840",
  plumWash: "rgba(123, 82, 120, 0.15)",

  // ── Borders ──
  borderSubtle: "#2C2C30",  // Nav dividers, section separators
  borderDefault: "#44444C", // Card dividers, input borders

  // ── Semantic ──
  success: "#6AB282",
  successWash: "rgba(106, 178, 130, 0.12)",
  warning: "#D6B65D",
  warningWash: "rgba(214, 182, 93, 0.12)",
  error: "#D25858",
  errorWash: "rgba(210, 88, 88, 0.12)",

  // ── Legacy aliases (for gradual migration) ──
  primary: "#E09585",
  primaryDark: "#B56E5E",
  primaryLight: "#F4B5A9",
  primaryMuted: "rgba(224, 149, 133, 0.12)",
  accent: "#7B5278",
  accentLight: "rgba(123, 82, 120, 0.15)",
  cream: "#333339",
  black: "#E4DDE2",
  dark: "#D0C9CF",
  gray700: "#B5ADB6",
  gray600: "#B5ADB6",
  gray500: "#99929B",
  gray400: "#99929B",
  gray300: "#44444C",
  gray200: "#2C2C30",
  gray100: "#26262C",
  gray50: "#18181C",
  white: "#333339",
  successLight: "rgba(106, 178, 130, 0.12)",
  errorLight: "rgba(210, 88, 88, 0.12)",
  warningLight: "rgba(214, 182, 93, 0.12)",
};

export const fonts = {
  body: "var(--font-space-grotesk), 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  display: "var(--font-sora), 'Sora', -apple-system, sans-serif",
  bodyAlt: "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif",
  serif: "var(--font-playfair), 'Playfair Display', Georgia, 'Times New Roman', serif",
};

/** Shared container styles */
export const layout = {
  page: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "0 24px",
    fontFamily: fonts.body,
  } as React.CSSProperties,

  pageWide: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "0 24px",
    fontFamily: fonts.body,
  } as React.CSSProperties,
};

/** Reusable button styles */
export const button = {
  primary: {
    padding: "12px 28px",
    fontSize: 15,
    fontWeight: 600,
    color: colors.white,
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.15s",
  } as React.CSSProperties,

  secondary: {
    padding: "12px 28px",
    fontSize: 15,
    fontWeight: 600,
    color: colors.primary,
    backgroundColor: colors.white,
    border: `2px solid ${colors.primary}`,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  } as React.CSSProperties,

  ghost: {
    padding: "8px 16px",
    fontSize: 13,
    color: colors.gray500,
    backgroundColor: "transparent",
    border: `1px solid ${colors.gray200}`,
    borderRadius: 6,
    cursor: "pointer",
  } as React.CSSProperties,

  link: {
    fontSize: 14,
    color: colors.gray500,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  } as React.CSSProperties,
};

/** Card style */
export const card = {
  padding: 24,
  backgroundColor: colors.bgSurface,
  borderRadius: 14,
  border: `1px solid ${colors.borderDefault}`,
} as React.CSSProperties;
