"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode, type CSSProperties } from "react";

/* ── Parallax Section ───────────────────────────────────────
 *  Content moves at a different speed than the scroll, creating
 *  a subtle depth effect like Squarespace/Framer sites.
 */

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;          // -50 to 50 — negative = moves against scroll
  style?: CSSProperties;
  className?: string;
}

export default function ParallaxSection({
  children,
  speed = -20,
  style,
  className,
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: "hidden" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
