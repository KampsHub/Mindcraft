/**
 * All Minds on Deck — Design Tokens
 * Derived from allmindsondeck.org brand
 */

export const colors = {
  // Primary — warm coral/salmon from AMOD brand
  primary: "#F08E80",
  primaryDark: "#D9725F",
  primaryLight: "#FFF5F2",
  primaryMuted: "#FDEAE6",

  // Neutrals
  black: "#1A1A1A",
  dark: "#2D2D2D",
  gray700: "#444",
  gray600: "#555",
  gray500: "#666",
  gray400: "#888",
  gray300: "#aaa",
  gray200: "#ddd",
  gray100: "#f0f0f0",
  gray50: "#f9f9f9",
  white: "#fff",

  // Semantic
  success: "#16a34a",
  successLight: "#dcfce7",
  error: "#dc2626",
  errorLight: "#fef2f2",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
};

export const fonts = {
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
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
  backgroundColor: colors.white,
  borderRadius: 12,
  border: `1px solid ${colors.gray100}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
} as React.CSSProperties;
