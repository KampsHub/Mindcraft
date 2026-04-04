"use client";

import { motion } from "framer-motion";
import { colors } from "@/lib/theme";

/* ── AnimatedCheckmark ───────────────────────────────────────
 *  SVG checkmark with path-draw animation.
 *  Set `animate={false}` to render the static completed state.
 */

interface AnimatedCheckmarkProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  delay?: number;
  animate?: boolean;
}

export default function AnimatedCheckmark({
  size = 16,
  color = colors.success,
  strokeWidth = 2.5,
  delay = 0,
  animate: shouldAnimate = true,
}: AnimatedCheckmarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.01, delay },
        }}
      />
    </svg>
  );
}
