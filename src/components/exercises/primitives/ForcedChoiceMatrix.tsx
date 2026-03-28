"use client";

import React, { useState, useMemo, useCallback } from "react";
import { colors, fonts, space, radii, text, shadow } from "@/lib/theme";

/* ── Types ── */

interface Scenario {
  id: string;
  description: string;
  choiceA: string;
  choiceB: string;
  valueAtStake: string; // e.g. "Autonomy vs. Financial Security"
}

interface ForcedChoiceMatrixProps {
  scenarios: Scenario[];
  choices: Record<string, "a" | "b">;
  onChange?: (scenarioId: string, choice: "a" | "b") => void;
  onComplete?: (results: { valuesHeld: string[]; valuesBent: string[] }) => void;
}

/* ── Styles ── */

const wrap: React.CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  fontFamily: fonts.body,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: colors.bgSurface,
  borderRadius: radii.lg,
  border: `1px solid ${colors.borderDefault}`,
  padding: space[6],
  marginBottom: space[4],
  transition: "opacity 0.35s ease, transform 0.35s ease",
};

const descStyle: React.CSSProperties = {
  ...text.body,
  color: colors.textPrimary,
  marginBottom: space[5],
  lineHeight: 1.7,
};

const stakeLabel: React.CSSProperties = {
  ...text.caption,
  color: colors.textMuted,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  marginBottom: space[3],
};

const btnBase: React.CSSProperties = {
  flex: 1,
  padding: `${space[4]}px ${space[5]}px`,
  borderRadius: radii.md,
  border: "2px solid transparent",
  cursor: "pointer",
  fontFamily: fonts.body,
  fontSize: text.body.fontSize,
  fontWeight: 600,
  lineHeight: 1.4,
  transition: "all 0.2s ease",
  textAlign: "center" as const,
};

const summaryBar: React.CSSProperties = {
  height: 8,
  borderRadius: radii.full,
  overflow: "hidden",
  display: "flex",
  backgroundColor: colors.bgRecessed,
  marginTop: space[3],
};

/* ── Helpers ── */

function parseValues(valueAtStake: string): [string, string] {
  const parts = valueAtStake.split(/\s+vs\.?\s+/i);
  return [parts[0]?.trim() ?? "Value A", parts[1]?.trim() ?? "Value B"];
}

/* ── Component ── */

export default function ForcedChoiceMatrix({
  scenarios,
  choices,
  onChange,
  onComplete,
}: ForcedChoiceMatrixProps) {
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const answeredCount = Object.keys(choices).length;
  const allAnswered = answeredCount === scenarios.length && scenarios.length > 0;

  /* Compute held / bent values */
  const { valuesHeld, valuesBent } = useMemo(() => {
    const held: string[] = [];
    const bent: string[] = [];
    for (const s of scenarios) {
      const pick = choices[s.id];
      if (!pick) continue;
      const [valA, valB] = parseValues(s.valueAtStake);
      if (pick === "a") {
        held.push(valA);
        bent.push(valB);
      } else {
        held.push(valB);
        bent.push(valA);
      }
    }
    return { valuesHeld: held, valuesBent: bent };
  }, [choices, scenarios]);

  /* Fire onComplete when all answered */
  const prevComplete = React.useRef(false);
  React.useEffect(() => {
    if (allAnswered && !prevComplete.current) {
      prevComplete.current = true;
      onComplete?.({ valuesHeld, valuesBent });
    }
    if (!allAnswered) prevComplete.current = false;
  }, [allAnswered, valuesHeld, valuesBent, onComplete]);

  const handleChoice = useCallback(
    (scenarioId: string, choice: "a" | "b") => {
      onChange?.(scenarioId, choice);
    },
    [onChange],
  );

  /* ── Render ── */

  return (
    <div style={wrap}>
      {scenarios.map((s, i) => {
        const pick = choices[s.id];
        const [valA, valB] = parseValues(s.valueAtStake);
        const answered = pick !== undefined;

        return (
          <div
            key={s.id}
            style={{
              ...cardStyle,
              opacity: answered ? 0.92 : 1,
              transform: answered ? "scale(0.99)" : "scale(1)",
            }}
          >
            {/* Value at stake */}
            <div style={stakeLabel}>{s.valueAtStake}</div>

            {/* Scenario description */}
            <div style={descStyle}>{s.description}</div>

            {/* Choice buttons */}
            <div style={{ display: "flex", gap: space[3] }}>
              {(["a", "b"] as const).map((opt) => {
                const label = opt === "a" ? s.choiceA : s.choiceB;
                const isSelected = pick === opt;
                const isOther = answered && !isSelected;
                const hoverKey = `${s.id}-${opt}`;
                const isHovered = hoveredBtn === hoverKey && !answered;

                let bg = colors.bgElevated;
                let borderColor = colors.borderDefault;
                let textColor = colors.textPrimary;

                if (isSelected) {
                  bg = colors.coral;
                  borderColor = colors.coral;
                  textColor = colors.bgDeep;
                } else if (isOther) {
                  bg = colors.plumDeep;
                  borderColor = colors.plum;
                  textColor = colors.plumLight;
                } else if (isHovered) {
                  bg = colors.bgElevated;
                  borderColor = colors.coral;
                }

                return (
                  <button
                    key={opt}
                    onClick={() => !answered && handleChoice(s.id, opt)}
                    onMouseEnter={() => setHoveredBtn(hoverKey)}
                    onMouseLeave={() => setHoveredBtn(null)}
                    style={{
                      ...btnBase,
                      backgroundColor: bg,
                      borderColor,
                      color: textColor,
                      cursor: answered ? "default" : "pointer",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Post-choice annotation */}
            {answered && (
              <div
                style={{
                  marginTop: space[3],
                  ...text.secondary,
                  color: colors.textMuted,
                  textAlign: "center" as const,
                  opacity: 0,
                  animation: "fadeIn 0.3s ease forwards",
                }}
              >
                You honored{" "}
                <span style={{ color: colors.coral, fontWeight: 600 }}>
                  {pick === "a" ? valA : valB}
                </span>{" "}
                over{" "}
                <span style={{ color: colors.plumLight }}>
                  {pick === "a" ? valB : valA}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Running tally ── */}
      {answeredCount > 0 && (
        <div
          style={{
            backgroundColor: colors.bgRecessed,
            borderRadius: radii.md,
            padding: space[5],
            border: `1px solid ${colors.borderSubtle}`,
          }}
        >
          <div
            style={{
              ...text.caption,
              color: colors.textMuted,
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
              marginBottom: space[3],
            }}
          >
            {allAnswered ? "Final Summary" : `${answeredCount} / ${scenarios.length} answered`}
          </div>

          {/* Values held */}
          {valuesHeld.length > 0 && (
            <div style={{ marginBottom: space[2] }}>
              <span style={{ ...text.secondary, color: colors.coral, fontWeight: 600 }}>
                Held:{" "}
              </span>
              <span style={{ ...text.secondary, color: colors.textSecondary }}>
                {valuesHeld.join(", ")}
              </span>
            </div>
          )}

          {/* Values bent */}
          {valuesBent.length > 0 && (
            <div style={{ marginBottom: space[3] }}>
              <span style={{ ...text.secondary, color: colors.plumLight, fontWeight: 600 }}>
                Bent:{" "}
              </span>
              <span style={{ ...text.secondary, color: colors.textMuted }}>
                {valuesBent.join(", ")}
              </span>
            </div>
          )}

          {/* Visual bar */}
          <div style={summaryBar}>
            <div
              style={{
                width: `${(valuesHeld.length / (valuesHeld.length + valuesBent.length)) * 100}%`,
                backgroundColor: colors.coral,
                transition: "width 0.4s ease",
              }}
            />
            <div
              style={{
                flex: 1,
                backgroundColor: colors.plum,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: space[1],
            }}
          >
            <span style={{ ...text.caption, color: colors.coral }}>
              Held ({valuesHeld.length})
            </span>
            <span style={{ ...text.caption, color: colors.plumLight }}>
              Bent ({valuesBent.length})
            </span>
          </div>
        </div>
      )}

      {/* Keyframe for fade-in */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
