"use client";

import { useState } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface NeedsPickerProps {
  categories: Record<string, string[]>;
  selected: Set<string>;
  onToggle: (need: string) => void;
  maxSelections?: number;
}

export default function NeedsPicker({ categories, selected, onToggle, maxSelections = 4 }: NeedsPickerProps) {
  const atCap = selected.size >= maxSelections;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: space[3] }}>
        <p style={{
          fontFamily: display, fontSize: 11, fontWeight: 600,
          color: colors.textMuted, letterSpacing: "0.04em",
          margin: 0, textTransform: "uppercase",
        }}>
          Pick up to {maxSelections}
        </p>
        <span style={{
          fontFamily: body, fontSize: 12, fontWeight: 600,
          color: selected.size > 0 ? colors.coral : colors.textMuted,
        }}>
          {selected.size} / {maxSelections}
        </span>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: space[3] }}>
        {Object.keys(categories).map((cat) => {
          const isActive = activeCategory === cat;
          const hasSelection = categories[cat].some((n) => selected.has(n));
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontFamily: display,
                fontWeight: 600,
                borderRadius: radii.full,
                border: isActive ? "none" : `1px solid ${hasSelection ? colors.coral : colors.borderDefault}`,
                backgroundColor: isActive ? colors.coralWash : hasSelection ? "rgba(196, 148, 58, 0.06)" : "transparent",
                color: isActive ? colors.coral : hasSelection ? colors.coral : colors.textSecondary,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat}
              {hasSelection && ` ·`}
            </button>
          );
        })}
      </div>

      {/* Active category needs */}
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
            color: colors.coral, margin: `0 0 ${space[2]}px 0`,
          }}>
            {activeCategory}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories[activeCategory].map((need) => {
              const isSelected = selected.has(need);
              const disabled = atCap && !isSelected;
              return (
                <button
                  key={need}
                  onClick={() => !disabled && onToggle(need)}
                  style={{
                    padding: "8px 16px",
                    fontSize: 13,
                    fontFamily: body,
                    fontWeight: isSelected ? 600 : 400,
                    borderRadius: radii.full,
                    border: isSelected ? "none" : `1px solid ${colors.borderDefault}`,
                    backgroundColor: isSelected ? colors.coralWash : "transparent",
                    color: isSelected ? colors.coral : disabled ? colors.textMuted : colors.textPrimary,
                    cursor: disabled ? "default" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  {need}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No category selected — prompt */}
      {!activeCategory && selected.size === 0 && (
        <p style={{
          fontFamily: body, fontSize: 13, color: colors.textMuted,
          textAlign: "center", padding: `${space[4]}px 0`,
          margin: 0,
        }}>
          Tap a category above to explore needs
        </p>
      )}

      {/* Selected summary */}
      {selected.size > 0 && (
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, marginRight: 4 }}>
            Selected:
          </span>
          {Array.from(selected).map((need) => (
            <button
              key={need}
              onClick={() => onToggle(need)}
              style={{
                padding: "5px 12px", fontSize: 12, fontFamily: body, fontWeight: 500,
                borderRadius: radii.full, border: "none",
                backgroundColor: colors.coralWash, color: colors.coral,
                cursor: "pointer",
              }}
            >
              {need} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
