"use client";

import { useState } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";
import { FEELINGS_SATISFIED, FEELINGS_UNSATISFIED } from "./nvc-data";

const display = fonts.display;
const body = fonts.bodyAlt;

interface SelectedEmotion {
  emotion: string;
  intensity: string;
}

interface NVCEmotionWheelProps {
  selected: SelectedEmotion[];
  onSelect: (emotion: string, intensity: "mild" | "moderate" | "intense") => void;
}

export default function NVCEmotionWheel({ selected, onSelect }: NVCEmotionWheelProps) {
  const [mode, setMode] = useState<"satisfied" | "unsatisfied">("unsatisfied");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = mode === "satisfied" ? FEELINGS_SATISFIED : FEELINGS_UNSATISFIED;
  const accent = mode === "satisfied" ? colors.success : colors.coral;
  const accentWash = mode === "satisfied" ? colors.successWash : colors.coralWash;

  // Count selections per side
  const allSatisfied = new Set<string>();
  for (const [cat, feelings] of Object.entries(FEELINGS_SATISFIED)) {
    allSatisfied.add(cat.toLowerCase());
    feelings.forEach((f) => allSatisfied.add(f));
  }
  const satisfiedCount = selected.filter((s) => allSatisfied.has(s.emotion)).length;
  const unsatisfiedCount = selected.length - satisfiedCount;

  function isSelected(feeling: string): boolean {
    return selected.some((s) => s.emotion === feeling);
  }

  return (
    <div>
      {/* Satisfied / Unsatisfied toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: space[3] }}>
        <button
          onClick={() => { setMode("satisfied"); setActiveCategory(null); }}
          style={{
            flex: 1, padding: "8px 12px", fontSize: 12, fontFamily: display, fontWeight: 600,
            borderRadius: radii.full,
            border: mode === "satisfied" ? "none" : `1px solid ${colors.borderDefault}`,
            backgroundColor: mode === "satisfied" ? colors.successWash : "transparent",
            color: mode === "satisfied" ? colors.success : colors.textMuted,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          Needs met {satisfiedCount > 0 && `(${satisfiedCount})`}
        </button>
        <button
          onClick={() => { setMode("unsatisfied"); setActiveCategory(null); }}
          style={{
            flex: 1, padding: "8px 12px", fontSize: 12, fontFamily: display, fontWeight: 600,
            borderRadius: radii.full,
            border: mode === "unsatisfied" ? "none" : `1px solid ${colors.borderDefault}`,
            backgroundColor: mode === "unsatisfied" ? colors.coralWash : "transparent",
            color: mode === "unsatisfied" ? colors.coral : colors.textMuted,
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          Needs not met {unsatisfiedCount > 0 && `(${unsatisfiedCount})`}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: space[3] }}>
        {Object.keys(categories).map((cat) => {
          const isActive = activeCategory === cat;
          const feelings = categories[cat];
          const hasSelection = isSelected(cat.toLowerCase()) || feelings.some((f) => isSelected(f));
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              style={{
                padding: "6px 14px", fontSize: 12,
                fontFamily: display, fontWeight: 600,
                borderRadius: radii.full,
                border: isActive ? "none" : `1px solid ${hasSelection ? accent : colors.borderDefault}`,
                backgroundColor: isActive ? accentWash : hasSelection ? `${accent}10` : "transparent",
                color: isActive ? accent : hasSelection ? accent : colors.textSecondary,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cat}
              {hasSelection && " ·"}
            </button>
          );
        })}
      </div>

      {/* Active category feelings */}
      {activeCategory && categories[activeCategory] && (
        <div style={{
          padding: space[3],
          backgroundColor: colors.bgRecessed,
          borderRadius: radii.md,
          border: `1px solid ${colors.borderSubtle}`,
          marginBottom: space[3],
        }}>
          <p style={{
            fontFamily: display, fontSize: 13, fontWeight: 600,
            color: accent, margin: `0 0 ${space[2]}px 0`,
          }}>
            {activeCategory}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {/* Category-level feeling first */}
            {[activeCategory.toLowerCase(), ...categories[activeCategory]].map((feeling) => {
              const isSel = isSelected(feeling);
              const isCat = feeling === activeCategory.toLowerCase();
              return (
                <button
                  key={feeling}
                  onClick={() => onSelect(feeling, "moderate")}
                  style={{
                    padding: "8px 16px",
                    fontSize: isCat ? 13 : 13,
                    fontFamily: body,
                    fontWeight: isSel ? 600 : isCat ? 600 : 400,
                    borderRadius: radii.full,
                    border: isSel ? "none" : `1px solid ${colors.borderDefault}`,
                    backgroundColor: isSel ? accentWash : "transparent",
                    color: isSel ? accent : isCat ? colors.textPrimary : colors.textPrimary,
                    cursor: "pointer", transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {feeling}{isSel ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Prompt when no category open */}
      {!activeCategory && selected.length === 0 && (
        <p style={{
          fontFamily: body, fontSize: 13, color: colors.textMuted,
          textAlign: "center", padding: `${space[4]}px 0`, margin: 0,
        }}>
          Tap a category above to explore feelings
        </p>
      )}

      {/* Selected summary */}
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, marginRight: 4 }}>
            {selected.length} feeling{selected.length !== 1 ? "s" : ""}:
          </span>
          {selected.map((s) => (
            <button
              key={s.emotion}
              onClick={() => onSelect(s.emotion, s.intensity as "mild" | "moderate" | "intense")}
              style={{
                padding: "5px 12px", fontSize: 12, fontFamily: body, fontWeight: 500,
                borderRadius: radii.full, border: "none",
                backgroundColor: accentWash, color: accent,
                cursor: "pointer", textTransform: "capitalize",
              }}
            >
              {s.emotion} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
