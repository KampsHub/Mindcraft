"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

const variants = {
  coral: {
    bg: colors.coral,
    color: colors.bgDeep,
    shadow: "0 8px 30px rgba(224, 149, 133, 0.4)",
  },
  plum: {
    bg: colors.plum,
    color: colors.textPrimary,
    shadow: "0 8px 30px rgba(123, 82, 120, 0.4)",
  },
  ghost: {
    bg: colors.bgElevated,
    color: colors.textPrimary,
    shadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  success: {
    bg: colors.success,
    color: colors.bgDeep,
    shadow: "0 8px 30px rgba(106, 178, 130, 0.4)",
  },
};

const sizes = {
  sm: { padding: "8px 20px", fontSize: 12 },
  md: { padding: "11px 28px", fontSize: 14 },
  lg: { padding: "14px 36px", fontSize: 15 },
};

interface PillButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
  disabled?: boolean;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  style?: React.CSSProperties;
}

export default function PillButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "coral",
  size = "md",
  style,
}: PillButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.04, boxShadow: v.shadow } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: display,
        letterSpacing: "0.01em",
        color: disabled ? colors.textMuted : v.color,
        backgroundColor: disabled ? colors.bgElevated : v.bg,
        border: "none",
        borderRadius: 100,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color 0.2s",
        whiteSpace: "nowrap" as const,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
