"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface FreeFlowCaptureProps {
  enrollmentId: string;
  sessionId?: string;
  onCapture?: () => void;
}

export default function FreeFlowCapture({
  enrollmentId,
  sessionId,
  onCapture,
}: FreeFlowCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");
  const supabase = createClient();

  async function handleSave() {
    if (!content.trim() || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("free_flow_entries").insert({
        enrollment_id: enrollmentId,
        daily_session_id: sessionId || null,
        content: content.trim(),
      });

      if (error) {
        console.error("Failed to save free-flow:", error);
        setFlash("Failed to save");
      } else {
        setFlash("Captured ✓");
        setContent("");
        onCapture?.();
        setTimeout(() => {
          setFlash("");
          setIsOpen(false);
        }, 1200);
      }
    } catch (err) {
      console.error("Free-flow save error:", err);
      setFlash("Error saving");
    }
    setSaving(false);
  }

  return (
    <>
      {/* Floating button with warm glow */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: "fixed",
              bottom: 28,
              right: 28,
              zIndex: 1000,
            }}
          >
            {/* Warm glow pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${colors.coral}30 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: `0 8px 28px ${colors.coral}50` }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsOpen(true)}
              style={{
                position: "relative",
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${colors.coralLight}, ${colors.coral})`,
                color: colors.bgDeep,
                border: "none",
                cursor: "pointer",
                fontSize: 22,
                fontWeight: 700,
                boxShadow: `0 4px 20px ${colors.coral}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: display,
              }}
              title="Capture a thought"
            >
              ✎
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded capture panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: 28,
              right: 28,
              width: 340,
              backgroundColor: colors.bgSurface,
              borderRadius: 20,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              zIndex: 1000,
              overflow: "hidden",
              fontFamily: body,
              border: `1px solid ${colors.borderDefault}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${colors.borderDefault}`,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  fontFamily: display,
                  letterSpacing: "-0.02em",
                }}
              >
                Capture a thought
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsOpen(false);
                  setContent("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  color: colors.textMuted,
                  cursor: "pointer",
                  padding: "0 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                }}
              >
                ×
              </motion.button>
            </div>

            {/* Content */}
            <div style={{ padding: 18 }}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's coming up right now?"
                autoFocus
                style={{
                  width: "100%",
                  minHeight: 90,
                  padding: 14,
                  fontSize: 14,
                  lineHeight: 1.55,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: 12,
                  resize: "none",
                  outline: "none",
                  fontFamily: body,
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  backgroundColor: colors.bgInput,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.coral; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderDefault; }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                {flash ? (
                  <span style={{ fontSize: 13, color: colors.success, fontWeight: 600, fontFamily: display }}>
                    {flash}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: body }}>
                    Timestamped • Feeds tomorrow
                  </span>
                )}

                <motion.button
                  whileHover={content.trim() && !saving ? { scale: 1.04, boxShadow: `0 6px 20px ${colors.coralWash}` } : {}}
                  whileTap={content.trim() && !saving ? { scale: 0.96 } : {}}
                  onClick={handleSave}
                  disabled={!content.trim() || saving}
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: content.trim() && !saving ? colors.bgDeep : colors.textMuted,
                    backgroundColor: content.trim() && !saving ? colors.coral : colors.bgElevated,
                    border: "none",
                    borderRadius: 100,
                    cursor: content.trim() && !saving ? "pointer" : "not-allowed",
                    transition: "background-color 0.2s",
                    fontFamily: display,
                    letterSpacing: "0.01em",
                  }}
                >
                  {saving ? "..." : "Save"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
