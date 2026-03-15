"use client";

import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface DailyStepProps {
  stepNumber: number;
  title: string;
  subtitle?: string;
  isActive: boolean;
  isCompleted: boolean;
  estimatedTime?: string;
  children: React.ReactNode;
}

export default function DailyStep({
  stepNumber,
  title,
  subtitle,
  isActive,
  isCompleted,
  estimatedTime,
  children,
}: DailyStepProps) {
  return (
    <div
      style={{
        marginBottom: 28,
        opacity: isActive || isCompleted ? 1 : 0.35,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Step header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 18,
        }}
      >
        {/* Step number circle */}
        <motion.div
          animate={{
            scale: isActive ? 1 : 1,
            backgroundColor: isCompleted
              ? colors.coral
              : isActive
              ? colors.coral
              : colors.bgElevated,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: isCompleted
              ? colors.coral
              : isActive
              ? colors.coral
              : colors.bgElevated,
            color: isCompleted || isActive ? colors.bgDeep : colors.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: display,
            flexShrink: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {isCompleted ? "✓" : stepNumber}
        </motion.div>

        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: isActive || isCompleted ? colors.textPrimary : colors.textMuted,
              margin: 0,
              fontFamily: display,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: colors.textMuted,
                margin: "3px 0 0 0",
                fontFamily: body,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {estimatedTime && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: colors.textMuted,
              flexShrink: 0,
              fontFamily: display,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {estimatedTime}
          </span>
        )}
      </div>

      {/* Step content — only shown when active or completed */}
      <AnimatePresence>
        {(isActive || isCompleted) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginLeft: 52,
              paddingLeft: 0,
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
