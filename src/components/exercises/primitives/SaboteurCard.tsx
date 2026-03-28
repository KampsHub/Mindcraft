"use client";

import React, { useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

// ── Types ──

interface SaboteurData {
  id: string;
  name: string;
  archetype?: string;
  triggerPattern: string;
  exactWords: string;
  protectsFrom: string;
  activationHistory?: { day: number; intensity: number }[];
}

interface SaboteurCardProps {
  saboteur: SaboteurData;
  onChange?: (saboteur: SaboteurData) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

// ── Archetype icon generator (abstract geometric, no faces) ──

function ArchetypeIcon({ archetype, size = 64 }: { archetype?: string; size?: number }) {
  const seed = (archetype || "default").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const shapes = (seed % 3) + 3; // 3-5 shapes
  const baseAngle = (seed * 17) % 360;
  const r = size / 2 - 4;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill={colors.plumDeep} stroke={colors.plum} strokeWidth={1.5} />
      {Array.from({ length: shapes }).map((_, i) => {
        const angle = ((baseAngle + i * (360 / shapes)) * Math.PI) / 180;
        const dist = r * 0.45;
        const cx = size / 2 + Math.cos(angle) * dist;
        const cy = size / 2 + Math.sin(angle) * dist;
        const cr = 4 + (((seed + i) * 7) % 6);
        const opacity = 0.4 + (i / shapes) * 0.5;
        return <circle key={i} cx={cx} cy={cy} r={cr} fill={colors.plumLight} opacity={opacity} />;
      })}
      {/* Center dot */}
      <circle cx={size / 2} cy={size / 2} r={4} fill={colors.coral} opacity={0.9} />
    </svg>
  );
}

// ── Sparkline ──

function Sparkline({ data, width = 120, height = 32 }: { data: { day: number; intensity: number }[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const maxI = Math.max(...data.map((d) => d.intensity), 5);
  const minD = Math.min(...data.map((d) => d.day));
  const maxD = Math.max(...data.map((d) => d.day));
  const rangeD = maxD - minD || 1;

  const points = data.map((d) => {
    const x = ((d.day - minD) / rangeD) * (width - 8) + 4;
    const y = height - 4 - ((d.intensity / maxI) * (height - 8));
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={colors.plumLight} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = ((d.day - minD) / rangeD) * (width - 8) + 4;
        const y = height - 4 - ((d.intensity / maxI) * (height - 8));
        return <circle key={i} cx={x} cy={y} r={2} fill={colors.coral} />;
      })}
    </svg>
  );
}

// ── Inline editable field ──

function EditableField({ value, onSave, multiline, style }: { value: string; onSave: (v: string) => void; multiline?: boolean; style?: React.CSSProperties }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!editing) {
    return (
      <span onClick={() => { setDraft(value); setEditing(true); }} style={{ cursor: "pointer", borderBottom: `1px dashed ${colors.borderSubtle}`, ...style }}>
        {value || "(click to edit)"}
      </span>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: colors.bgInput, color: colors.textPrimary,
    border: `1px solid ${colors.coral}`, borderRadius: radii.sm,
    padding: `${space[1]}px ${space[2]}px`, fontFamily: fonts.body, fontSize: 13,
    resize: multiline ? "vertical" : "none", boxSizing: "border-box",
    ...style,
  };

  const handleDone = () => { onSave(draft); setEditing(false); };

  if (multiline) {
    return (
      <textarea value={draft} rows={2} onChange={(e) => setDraft(e.target.value)} onBlur={handleDone}
        onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
        style={inputStyle} autoFocus />
    );
  }
  return (
    <input value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={handleDone}
      onKeyDown={(e) => { if (e.key === "Enter") handleDone(); if (e.key === "Escape") setEditing(false); }}
      style={inputStyle} autoFocus />
  );
}

// ── Component ──

export default function SaboteurCard({ saboteur, onChange, expanded = false, onToggleExpand }: SaboteurCardProps) {
  const update = (patch: Partial<SaboteurData>) => onChange?.({ ...saboteur, ...patch });

  const cardStyle: React.CSSProperties = {
    background: colors.plumDeep,
    border: `1px solid ${colors.plum}`,
    borderRadius: radii.lg,
    padding: space[5],
    boxShadow: `0 0 16px ${colors.plumWash}, 0 0 2px ${colors.plum}`,
    maxWidth: 400,
    transition: "box-shadow 0.2s",
  };

  return (
    <div style={cardStyle}>
      {/* Header row: icon + name */}
      <div style={{ display: "flex", gap: space[3], alignItems: "center", marginBottom: expanded ? space[4] : 0 }}>
        <ArchetypeIcon archetype={saboteur.archetype} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {onChange ? (
            <EditableField value={saboteur.name} onSave={(v) => update({ name: v })}
              style={{ ...text.heading, color: colors.coral, display: "block", marginBottom: 2 }} />
          ) : (
            <div style={{ ...text.heading, color: colors.coral }}>{saboteur.name}</div>
          )}
          {saboteur.archetype && (
            onChange ? (
              <EditableField value={saboteur.archetype} onSave={(v) => update({ archetype: v })}
                style={{ ...text.secondary, color: colors.plumLight }} />
            ) : (
              <div style={{ ...text.secondary, color: colors.plumLight }}>{saboteur.archetype}</div>
            )
          )}
        </div>
        {onToggleExpand && (
          <button onClick={onToggleExpand} style={{ background: "transparent", border: "none", color: colors.textMuted, cursor: "pointer", fontSize: 18, padding: space[1], lineHeight: 1 }}>
            {expanded ? "\u25B2" : "\u25BC"}
          </button>
        )}
      </div>

      {/* Collapsed: trigger one-liner */}
      {!expanded && (
        <div style={{ ...text.secondary, color: colors.textSecondary, marginTop: space[2], overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {saboteur.triggerPattern}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
          {/* Trigger pattern */}
          <div>
            <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[1], textTransform: "uppercase" }}>Trigger Pattern</div>
            {onChange ? (
              <EditableField value={saboteur.triggerPattern} onSave={(v) => update({ triggerPattern: v })} multiline
                style={{ ...text.body, color: colors.textBody }} />
            ) : (
              <div style={{ ...text.body, color: colors.textBody }}>{saboteur.triggerPattern}</div>
            )}
          </div>

          {/* Exact words */}
          <div>
            <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[1], textTransform: "uppercase" }}>Exact Words</div>
            {onChange ? (
              <EditableField value={saboteur.exactWords} onSave={(v) => update({ exactWords: v })} multiline
                style={{ ...text.body, color: colors.textSecondary, fontStyle: "italic" }} />
            ) : (
              <div style={{ ...text.body, color: colors.textSecondary, fontStyle: "italic" }}>
                &ldquo;{saboteur.exactWords}&rdquo;
              </div>
            )}
          </div>

          {/* Protects from */}
          <div>
            <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[1], textTransform: "uppercase" }}>Protects From</div>
            {onChange ? (
              <EditableField value={saboteur.protectsFrom} onSave={(v) => update({ protectsFrom: v })} multiline
                style={{ ...text.body, color: colors.textBody }} />
            ) : (
              <div style={{ ...text.body, color: colors.textBody }}>{saboteur.protectsFrom}</div>
            )}
          </div>

          {/* Sparkline */}
          {saboteur.activationHistory && saboteur.activationHistory.length >= 2 && (
            <div>
              <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[1], textTransform: "uppercase" }}>Activation History</div>
              <Sparkline data={saboteur.activationHistory} width={200} height={36} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
