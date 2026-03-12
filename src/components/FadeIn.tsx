"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

/* ── Enhanced FadeIn ─────────────────────────────────────────
 *  Scroll-triggered reveal with multiple animation presets.
 *  Set triggerOnMount=true for above-the-fold hero content.
 */

type AnimationPreset =
  | "fade"       // Simple opacity
  | "slide-up"   // Slide up
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"      // Scale from small to full
  | "blur"       // Blur to sharp
  | "pop"        // Overshoot scale (spring)
  | "rise"       // Large upward movement + slight rotation
  | "flip";      // Slight 3D rotation

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  preset?: AnimationPreset;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  style?: React.CSSProperties;
  once?: boolean;
  triggerOnMount?: boolean;  // true = animate immediately, false = on scroll
}

function getInitial(preset: AnimationPreset) {
  switch (preset) {
    case "fade":        return { opacity: 0 };
    case "slide-up":    return { opacity: 0, y: 60 };
    case "slide-down":  return { opacity: 0, y: -40 };
    case "slide-left":  return { opacity: 0, x: 60 };
    case "slide-right": return { opacity: 0, x: -60 };
    case "scale":       return { opacity: 0, scale: 0.85 };
    case "blur":        return { opacity: 0, filter: "blur(12px)", y: 20 };
    case "pop":         return { opacity: 0, scale: 0.5 };
    case "rise":        return { opacity: 0, y: 80, rotate: -2 };
    case "flip":        return { opacity: 0, rotateX: -15, y: 30 };
  }
}

function getAnimate(preset: AnimationPreset) {
  switch (preset) {
    case "fade":        return { opacity: 1 };
    case "slide-up":    return { opacity: 1, y: 0 };
    case "slide-down":  return { opacity: 1, y: 0 };
    case "slide-left":  return { opacity: 1, x: 0 };
    case "slide-right": return { opacity: 1, x: 0 };
    case "scale":       return { opacity: 1, scale: 1 };
    case "blur":        return { opacity: 1, filter: "blur(0px)", y: 0 };
    case "pop":         return { opacity: 1, scale: 1 };
    case "rise":        return { opacity: 1, y: 0, rotate: 0 };
    case "flip":        return { opacity: 1, rotateX: 0, y: 0 };
  }
}

function directionToPreset(direction: string): AnimationPreset {
  switch (direction) {
    case "up":    return "slide-up";
    case "down":  return "slide-down";
    case "left":  return "slide-left";
    case "right": return "slide-right";
    default:      return "fade";
  }
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  preset,
  direction,
  className,
  style,
  once = true,
  triggerOnMount = false,
}: FadeInProps) {
  const resolvedPreset = preset || (direction ? directionToPreset(direction) : "slide-up");

  const isPop = resolvedPreset === "pop";
  const transition = isPop
    ? { type: "spring" as const, stiffness: 300, damping: 20, delay }
    : { duration, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  // triggerOnMount: use animate (fires immediately on mount)
  // scroll: use whileInView (fires when scrolled into view)
  const animationProps = triggerOnMount
    ? { animate: getAnimate(resolvedPreset) }
    : { whileInView: getAnimate(resolvedPreset), viewport: { once, margin: "-60px" } };

  return (
    <motion.div
      initial={getInitial(resolvedPreset)}
      {...animationProps}
      transition={transition}
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
