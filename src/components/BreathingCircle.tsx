"use client";

import { motion } from "framer-motion";
import { colors } from "@/lib/theme";

/**
 * BreathingCircle — a calm, intentional loading state.
 *
 * Three concentric rings rotate at different speeds while a centre dot
 * breathes (4-second inhale/exhale). Designed to feel like a held moment,
 * not a spinner. Used for /day, /weekly-review, and other long loads.
 */
export default function BreathingCircle({ size = 96, label }: { size?: number; label?: string }) {
  const stroke = 1.5;
  const r1 = size * 0.45;
  const r2 = size * 0.35;
  const r3 = size * 0.25;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0 }}>
          {/* outer ring — slow clockwise */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r1}
            fill="none"
            stroke={colors.coral}
            strokeWidth={stroke}
            strokeDasharray={`${r1 * 1.4} ${r1 * 6}`}
            strokeLinecap="round"
            opacity={0.55}
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
          />
          {/* middle ring — counter-clockwise */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r2}
            fill="none"
            stroke={colors.textPrimary}
            strokeWidth={stroke}
            strokeDasharray={`${r2 * 0.9} ${r2 * 5}`}
            strokeLinecap="round"
            opacity={0.4}
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
          />
          {/* inner ring — slow clockwise, mostly filled */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r3}
            fill="none"
            stroke={colors.coral}
            strokeWidth={stroke + 0.5}
            strokeDasharray={`${r3 * 4.5} ${r3 * 1}`}
            strokeLinecap="round"
            opacity={0.85}
            animate={{ rotate: 360 }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50%", originY: "50%", transformBox: "fill-box" }}
          />
        </svg>
        {/* breathing centre dot — 4s inhale, 4s exhale */}
        <motion.div
          animate={{ scale: [0.7, 1.05, 0.7], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: size * 0.18,
            height: size * 0.18,
            borderRadius: "50%",
            backgroundColor: colors.coral,
            boxShadow: `0 0 24px ${colors.coral}66`,
          }}
        />
      </div>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            letterSpacing: "0.02em",
            margin: 0,
            textAlign: "center",
          }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
