"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";

/* ── Word-by-word text reveal ────────────────────────────────────
 *  Split text into words. Each word fades + slides up with a stagger.
 *  Set triggerOnMount=true for above-the-fold hero content.
 *
 *  Uses direct initial/animate on each span for maximum reliability.
 */

interface TextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  style?: CSSProperties;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  triggerOnMount?: boolean;
  highlight?: string;
  highlightColor?: string;
}

export default function TextReveal({
  text,
  as: Tag = "p",
  style,
  className,
  delay = 0,
  stagger = 0.04,
  duration = 0.5,
  once = true,
  triggerOnMount = false,
  highlight,
  highlightColor = "#3b82f6",
}: TextRevealProps) {
  const words = text.split(" ");
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  // Determine if animation should play
  const shouldAnimate = triggerOnMount || isInView;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, display: "flex", flexWrap: "wrap" as const, gap: "0 0.3em" }}
    >
      {words.map((word, i) => {
        const isHighlighted = highlight && word.toLowerCase().includes(highlight.toLowerCase());
        const wordDelay = delay + i * stagger;
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={
              shouldAnimate
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 20, filter: "blur(4px)" }
            }
            transition={{
              duration,
              delay: wordDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              display: "inline-block",
              willChange: "transform, opacity, filter",
              color: isHighlighted ? highlightColor : undefined,
              fontWeight: isHighlighted ? 700 : undefined,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </Tag>
  );
}
