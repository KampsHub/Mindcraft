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
        position: "relative",
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
        {/* Step number circle with glow */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* Warm glow ring for active step */}
          {isActive && (
            <motion.div
              animate={{
                opacity: [0.25, 0.5, 0.25],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.coral}40 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
          )}
          <motion.div
            animate={{
              backgroundColor: isCompleted
                ? colors.coral
                : isActive
                ? colors.coral
                : colors.bgElevated,
              boxShadow: isActive
                ? `0 0 20px ${colors.coral}30`
                : isCompleted
                ? `0 2px 8px ${colors.coral}20`
                : "none",
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
              letterSpacing: "-0.02em",
              position: "relative",
              zIndex: 1,
            }}
          >
            {isCompleted ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                ✓
              </motion.span>
            ) : (
              stepNumber
            )}
          </motion.div>
        </div>

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
              color: isActive ? colors.coral : colors.textMuted,
              flexShrink: 0,
              fontFamily: display,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              padding: "4px 10px",
              backgroundColor: isActive ? colors.coralWash : "transparent",
              borderRadius: 6,
              transition: "all 0.3s",
            }}
          >
            {estimatedTime}
          </span>
        )}
      </div>

      {/* Step content — shown when active or completed */}
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
