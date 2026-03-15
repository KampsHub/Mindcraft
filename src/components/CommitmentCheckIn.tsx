"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface CommitmentCheckInItem {
  commitment: string;
  followed_through: boolean;
  note?: string;
}

interface CommitmentCheckInProps {
  commitments: string[];
  onUpdate: (responses: CommitmentCheckInItem[]) => void;
}

export default function CommitmentCheckIn({ commitments, onUpdate }: CommitmentCheckInProps) {
  const [items, setItems] = useState<CommitmentCheckInItem[]>(
    commitments.map((c) => ({ commitment: c, followed_through: false, note: "" }))
  );
  const [expandedNote, setExpandedNote] = useState<number | null>(null);

  if (!commitments || commitments.length === 0) return null;

  function toggleItem(index: number) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, followed_through: !item.followed_through } : item
    );
    setItems(updated);
    onUpdate(updated);
  }

  function updateNote(index: number, note: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, note } : item
    );
    setItems(updated);
    onUpdate(updated);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "18px 20px",
        backgroundColor: colors.coralWash,
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: colors.textBody,
          margin: "0 0 14px 0",
          fontFamily: body,
          lineHeight: 1.5,
        }}
      >
        Yesterday you said you&apos;d:
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                cursor: "pointer",
              }}
              onClick={() => toggleItem(i)}
              role="checkbox"
              aria-checked={item.followed_through}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggleItem(i);
                }
              }}
            >
              {/* Custom checkbox — large tap target */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  borderRadius: 6,
                  border: item.followed_through
                    ? `2px solid ${colors.coral}`
                    : `2px solid ${colors.borderDefault}`,
                  backgroundColor: item.followed_through
                    ? colors.coral
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  marginTop: 1,
                }}
              >
                {item.followed_through && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M3 7L6 10L11 4"
                      stroke={colors.bgDeep}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </motion.div>

              <p
                style={{
                  fontSize: 14,
                  color: item.followed_through ? colors.textBody : colors.textSecondary,
                  margin: 0,
                  lineHeight: 1.55,
                  fontFamily: body,
                  textDecoration: item.followed_through ? "none" : "none",
                }}
              >
                &ldquo;{item.commitment}&rdquo;
              </p>
            </div>

            {/* Optional note toggle */}
            <div style={{ marginLeft: 36, marginTop: 4 }}>
              {expandedNote === i ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                >
                  <textarea
                    value={item.note || ""}
                    onChange={(e) => updateNote(i, e.target.value)}
                    placeholder="What happened? (optional)"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "100%",
                      minHeight: 56,
                      padding: 10,
                      fontSize: 13,
                      lineHeight: 1.5,
                      border: `1px solid ${colors.borderDefault}`,
                      borderRadius: 8,
                      resize: "vertical",
                      outline: "none",
                      fontFamily: body,
                      boxSizing: "border-box",
                      color: colors.textPrimary,
                      backgroundColor: colors.bgInput,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.coral;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.borderDefault;
                    }}
                  />
                </motion.div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedNote(i);
                  }}
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: body,
                  }}
                >
                  + add a note
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 12,
          color: colors.textMuted,
          margin: "14px 0 0 0",
          fontFamily: body,
          fontStyle: "italic",
        }}
      >
        Check off what you followed through on. No judgment — just noticing.
      </p>
    </motion.div>
  );
}
