"use client";

import { colors, fonts, space, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface ExerciseCardProps {
  name: string;
  modality: string;
  originator: string;
  primitive: string;
  scenario?: string;
  whyNow: string;
  science: string;
  instruction: string;
  tags?: string[];
  dayNumber?: number;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode; // The actual primitive component
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
  name, modality, originator, primitive, scenario, whyNow, science, instruction,
  tags, dayNumber, isActive, onClick, children,
}: ExerciseCardProps) {
  return (
    <div style={{ marginBottom: space[6] }}>
      {/* Collapsed card */}
      <button
        onClick={onClick}
        style={{
          width: "100%",
          textAlign: "left",
          padding: `${space[4]}px ${space[5]}px`,
          backgroundColor: isActive ? colors.bgSurface : colors.bgRecessed,
          border: isActive ? `1px solid ${colors.borderDefault}` : `1px solid ${colors.borderSubtle}`,
          borderRadius: isActive ? `${radii.md}px ${radii.md}px 0 0` : `${radii.md}px`,
          cursor: "pointer",
          transition: "all 0.2s",
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
            fontFamily: display, fontSize: 15, fontWeight: 600,
            color: colors.textPrimary, margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            <p style={{
              fontFamily: body, fontSize: 12, color: colors.textMuted, margin: 0,
            }}>
              {originator} · {modality}{dayNumber ? ` · Day ${dayNumber}` : ""}
            </p>
            {tags?.map((tag) => {
              const style = TAG_STYLES[tag];
              if (!style) return null;
              return (
                <span key={tag} style={{
                  fontSize: 10, fontWeight: 600, fontFamily: display,
                  padding: "2px 8px", borderRadius: radii.full,
                  backgroundColor: style.bg, color: style.color,
                  letterSpacing: "0.02em",
                }}>
                  {style.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Expand indicator */}
        <span style={{
          color: colors.textMuted, fontSize: 14,
          transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isActive && (
        <div style={{
          backgroundColor: colors.bgSurface,
          border: `1px solid ${colors.borderDefault}`,
          borderTop: "none",
          borderRadius: `0 0 ${radii.md}px ${radii.md}px`,
          padding: `${space[5]}px`,
        }}>
          {/* Scenario */}
          {scenario && (
            <div style={{
              marginBottom: space[5],
              padding: `${space[4]}px ${space[5]}px`,
              backgroundColor: colors.bgDeep,
              borderRadius: radii.sm,
              border: `1px solid ${colors.borderSubtle}`,
            }}>
              <p style={{
                fontFamily: display, fontSize: 11, fontWeight: 600,
                color: colors.textMuted, letterSpacing: "0.04em",
                margin: "0 0 8px 0",
              }}>
                FROM YOUR JOURNAL
              </p>
              <p style={{
                fontFamily: fonts.serif, fontSize: 15, color: colors.textPrimary,
                margin: 0, lineHeight: 1.7, fontStyle: "italic",
              }}>
                &ldquo;{scenario}&rdquo;
              </p>
            </div>
          )}

          {/* Why now */}
          <div style={{
            marginBottom: space[5],
            padding: `${space[3]}px ${space[4]}px`,
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${colors.coral}`,
          }}>
            <p style={{
              fontFamily: display, fontSize: 11, fontWeight: 600,
              color: colors.coral, letterSpacing: "0.04em",
              margin: "0 0 4px 0",
            }}>
              WHY THIS MATTERS NOW
            </p>
            <p style={{
              fontFamily: body, fontSize: 14, color: colors.textPrimary,
              margin: 0, lineHeight: 1.6, fontStyle: "italic",
            }}>
              {whyNow}
            </p>
          </div>

          {/* What it does */}
          <div style={{
            marginBottom: space[5],
            padding: `${space[3]}px ${space[4]}px`,
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${MODALITY_COLORS[modality] || colors.textMuted}`,
          }}>
            <p style={{
              fontFamily: display, fontSize: 11, fontWeight: 600,
              color: MODALITY_COLORS[modality] || colors.textMuted,
              letterSpacing: "0.04em",
              margin: "0 0 4px 0",
            }}>
              WHAT IT DOES FOR YOU
            </p>
            <p style={{
              fontFamily: body, fontSize: 14, color: colors.textSecondary,
              margin: 0, lineHeight: 1.6,
            }}>
              {science}
            </p>
          </div>

          {/* How to use it */}
          <div style={{
            marginBottom: children ? space[5] : 0,
            padding: `${space[3]}px ${space[4]}px`,
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.sm,
            borderLeft: `3px solid ${colors.plumLight}`,
          }}>
            <p style={{
              fontFamily: display, fontSize: 11, fontWeight: 600,
              color: colors.plumLight, letterSpacing: "0.04em",
              margin: "0 0 4px 0",
            }}>
              HOW TO USE THIS
            </p>
            <p style={{
              fontFamily: body, fontSize: 14, color: colors.textSecondary,
              margin: 0, lineHeight: 1.6,
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
      )}
    </div>
  );
}
