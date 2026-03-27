"use client";

import { motion } from "framer-motion";
import { colors } from "@/lib/theme";

interface PulseRingProps {
  active: boolean;
  size?: number;
  color?: string;
}

export default function PulseRing({ active, size = 64, color = colors.coral }: PulseRingProps) {
  if (!active) return null;

  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: size, height: size,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{
            scale: [1, 1.8, 2.2],
            opacity: [0.6, 0.2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
