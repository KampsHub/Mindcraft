"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/* ── StaggerContainer ────────────────────────────────────────
 *  Wraps children in a staggered fade-up reveal.
 *  Each direct child using `staggerChildVariants` will animate
 *  in sequence with the configured interval.
 */

interface StaggerContainerProps {
  children: ReactNode;
  staggerInterval?: number;
  delayChildren?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerInterval: number; delayChildren: number }) => ({
    transition: {
      staggerChildren: custom.staggerInterval,
      delayChildren: custom.delayChildren,
    },
  }),
};

export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function StaggerContainer({
  children,
  staggerInterval = 0.12,
  delayChildren = 0,
  className,
  style,
  onComplete,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={containerVariants}
      custom={{ staggerInterval, delayChildren }}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
