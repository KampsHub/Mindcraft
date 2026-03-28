"use client";

import React, { useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

// ── Types ──

export interface BodyMarker {
  id: string;
  zone: string;
  sensation: string;
  intensity: number;
  label?: string;
  note?: string;
}

interface BodyMapProps {
  markers: BodyMarker[];
  onChange?: (markers: BodyMarker[]) => void;
  title?: string;
  sensationCategories?: Record<string, string[]>;
}

// ── Constants ──

const ZONES = ["head", "throat", "chest", "stomach", "shoulders", "arms", "hands", "hips", "legs", "feet"] as const;
type Zone = (typeof ZONES)[number];

// Full NVC somatic sensations
const DEFAULT_SENSATION_CATEGORIES: Record<string, string[]> = {
  Posture: ["straight", "hunched", "forward", "centered", "balanced", "stable", "unstable", "open", "closed", "collapsed"],
  Pain: ["sore", "bruised", "achy", "raw", "sharp", "nauseous"],
  Temperature: ["burning", "hot", "warm", "cold", "frozen"],
  Skin: ["itchy", "tingly", "goosebumpy", "flushed", "clammy", "sweaty"],
  Constriction: ["pressure", "stiff", "hard", "dense", "tense", "contracted", "clenched", "knotted", "suffocated"],
  Expansion: ["loose", "releasing", "expanding", "radiating", "melting", "dissolving"],
  Vibration: ["pulsating", "jittery", "twitchy", "wobbly", "trembling", "shaky", "throbbing"],
  "Mind States": ["racy", "dizzy", "spacy", "foggy", "dazed", "drowsy", "still"],
  "Whole Body": ["energised", "strong", "awake", "relaxed", "light", "faint", "limp", "weak", "heavy", "tired", "exhausted"],
};

const CATEGORY_COLORS: Record<string, string> = {
  Posture: colors.plumLight,
  Pain: colors.error,
  Temperature: colors.coralLight,
  Skin: colors.coral,
  Constriction: colors.error,
  Expansion: colors.success,
  Vibration: colors.warning,
  "Mind States": colors.plum,
  "Whole Body": colors.textSecondary,
};

// Zone center positions (x, y) within a 200x440 viewBox
const ZONE_POS: Record<Zone, [number, number]> = {
  head: [100, 38], throat: [100, 80], chest: [100, 125],
  stomach: [100, 175], shoulders: [100, 100], arms: [55, 155],
  hands: [38, 225], hips: [100, 215], legs: [100, 310], feet: [100, 405],
};

const ZONE_RECTS: Record<Zone, [number, number, number, number]> = {
  head: [70, 10, 60, 45], throat: [78, 60, 44, 28],
  chest: [62, 92, 76, 38], stomach: [68, 150, 64, 38],
  shoulders: [40, 88, 120, 20], arms: [30, 110, 30, 80],
  hands: [20, 195, 30, 45], hips: [60, 192, 80, 35],
  legs: [62, 240, 76, 120], feet: [62, 370, 76, 50],
};

const ZONE_RECTS_R: Partial<Record<Zone, [number, number, number, number]>> = {
  arms: [140, 110, 30, 80],
  hands: [150, 195, 30, 45],
};

const SVG_W = 200;
const SVG_H = 440;

const SILHOUETTE = `
M100,8 C85,8 75,18 75,32 C75,48 85,56 100,58 C115,56 125,48 125,32 C125,18 115,8 100,8 Z
M100,62 L100,68
M78,72 C72,72 62,78 55,100 C48,122 42,145 35,175 C30,195 25,210 22,222
C20,230 24,236 30,236 C36,236 40,232 42,224 L60,160
M122,72 C128,72 138,78 145,100 C152,122 158,145 165,175
C170,195 175,210 178,222 C180,230 176,236 170,236 C164,236 160,232 158,224 L140,160
M78,72 L122,72
M78,72 C74,90 68,130 68,175 C68,200 66,220 66,232
C66,240 68,246 72,246 L80,246
M122,72 C126,90 132,130 132,175 C132,200 134,220 134,232
C134,240 132,246 128,246 L120,246
M80,246 C80,250 78,280 76,310 C74,340 72,370 72,390
C72,400 72,412 74,420 C76,428 80,430 86,430
M120,246 C120,250 122,280 124,310 C126,340 128,370 128,390
C128,400 128,412 126,420 C124,428 120,430 114,430
`;

// Find which category a sensation belongs to
function findCategory(sensation: string, cats: Record<string, string[]>): string {
  for (const [cat, items] of Object.entries(cats)) {
    if (items.includes(sensation)) return cat;
  }
  return "Whole Body";
}

// ── Component ──

export default function BodyMap({ markers, onChange, title, sensationCategories }: BodyMapProps) {
  const cats = sensationCategories || DEFAULT_SENSATION_CATEGORIES;
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formNote, setFormNote] = useState("");

  // Multiple markers per zone — group by zone
  const zoneMarkers = (zone: string) => markers.filter((m) => m.zone === zone);
  const zoneHasMarkers = (zone: string) => markers.some((m) => m.zone === zone);
  const isSensationSelected = (zone: string, sensation: string) => markers.some((m) => m.zone === zone && m.sensation === sensation);

  function handleZoneClick(zone: Zone) {
    setFormNote("");
    setEditingZone(zone);
  }

  function handleSensationToggle(sensation: string) {
    if (!editingZone || !onChange) return;
    const existing = markers.find((m) => m.zone === editingZone && m.sensation === sensation);
    if (existing) {
      // Remove this sensation from this zone
      onChange(markers.filter((m) => !(m.zone === editingZone && m.sensation === sensation)));
    } else {
      // Add this sensation to this zone
      const newMarker: BodyMarker = {
        id: `${editingZone}-${sensation}-${Date.now()}`,
        zone: editingZone,
        sensation,
        intensity: 3,
        note: undefined,
      };
      onChange([...markers, newMarker]);
    }
  }

  function handleIntensityChange(sensation: string, intensity: number) {
    if (!editingZone || !onChange) return;
    onChange(markers.map((m) =>
      m.zone === editingZone && m.sensation === sensation ? { ...m, intensity } : m
    ));
  }

  function handleRemoveZone() {
    if (!editingZone || !onChange) return;
    onChange(markers.filter((m) => m.zone !== editingZone));
    setEditingZone(null);
  }

  function getSensationColor(sensation: string): string {
    const cat = findCategory(sensation, cats);
    return CATEGORY_COLORS[cat] || colors.textMuted;
  }

  const dotSize = (intensity: number) => 4 + intensity * 2.5;

  return (
    <div style={{ background: colors.bgDeep, padding: space[4], borderRadius: radii.lg }}>
      {title && <h3 style={{ ...text.heading, color: colors.textPrimary, margin: 0, marginBottom: space[4] }}>{title}</h3>}

      <div style={{ display: "flex", gap: space[4], alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* SVG body */}
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width={160} height={352} style={{ flexShrink: 0 }}>
          <path d={SILHOUETTE} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {/* Zone overlays */}
          {ZONES.map((z) => {
            const [rx, ry, rw, rh] = ZONE_RECTS[z];
            const isActive = zoneHasMarkers(z);
            const isEditing = editingZone === z;
            const zm = zoneMarkers(z);
            const zoneColor = zm.length > 0 ? getSensationColor(zm[0].sensation) : colors.textMuted;
            return (
              <React.Fragment key={z}>
                <rect
                  x={rx} y={ry} width={rw} height={rh} rx={6}
                  fill={isEditing ? "rgba(196,148,58,0.2)" : isActive ? `${zoneColor}22` : "rgba(255,255,255,0.06)"}
                  stroke={isEditing ? colors.coral : isActive ? zoneColor : "rgba(255,255,255,0.12)"}
                  strokeWidth={isEditing ? 1.5 : 0.8}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleZoneClick(z)}
                />
                {ZONE_RECTS_R[z] && (() => {
                  const [rx2, ry2, rw2, rh2] = ZONE_RECTS_R[z]!;
                  return (
                    <rect
                      x={rx2} y={ry2} width={rw2} height={rh2} rx={6}
                      fill={isEditing ? "rgba(196,148,58,0.2)" : isActive ? `${zoneColor}22` : "rgba(255,255,255,0.06)"}
                      stroke={isEditing ? colors.coral : isActive ? zoneColor : "rgba(255,255,255,0.12)"}
                      strokeWidth={isEditing ? 1.5 : 0.8}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleZoneClick(z)}
                    />
                  );
                })()}
              </React.Fragment>
            );
          })}

          {/* Marker dots — multiple per zone, offset slightly */}
          {ZONES.map((z) => {
            const pos = ZONE_POS[z];
            const zm = zoneMarkers(z);
            if (zm.length === 0) return null;
            return (
              <g key={z}>
                {zm.map((m, idx) => {
                  const offsetX = zm.length > 1 ? (idx - (zm.length - 1) / 2) * 10 : 0;
                  const r = dotSize(m.intensity);
                  const c = getSensationColor(m.sensation);
                  return (
                    <g key={m.id}>
                      <circle cx={pos[0] + offsetX} cy={pos[1]} r={r + 3} fill={c} opacity={0.25}>
                        <animate attributeName="r" values={`${r + 2};${r + 6};${r + 2}`} dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={pos[0] + offsetX} cy={pos[1]} r={r} fill={c} />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Zone labels — always visible, bright */}
          {ZONES.map((z) => {
            const [px, py] = ZONE_POS[z];
            const zm = zoneMarkers(z);
            const isEditing = editingZone === z;
            const hasM = zm.length > 0;
            const maxIntensity = hasM ? Math.max(...zm.map((m) => m.intensity)) : 0;
            return (
              <text
                key={z} x={px} y={hasM ? py + dotSize(maxIntensity) + 10 : py}
                textAnchor="middle" fontSize={10}
                fill={isEditing ? colors.coral : "#ffffff"}
                fontWeight={600}
                fontFamily={fonts.display}
                style={{ pointerEvents: "none" }}
              >
                {z}{zm.length > 1 ? ` (${zm.length})` : ""}
              </text>
            );
          })}
        </svg>

        {/* Edit panel — all sensations visible */}
        {editingZone && (
          <div style={{ flex: 1, minWidth: 220, maxHeight: 420, overflowY: "auto" }}>
            {/* Zone name */}
            <div style={{
              fontFamily: fonts.display, fontSize: 16, fontWeight: 700,
              color: colors.coral, textTransform: "capitalize",
              marginBottom: space[3],
            }}>
              {editingZone}
            </div>

            {/* All categories with their sensations inline */}
            {Object.entries(cats).map(([cat, sensations]) => {
              const catColor = CATEGORY_COLORS[cat] || colors.textMuted;
              return (
                <div key={cat} style={{ marginBottom: space[3] }}>
                  <p style={{
                    fontFamily: fonts.display, fontSize: 11, fontWeight: 600,
                    color: catColor, margin: `0 0 ${space[1]}px 0`,
                    textTransform: "uppercase", letterSpacing: "0.03em",
                  }}>
                    {cat}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {sensations.map((s) => {
                      const isSel = editingZone ? isSensationSelected(editingZone, s) : false;
                      return (
                        <button
                          key={s}
                          onClick={() => handleSensationToggle(s)}
                          style={{
                            padding: "4px 10px", fontSize: 11,
                            fontFamily: fonts.bodyAlt, fontWeight: isSel ? 600 : 400,
                            borderRadius: radii.full,
                            border: isSel ? "none" : `1px solid ${colors.borderSubtle}`,
                            backgroundColor: isSel ? `${catColor}22` : "transparent",
                            color: isSel ? catColor : colors.textSecondary,
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {s}{isSel ? " ✓" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Selected sensations for this zone — each with intensity */}
            {editingZone && zoneMarkers(editingZone).length > 0 && (
              <div style={{
                padding: space[2], backgroundColor: colors.bgRecessed,
                borderRadius: radii.md, border: `1px solid ${colors.borderSubtle}`,
                marginBottom: space[3],
              }}>
                <p style={{ ...text.caption, color: colors.textMuted, margin: `0 0 ${space[2]}px 0` }}>
                  Selected ({zoneMarkers(editingZone).length})
                </p>
                {zoneMarkers(editingZone).map((m) => {
                  const c = getSensationColor(m.sensation);
                  return (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: space[2], marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11, fontFamily: fonts.bodyAlt, fontWeight: 600,
                        color: c, minWidth: 70, textTransform: "capitalize",
                      }}>
                        {m.sensation}
                      </span>
                      <input
                        type="range" min={1} max={5} step={1} value={m.intensity}
                        onChange={(e) => handleIntensityChange(m.sensation, Number(e.target.value))}
                        style={{ flex: 1, accentColor: c, height: 4 }}
                      />
                      <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: fonts.display, minWidth: 12 }}>
                        {m.intensity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: space[2] }}>
              {zoneHasMarkers(editingZone) && (
                <button onClick={handleRemoveZone} style={{
                  padding: `${space[2]}px ${space[3]}px`,
                  background: colors.errorWash, color: colors.error,
                  border: "none", borderRadius: radii.sm,
                  cursor: "pointer", fontFamily: fonts.bodyAlt, fontSize: 12,
                }}>
                  Remove
                </button>
              )}
              <button onClick={() => setEditingZone(null)} style={{
                padding: `${space[2]}px ${space[3]}px`,
                background: "transparent", color: colors.textMuted,
                border: `1px solid ${colors.borderSubtle}`, borderRadius: radii.sm,
                cursor: "pointer", fontFamily: fonts.bodyAlt, fontSize: 12,
              }}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary of marked zones — grouped by zone */}
      {markers.length > 0 && !editingZone && (
        <div style={{ marginTop: space[3], display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ZONES.filter((z) => zoneHasMarkers(z)).map((z) => {
            const zm = zoneMarkers(z);
            return (
              <button
                key={z}
                onClick={() => handleZoneClick(z)}
                style={{
                  padding: "4px 10px", fontSize: 11,
                  fontFamily: fonts.bodyAlt, fontWeight: 500,
                  borderRadius: radii.full, border: "none",
                  backgroundColor: `${getSensationColor(zm[0].sensation)}22`,
                  color: getSensationColor(zm[0].sensation),
                  cursor: "pointer",
                }}
              >
                {z}: {zm.map((m) => m.sensation).join(", ")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
