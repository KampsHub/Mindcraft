"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface AnimatedStatProps {
  value: number;
  max: number;
  label: string;
  format?: string; // e.g. "/7" to show "3/7"
  accentColor?: string;
}

export default function AnimatedStat({
  value,
  max,
  label,
  format,
  accentColor = colors.coral,
}: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value]);

  const radius = 34;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: 14,
        border: `1px solid ${colors.borderDefault}`,
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Progress ring + number */}
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
          {/* Background ring */}
          <circle
            cx={40} cy={40} r={radius}
            fill="none"
            stroke={colors.bgElevated}
            strokeWidth={stroke}
          />
          {/* Progress ring */}
          <motion.circle
            cx={40} cy={40} r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        {/* Number overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: display, fontSize: 22, fontWeight: 800,
            color: accentColor, letterSpacing: "-0.02em",
          }}>
            {displayValue}{format || ""}
          </span>
        </div>
      </div>

      {/* Label */}
      <p style={{
        fontSize: 12, color: colors.textMuted, margin: 0,
        fontFamily: display, fontWeight: 500, textAlign: "center",
      }}>
        {label}
      </p>
    </div>
  );
}
