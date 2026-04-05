"use client";

import React, { useState, useCallback } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface VennItem { id: string; label: string }
type Zone = "left" | "overlap" | "right" | "unplaced";

interface VennOverlapProps {
  leftLabel: string;
  rightLabel: string;
  items: VennItem[];
  placements: Record<string, Zone>;
  onChange?: (itemId: string, zone: "left" | "overlap" | "right") => void;
  onAddItem?: (item: VennItem) => void;
}

const W = 480, H = 320, CY = 170, R = 125, LX = 175, RX = 305;

const zoneCenter = (z: "left" | "overlap" | "right") => {
  if (z === "left") return { x: LX - 40, y: CY };
  if (z === "right") return { x: RX + 40, y: CY };
  return { x: (LX + RX) / 2, y: CY };
};

const inZone = (items: VennItem[], p: Record<string, Zone>, z: Zone) =>
  items.filter((i) => (p[i.id] ?? "unplaced") === z);

export default function VennOverlap({ leftLabel, rightLabel, items, placements, onChange, onAddItem }: VennOverlapProps) {
  const [sel, setSel] = useState<string | null>(null);
  const [newTrait, setNewTrait] = useState("");

  const placeInZone = useCallback((zone: "left" | "overlap" | "right") => {
    if (sel && onChange) { onChange(sel, zone); setSel(null); }
  }, [sel, onChange]);

  const handleAdd = useCallback(() => {
    const label = newTrait.trim();
    if (!label || !onAddItem) return;
    onAddItem({ id: `item-${Date.now()}`, label });
    setNewTrait("");
  }, [newTrait, onAddItem]);

  const unplaced = inZone(items, placements, "unplaced");
  const cur = sel ? "pointer" : "default";

  const renderZoneItems = (zone: "left" | "overlap" | "right") => {
    const zi = inZone(items, placements, zone);
    const c = zoneCenter(zone);
    return zi.map((item, i) => {
      const y = c.y - ((zi.length - 1) * 18) / 2 + i * 18;
      return (
        <text key={item.id} x={c.x} y={y} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 11, fontFamily: fonts.bodyAlt, fill: colors.textPrimary, cursor: "pointer",
            fontWeight: sel === item.id ? 700 : 400, textDecoration: sel === item.id ? "underline" : "none" }}
          onClick={(e) => { e.stopPropagation(); setSel(item.id); }}>
          {item.label}
        </text>
      );
    });
  };

  return (
    <div style={{ background: colors.bgDeep, borderRadius: radii.lg, padding: space[5], fontFamily: fonts.bodyAlt }}>
      {/* Unplaced chips */}
      {unplaced.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: space[2], marginBottom: space[4] }}>
          {unplaced.map((item) => (
            <button key={item.id} onClick={() => setSel(sel === item.id ? null : item.id)} style={{
              padding: `${space[1]}px ${space[3]}px`, borderRadius: radii.full,
              border: `1px solid ${sel === item.id ? colors.coral : colors.borderDefault}`,
              background: sel === item.id ? colors.coralWash : colors.bgSurface,
              color: colors.textPrimary, fontSize: text.caption.fontSize, fontFamily: fonts.bodyAlt,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {sel && (
        <p style={{ ...text.caption, color: colors.textMuted, marginBottom: space[2], textAlign: "center" }}>
          Click a zone to place &ldquo;{items.find((i) => i.id === sel)?.label}&rdquo;
        </p>
      )}

      {/* SVG Venn diagram */}
      <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ display: "block", maxWidth: W, margin: "0 auto" }}>
        <text x={LX - 30} y={24} textAnchor="middle"
          style={{ fontSize: 13, fontFamily: fonts.display, fontWeight: 600, fill: colors.plumLight }}>
          {leftLabel}
        </text>
        <text x={RX + 30} y={24} textAnchor="middle"
          style={{ fontSize: 13, fontFamily: fonts.display, fontWeight: 600, fill: colors.coralLight }}>
          {rightLabel}
        </text>

        {/* Left circle */}
        <circle cx={LX} cy={CY} r={R} fill="rgba(123,82,120,0.25)" stroke={colors.plum}
          strokeWidth={1.5} style={{ cursor: cur }} onClick={() => placeInZone("left")} />
        {/* Right circle */}
        <circle cx={RX} cy={CY} r={R} fill="rgba(196,148,58,0.2)" stroke={colors.coral}
          strokeWidth={1.5} style={{ cursor: cur }} onClick={() => placeInZone("right")} />
        {/* Overlap hit area */}
        <clipPath id="venn-clip-left"><circle cx={LX} cy={CY} r={R} /></clipPath>
        <circle cx={RX} cy={CY} r={R} clipPath="url(#venn-clip-left)" fill="rgba(180,120,100,0.3)"
          style={{ cursor: cur }} onClick={(e) => { e.stopPropagation(); placeInZone("overlap"); }} />

        {renderZoneItems("left")}
        {renderZoneItems("overlap")}
        {renderZoneItems("right")}
      </svg>

      {/* Add trait input */}
      {onAddItem && (
        <div style={{ display: "flex", gap: space[2], marginTop: space[4] }}>
          <input type="text" value={newTrait} onChange={(e) => setNewTrait(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="What else is true about you? Add it here..."
            style={{ flex: 1, padding: `${space[2]}px ${space[3]}px`, background: colors.bgInput,
              border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm, color: colors.textPrimary,
              fontSize: text.secondary.fontSize, fontFamily: fonts.bodyAlt, outline: "none" }} />
          <button onClick={handleAdd} style={{ padding: `${space[2]}px ${space[4]}px`, background: colors.bgElevated,
            border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm, color: colors.textSecondary,
            fontSize: text.secondary.fontSize, fontFamily: fonts.bodyAlt, cursor: "pointer" }}>
            Add
          </button>
        </div>
      )}
    </div>
  );
}
