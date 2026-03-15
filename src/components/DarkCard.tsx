"use client";

import { motion } from "framer-motion";
import { colors } from "@/lib/theme";

interface DarkCardProps {
  children: React.ReactNode;
  hover?: boolean;
  hoverIntensity?: "subtle" | "medium" | "lift";
  padding?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const hoverMap = {
  subtle: { y: -2, borderColor: "rgba(224, 149, 133, 0.2)" },
  medium: { y: -4, borderColor: "rgba(224, 149, 133, 0.25)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
  lift: { y: -6, borderColor: "rgba(224, 149, 133, 0.25)", boxShadow: "0 12px 40px rgba(0,0,0,0.15)" },
};

export default function DarkCard({
  children,
  hover = true,
  hoverIntensity = "subtle",
  padding = 24,
  style,
  onClick,
}: DarkCardProps) {
  return (
    <motion.div
      whileHover={hover ? hoverMap[hoverIntensity] : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      onClick={onClick}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`,
        padding,
        cursor: onClick ? "pointer" : undefined,
        transition: "border-color 0.2s",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
