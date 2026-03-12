"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import { colors } from "@/lib/theme";

/* ── Word-by-word text reveal ────────────────────────────────────
 *  Split text into words. Each word fades + slides up with a stagger.
 *  Set triggerOnMount=true for above-the-fold hero content.
 *
 *  Effects per word:
 *    distort  — repeating skew/jitter glitch (single string or array with cadences)
 *    slash    — diagonal line sweeps top-left → bottom-right ("cut" effect)
 */

interface DistortConfig {
  word: string;
  duration?: number;
  repeatDelay?: number;
  delay?: number;
}

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
  /** Word(s) to apply a repeating distortion/glitch effect to */
  distort?: string | DistortConfig[];
  /** Word to apply a diagonal slash/cut animation to */
  slash?: string;
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
  distort,
  slash,
}: TextRevealProps) {
  const words = text.split(" ");
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  // Determine if animation should play
  const shouldAnimate = triggerOnMount || isInView;

  // Normalize distort to array of configs
  const distortConfigs: DistortConfig[] = distort
    ? typeof distort === "string"
      ? [{ word: distort }]
      : distort
    : [];

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, display: "flex", flexWrap: "wrap" as const, gap: "0 0.3em" }}
    >
      {words.map((word, i) => {
        const isHighlighted = highlight && word.toLowerCase().includes(highlight.toLowerCase());
        const cleanWord = word.toLowerCase().replace(/[.,!?]$/, "");
        const distortConfig = distortConfigs.find(d => cleanWord.includes(d.word.toLowerCase()));
        const isDistorted = !!distortConfig;
        const isSlashed = slash && cleanWord.includes(slash.toLowerCase());
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
            {isSlashed ? (
              <span style={{ position: "relative", display: "inline-block" }}>
                {word}
                <motion.svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-5%",
                    width: "110%",
                    height: "120%",
                    pointerEvents: "none",
                    overflow: "visible",
                  }}
                >
                  {/* Glow flash — fades out after slash draws */}
                  <motion.path
                    d="M10 0 L90 100"
                    stroke={colors.primary}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
                    transition={{
                      duration: 1.2,
                      delay: 2.5,
                      ease: "easeOut",
                    }}
                  />
                  {/* Main slash line — stays permanently */}
                  <motion.path
                    d="M10 0 L90 100"
                    stroke={colors.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.85 }}
                    transition={{
                      duration: 0.8,
                      delay: 2.5,
                      ease: "easeOut",
                    }}
                  />
                </motion.svg>
              </span>
            ) : isDistorted ? (
              <motion.span
                animate={{
                  skewX: [0, 0, -8, 5, -3, 0, 0],
                  x: [0, 0, -2, 2, -1, 0, 0],
                }}
                transition={{
                  duration: distortConfig!.duration ?? 0.5,
                  repeat: Infinity,
                  repeatDelay: distortConfig!.repeatDelay ?? 6,
                  delay: distortConfig!.delay ?? 3,
                  ease: "easeInOut",
                }}
                style={{ display: "inline-block" }}
              >
                {word}
              </motion.span>
            ) : (
              word
            )}
          </motion.span>
        );
      })}
    </Tag>
  );
}
