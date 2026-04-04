"use client";

import { motion } from "framer-motion";
import { colors, fonts, space, radii } from "@/lib/theme";

interface ExerciseCardProps {
  name: string;
  modality: string;
  originator: string;
  primitive: string;
  scenario?: string;
  whyThis?: string;
  whyNow?: string;
  science?: string;
  instruction?: string;
  tags?: string[];
  dayNumber?: number;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const TAG_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  "core-parachute": { label: "Parachute", bg: "rgba(196, 148, 58, 0.15)", color: colors.coral },
  "core-jetstream": { label: "Jetstream", bg: "rgba(61, 98, 120, 0.15)", color: colors.plumLight },
  "core-basecamp": { label: "Basecamp", bg: "rgba(106, 178, 130, 0.12)", color: colors.success },
  "journal-matched": { label: "Journal-matched", bg: "rgba(200, 205, 210, 0.08)", color: colors.textMuted },
};

const MODALITY_COLORS: Record<string, string> = {
  cognitive: colors.coral,
  somatic: colors.success,
  relational: colors.plumLight,
  integrative: colors.coralLight,
  systems: colors.textMuted,
};

export default function ExerciseCard({
  name, modality, originator, primitive, scenario, whyThis, whyNow, science, instruction,
  tags, dayNumber, isActive, onClick, children,
}: ExerciseCardProps) {
  const displayWhyThis = whyThis || [whyNow, science].filter(Boolean).join(" ");

  return (
    <div style={{ marginBottom: space[6] }}>
      {/* Collapsed header */}
      <motion.button
        onClick={onClick}
        whileHover={{ backgroundColor: colors.bgSurface }}
        transition={{ duration: 0.15 }}
        style={{
          width: "100%",
          textAlign: "left" as const,
          padding: `${space[4]}px ${space[5]}px`,
          backgroundColor: isActive ? colors.bgSurface : colors.bgRecessed,
          border: isActive ? `1px solid ${colors.borderDefault}` : `1px solid ${colors.borderSubtle}`,
          borderRadius: isActive ? `${radii.md}px ${radii.md}px 0 0` : `${radii.md}px`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: space[3],
        }}
      >
        {/* Modality dot */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: MODALITY_COLORS[modality] || colors.textMuted,
          flexShrink: 0,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: fonts.display, fontSize: 16, fontWeight: 600,
            color: colors.textPrimary, margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}>
            {name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <p style={{
              fontFamily: fonts.bodyAlt, fontSize: 13, color: colors.textSecondary, margin: 0,
            }}>
              {originator} · {modality}{dayNumber ? ` · Day ${dayNumber}` : ""}
            </p>
            {tags?.map((tag) => {
              const s = TAG_STYLES[tag];
              if (!s) return null;
              return (
                <span key={tag} style={{
                  fontSize: 10, fontWeight: 600, fontFamily: fonts.display,
                  padding: "2px 8px", borderRadius: radii.full,
                  backgroundColor: s.bg, color: s.color,
                  letterSpacing: "0.02em",
                }}>
                  {s.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{ color: colors.textMuted, fontSize: 13, display: "inline-block" }}
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Expanded content */}
      {isActive && (
          <div>
            <div
              style={{
                backgroundColor: colors.bgSurface,
                border: `1px solid ${colors.borderDefault}`,
                borderTop: "none",
                borderRadius: `0 0 ${radii.md}px ${radii.md}px`,
                padding: `${space[5]}px`,
              }}
            >
              {/* Why this exercise */}
              <div style={{
                marginBottom: space[5],
                padding: `${space[3]}px ${space[4]}px`,
                backgroundColor: colors.bgRecessed,
                borderRadius: radii.sm,
                borderLeft: `3px solid ${colors.coral}`,
              }}>
                <p style={{
                  fontFamily: fonts.display, fontSize: 10, fontWeight: 700,
                  color: colors.coral, letterSpacing: "0.08em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}>
                  Why this exercise
                </p>
                <p style={{
                  fontFamily: fonts.bodyAlt, fontSize: 15, color: colors.textPrimary,
                  margin: 0, lineHeight: 1.7,
                }}>
                  {displayWhyThis}
                </p>
              </div>

              {/* What to do */}
              <div style={{
                marginBottom: children ? space[5] : 0,
                padding: `${space[3]}px ${space[4]}px`,
                backgroundColor: colors.bgRecessed,
                borderRadius: radii.sm,
                borderLeft: `3px solid ${colors.plumLight}`,
              }}>
                <p style={{
                  fontFamily: fonts.display, fontSize: 10, fontWeight: 700,
                  color: colors.plumLight, letterSpacing: "0.08em",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}>
                  What to do
                </p>
                <p style={{
                  fontFamily: fonts.bodyAlt, fontSize: 15, color: colors.textSecondary,
                  margin: 0, lineHeight: 1.7,
                }}>
                  {instruction}
                </p>
              </div>

              {/* Interactive primitive */}
              {children && (
                <div style={{ marginTop: space[4] }}>
                  {children}
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}
