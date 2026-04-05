"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts, radii } from "@/lib/theme";
import ContactModal from "./ContactModal";

const body = fonts.bodyAlt;

export default function FloatingActions() {
  const router = useRouter();
  const pathname = usePathname();
  const [showBugModal, setShowBugModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [hovered, setHovered] = useState<"bug" | "coach" | "journal" | null>(null);

  const hidePencil = pathname.startsWith("/day/") || pathname === "/mindful-journal";

  return (
    <>
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        zIndex: 1000,
      }}>
        {/* Coach contact — top */}
        <FAB
          icon={<ChatPersonIcon />}
          label="Ask a coach"
          hovered={hovered === "coach"}
          onHover={(h) => setHovered(h ? "coach" : null)}
          onClick={() => setShowCoachModal(true)}
          size={40}
          bg={colors.bgSurface}
          border={colors.borderDefault}
          iconColor={colors.coral}
        />

        {/* Bug report — middle */}
        <FAB
          icon={<BugIcon />}
          label="Report a bug"
          hovered={hovered === "bug"}
          onHover={(h) => setHovered(h ? "bug" : null)}
          onClick={() => setShowBugModal(true)}
          size={40}
          bg={colors.bgSurface}
          border={colors.borderDefault}
          iconColor={colors.textSecondary}
        />

        {/* Capture a thought — bottom, largest */}
        {!hidePencil && (
          <div style={{ position: "relative" }}>
            {/* Glow pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.12, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute", inset: -6, borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.coral}30 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: `0 8px 24px ${colors.coral}50` }}
              whileTap={{ scale: 0.93 }}
              onMouseEnter={() => setHovered("journal")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => router.push("/mindful-journal")}
              title="Capture a thought"
              style={{
                position: "relative",
                width: 52, height: 52,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${colors.coralLight}, ${colors.coral})`,
                color: colors.bgDeep,
                border: "none",
                cursor: "pointer",
                boxShadow: `0 4px 16px ${colors.coral}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.bgDeep} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
              {hovered === "journal" && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  style={{
                    position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)",
                    whiteSpace: "nowrap", padding: "4px 10px",
                    fontSize: 11, fontFamily: body, fontWeight: 500,
                    backgroundColor: colors.bgElevated, color: colors.textPrimary,
                    borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}`,
                    pointerEvents: "none",
                  }}
                >
                  Capture a thought
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ContactModal isOpen={showBugModal} onClose={() => setShowBugModal(false)} defaultIssueType="Technical problem" />
      <ContactModal isOpen={showCoachModal} onClose={() => setShowCoachModal(false)} defaultIssueType="Question for a Coach" />
    </>
  );
}

/* ── Reusable FAB ── */

function FAB({ icon, label, hovered, onHover, onClick, size, bg, border, iconColor }: {
  icon: React.ReactNode;
  label: string;
  hovered: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
  size: number;
  bg: string;
  border: string;
  iconColor: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={onClick}
        aria-label={label}
        style={{
          width: size, height: size,
          borderRadius: radii.full,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          color: iconColor,
        }}
      >
        {icon}
      </motion.button>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            style={{
              position: "absolute", right: size + 12, top: "50%", transform: "translateY(-50%)",
              whiteSpace: "nowrap", padding: "4px 10px",
              fontSize: 11, fontFamily: fonts.bodyAlt, fontWeight: 500,
              backgroundColor: colors.bgElevated, color: colors.textPrimary,
              borderRadius: radii.sm, border: `1px solid ${colors.borderDefault}`,
              pointerEvents: "none",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Icons ── */

function ChatPersonIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="9" r="2" />
      <path d="M8 14c0-1.5 1.8-3 4-3s4 1.5 4 3" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="14" rx="5" ry="6" />
      <circle cx="12" cy="7" r="2.5" />
      <path d="M10.5 5.5 L8 2" />
      <path d="M13.5 5.5 L16 2" />
      <circle cx="8" cy="2" r="0.8" fill="currentColor" />
      <circle cx="16" cy="2" r="0.8" fill="currentColor" />
      <path d="M7.5 11 L4 9" />
      <path d="M7 14 L3.5 14" />
      <path d="M7.5 17 L4 19" />
      <path d="M16.5 11 L20 9" />
      <path d="M17 14 L20.5 14" />
      <path d="M16.5 17 L20 19" />
      <path d="M12 9 L12 20" />
    </svg>
  );
}
