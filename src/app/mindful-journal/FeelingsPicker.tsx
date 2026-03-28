"use client";

import { useState } from "react";
import { colors, fonts, space, radii } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface FeelingsPickerProps {
  satisfiedCategories: Record<string, string[]>;
  unsatisfiedCategories: Record<string, string[]>;
  selected: Set<string>;
  onToggle: (feeling: string) => void;
}

export default function FeelingsPicker({
  satisfiedCategories,
  unsatisfiedCategories,
  selected,
  onToggle,
}: FeelingsPickerProps) {
  const [mode, setMode] = useState<"satisfied" | "unsatisfied">("unsatisfied");
  const categories = mode === "satisfied" ? satisfiedCategories : unsatisfiedCategories;

  const satisfiedCount = Array.from(selected).filter((f) => {
    for (const items of Object.values(satisfiedCategories)) {
      if (items.includes(f)) return true;
    }
    return Object.keys(satisfiedCategories).map((k) => k.toLowerCase()).includes(f);
  }).length;

  const unsatisfiedCount = selected.size - satisfiedCount;

  return (
    <div>
      {/* Toggle tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: space[4] }}>
        <button
          onClick={() => setMode("satisfied")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: display,
            fontWeight: 600,
            borderRadius: radii.full,
            border: mode === "satisfied" ? "none" : `1px solid ${colors.borderDefault}`,
            backgroundColor: mode === "satisfied" ? colors.successWash : "transparent",
            color: mode === "satisfied" ? colors.success : colors.textMuted,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Needs met {satisfiedCount > 0 && `(${satisfiedCount})`}
        </button>
        <button
          onClick={() => setMode("unsatisfied")}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 12,
            fontFamily: display,
            fontWeight: 600,
            borderRadius: radii.full,
            border: mode === "unsatisfied" ? "none" : `1px solid ${colors.borderDefault}`,
            backgroundColor: mode === "unsatisfied" ? colors.coralWash : "transparent",
            color: mode === "unsatisfied" ? colors.coral : colors.textMuted,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Needs not met {unsatisfiedCount > 0 && `(${unsatisfiedCount})`}
        </button>
      </div>

      {/* Categories */}
      {Object.entries(categories).map(([category, feelings]) => {
        const categorySelected = selected.has(category.toLowerCase());
        return (
          <div key={category} style={{ marginBottom: space[3] }}>
            {/* Category header — also selectable */}
            <button
              onClick={() => onToggle(category.toLowerCase())}
              style={{
                display: "inline-block",
                padding: "4px 10px",
                fontSize: 12,
                fontFamily: display,
                fontWeight: 600,
                borderRadius: radii.sm,
                border: categorySelected
                  ? "none"
                  : `1px solid ${mode === "satisfied" ? "rgba(106, 178, 130, 0.3)" : "rgba(196, 148, 58, 0.3)"}`,
                backgroundColor: categorySelected
                  ? (mode === "satisfied" ? colors.successWash : colors.coralWash)
                  : "transparent",
                color: categorySelected
                  ? (mode === "satisfied" ? colors.success : colors.coral)
                  : colors.textSecondary,
                cursor: "pointer",
                marginBottom: 6,
                transition: "all 0.15s",
              }}
            >
              {category}
            </button>

            {/* Individual feelings */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 4 }}>
              {feelings.map((feeling) => {
                const isSelected = selected.has(feeling);
                return (
                  <button
                    key={feeling}
                    onClick={() => onToggle(feeling)}
                    style={{
                      padding: "3px 10px",
                      fontSize: 11,
                      fontFamily: body,
                      fontWeight: isSelected ? 600 : 400,
                      borderRadius: radii.full,
                      border: isSelected ? "none" : `1px solid ${colors.borderSubtle}`,
                      backgroundColor: isSelected
                        ? (mode === "satisfied" ? "rgba(106, 178, 130, 0.15)" : "rgba(196, 148, 58, 0.15)")
                        : "transparent",
                      color: isSelected
                        ? (mode === "satisfied" ? colors.success : colors.coral)
                        : colors.textMuted,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {feeling}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected summary pills */}
      {selected.size > 0 && (
        <div style={{
          marginTop: space[3],
          padding: `${space[2]}px ${space[3]}px`,
          backgroundColor: colors.bgRecessed,
          borderRadius: radii.sm,
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: display, marginRight: 4 }}>
            Selected:
          </span>
          {Array.from(selected).map((f) => (
            <button
              key={f}
              onClick={() => onToggle(f)}
              style={{
                padding: "2px 8px",
                fontSize: 10,
                fontFamily: body,
                fontWeight: 500,
                borderRadius: radii.full,
                border: "none",
                backgroundColor: colors.coralWash,
                color: colors.coral,
                cursor: "pointer",
              }}
            >
              {f} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
