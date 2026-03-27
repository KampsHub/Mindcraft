"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { colors } from "@/lib/theme";

interface ContentCardProps {
  variant: "hero" | "standard" | "subtle" | "highlight";
  children: ReactNode;
  delay?: number;
}

const variantStyles = {
  hero: {
    backgroundColor: "transparent",
    border: "none",
    padding: "32px 0",
    borderRadius: 0,
  },
  standard: {
    backgroundColor: colors.bgSurface,
    border: `1px solid ${colors.borderDefault}`,
    padding: "28px",
    borderRadius: 14,
  },
  subtle: {
    backgroundColor: "transparent",
    border: "none",
    borderTop: `1px solid rgba(255,255,255,0.06)`,
    padding: "24px 0",
    borderRadius: 0,
  },
  highlight: {
    backgroundColor: "rgba(224, 149, 133, 0.06)",
    border: "none",
    borderLeft: `3px solid ${colors.coral}`,
    padding: "20px 24px",
    borderRadius: 12,
  },
};

export default function ContentCard({ variant, children, delay = 0 }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      style={variantStyles[variant] as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}
