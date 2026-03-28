"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, radii, space } from "@/lib/theme";
import ContactModal from "./ContactModal";

const body = fonts.bodyAlt;

export default function FloatingActions() {
  const [showBugModal, setShowBugModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [hovered, setHovered] = useState<"bug" | "coach" | null>(null);

  return (
    <>
      {/* Floating buttons — bottom right */}
      <div style={{
        position: "fixed",
        bottom: 100,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        zIndex: 90,
        alignItems: "center",
      }}>
        {/* Coach contact */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHovered("coach")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setShowCoachModal(true)}
          style={{
            width: 44, height: 44,
            borderRadius: radii.full,
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
          aria-label="Ask a coach"
        >
          {/* Chat bubble with person icon */}
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.coral} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="9" r="2" />
            <path d="M8 14c0-1.5 1.8-3 4-3s4 1.5 4 3" />
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered === "coach" && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                style={{
                  position: "absolute", right: 52, top: "50%", transform: "translateY(-50%)",
                  whiteSpace: "nowrap", padding: "4px 10px",
                  fontSize: 11, fontFamily: body, fontWeight: 500,
                  backgroundColor: colors.bgElevated, color: colors.textPrimary,
                  borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}`,
                  pointerEvents: "none",
                }}
              >
                Ask a coach
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Bug report */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setHovered("bug")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setShowBugModal(true)}
          style={{
            width: 44, height: 44,
            borderRadius: radii.full,
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.borderDefault}`,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
          aria-label="Report a bug"
        >
          {/* Bug icon — round body, antennae, legs */}
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            {/* Body — oval */}
            <ellipse cx="12" cy="14" rx="5" ry="6" />
            {/* Head */}
            <circle cx="12" cy="7" r="2.5" />
            {/* Antennae */}
            <path d="M10.5 5.5 L8 2" />
            <path d="M13.5 5.5 L16 2" />
            {/* Antenna tips */}
            <circle cx="8" cy="2" r="0.8" fill={colors.textSecondary} />
            <circle cx="16" cy="2" r="0.8" fill={colors.textSecondary} />
            {/* Legs — left */}
            <path d="M7.5 11 L4 9" />
            <path d="M7 14 L3.5 14" />
            <path d="M7.5 17 L4 19" />
            {/* Legs — right */}
            <path d="M16.5 11 L20 9" />
            <path d="M17 14 L20.5 14" />
            <path d="M16.5 17 L20 19" />
            {/* Body line */}
            <path d="M12 9 L12 20" />
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered === "bug" && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                style={{
                  position: "absolute", right: 52, top: "50%", transform: "translateY(-50%)",
                  whiteSpace: "nowrap", padding: "4px 10px",
                  fontSize: 11, fontFamily: body, fontWeight: 500,
                  backgroundColor: colors.bgElevated, color: colors.textPrimary,
                  borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}`,
                  pointerEvents: "none",
                }}
              >
                Report a bug
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Modals — use ContactModal with pre-selected types */}
      <ContactModal isOpen={showBugModal} onClose={() => setShowBugModal(false)} defaultIssueType="Technical problem" />
      <ContactModal isOpen={showCoachModal} onClose={() => setShowCoachModal(false)} defaultIssueType="Question for a Coach" />
    </>
  );
}
