"use client";

import React, { useCallback, useRef, useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */
interface StakeholderNode {
  id: string; name: string; role?: string;
  type: "ally" | "neutral" | "blocker" | "unknown";
  x: number; y: number; notes?: string;
}
interface StakeholderMapProps {
  nodes: StakeholderNode[]; selfLabel?: string;
  onChange?: (nodes: StakeholderNode[]) => void;
  onAddNode?: (node: StakeholderNode) => void;
}

/* ── Constants ── */
const TC: Record<StakeholderNode["type"], string> = { ally: colors.success, neutral: colors.textMuted, blocker: colors.error, unknown: colors.plum };
const TL: Record<StakeholderNode["type"], string> = { ally: "Ally", neutral: "Neutral", blocker: "Blocker", unknown: "Unknown" };
const TYPES: StakeholderNode["type"][] = ["ally", "neutral", "blocker", "unknown"];
const NR = 2, SR = 2.4; // node / self radius in SVG units

const inputSt: React.CSSProperties = {
  width: "100%", padding: `${space[2]}px ${space[3]}px`, backgroundColor: colors.bgInput,
  border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm, color: colors.textPrimary,
  fontFamily: text.body.fontFamily, fontSize: text.secondary.fontSize, outline: "none", boxSizing: "border-box",
};
const lblSt: React.CSSProperties = {
  display: "block", ...text.caption, color: colors.textMuted, marginBottom: space[1],
};
const btnSt: React.CSSProperties = {
  padding: `${space[2]}px ${space[4]}px`, backgroundColor: colors.bgElevated, color: colors.textPrimary,
  border: "none", borderRadius: radii.sm, fontFamily: text.secondary.fontFamily, fontSize: text.secondary.fontSize, cursor: "pointer",
};

/* ── Component ── */
export default function StakeholderMap({ nodes, selfLabel = "You", onChange, onAddNode }: StakeholderMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<StakeholderNode>>({});

  const toSvg = useCallback((cx: number, cy: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 50, y: 50 };
    const r = svg.getBoundingClientRect();
    return { x: Math.max(5, Math.min(95, ((cx - r.left) / r.width) * 100)), y: Math.max(5, Math.min(95, ((cy - r.top) / r.height) * 100)) };
  }, []);

  const onPtrDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault(); (e.target as SVGElement).setPointerCapture(e.pointerId); setDragId(id);
  }, []);
  const onPtrMove = useCallback((e: React.PointerEvent) => {
    if (!dragId) return;
    const { x, y } = toSvg(e.clientX, e.clientY);
    onChange?.(nodes.map((n) => (n.id === dragId ? { ...n, x, y } : n)));
  }, [dragId, nodes, onChange, toSvg]);
  const onPtrUp = useCallback(() => setDragId(null), []);

  const openEdit = (n: StakeholderNode) => { setEditId(n.id); setDraft({ name: n.name, role: n.role, type: n.type, notes: n.notes }); };
  const saveEdit = () => { if (!editId) return; onChange?.(nodes.map((n) => (n.id === editId ? { ...n, ...draft } : n))); setEditId(null); };
  const addNode = () => {
    const n: StakeholderNode = { id: `node-${Date.now()}`, name: "New person", type: "unknown", x: 25 + Math.random() * 50, y: 25 + Math.random() * 50 };
    onAddNode ? onAddNode(n) : onChange?.([...nodes, n]);
  };

  const editNode = editId ? nodes.find((n) => n.id === editId) : null;

  return (
    <div style={{ fontFamily: fonts.body, userSelect: "none" }}>
      {/* Legend */}
      <div style={{ display: "flex", gap: space[4], marginBottom: space[3], flexWrap: "wrap" }}>
        {TYPES.map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: space[1] }}>
            <div style={{ width: 10, height: 10, borderRadius: radii.full, backgroundColor: TC[t] }} />
            <span style={{ ...text.caption, color: colors.textMuted }}>{TL[t]}</span>
          </div>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} viewBox="0 0 100 100" onPointerMove={onPtrMove} onPointerUp={onPtrUp} onPointerCancel={onPtrUp}
        style={{ width: "100%", aspectRatio: "1", backgroundColor: colors.bgDeep, borderRadius: radii.md, border: `1px solid ${colors.borderSubtle}`, touchAction: "none", display: "block" }}>
        {/* Concentric rings */}
        {[35, 23, 12].map((r, i) => (
          <circle key={i} cx={50} cy={50} r={r} fill="none" stroke={colors.borderSubtle} strokeWidth={0.3} strokeDasharray="1.5 1" />
        ))}
        {/* Ring labels */}
        {[["low influence", 35.5], ["moderate influence", 23.5], ["high influence", 12.5]].map(([label, off]) => (
          <text key={label as string} x={50} y={50 - (off as number)} textAnchor="middle" fill="#FFFFFF" fontSize={2} opacity={0.6} fontFamily={fonts.display}>{label as string}</text>
        ))}
        {/* Connection lines */}
        {nodes.map((n) => <line key={`l-${n.id}`} x1={50} y1={50} x2={n.x} y2={n.y} stroke={colors.borderSubtle} strokeWidth={0.3} />)}
        {/* Self */}
        <circle cx={50} cy={50} r={SR} fill={colors.coral} />
        <text x={50} y={50 + SR + 2.8} textAnchor="middle" fill={colors.textPrimary} fontSize={2.5} fontWeight={700} fontFamily={fonts.display}>{selfLabel}</text>
        {/* Stakeholder nodes */}
        {nodes.map((n) => {
          const c = TC[n.type]; const isEd = editId === n.id;
          return (
            <g key={n.id} style={{ cursor: dragId === n.id ? "grabbing" : "grab" }}>
              <circle cx={n.x} cy={n.y} r={NR} fill={c} opacity={isEd ? 1 : 0.85}
                stroke={isEd ? colors.textPrimary : "none"} strokeWidth={isEd ? 0.4 : 0}
                onPointerDown={(e) => onPtrDown(e, n.id)} onClick={() => openEdit(n)} />
              <text x={n.x} y={n.y + NR + 2.8} textAnchor="middle" fill={colors.textSecondary} fontSize={2.2} fontFamily={fonts.body} pointerEvents="none">{n.name}</text>
              {n.role && <text x={n.x} y={n.y + NR + 5} textAnchor="middle" fill={colors.textMuted} fontSize={1.8} fontFamily={fonts.body} pointerEvents="none">{n.role}</text>}
            </g>
          );
        })}
      </svg>

      <button onClick={addNode} style={{ ...btnSt, marginTop: space[3] }}>+ Add person</button>

      {/* Edit panel */}
      {editNode && (
        <div style={{ marginTop: space[3], padding: space[4], backgroundColor: colors.bgSurface, borderRadius: radii.md, border: `1px solid ${colors.borderDefault}` }}>
          <div style={{ ...text.caption, color: colors.textMuted, marginBottom: space[3] }}>EDIT STAKEHOLDER</div>
          <label style={lblSt}>Name</label>
          <input style={inputSt} value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <label style={{ ...lblSt, marginTop: space[3] }}>Role</label>
          <input style={inputSt} value={draft.role ?? ""} placeholder="e.g. Manager, Skip-level" onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          <label style={{ ...lblSt, marginTop: space[3] }}>Type</label>
          <div style={{ display: "flex", gap: space[2], flexWrap: "wrap", marginTop: space[1] }}>
            {TYPES.map((t) => (
              <button key={t} onClick={() => setDraft({ ...draft, type: t })} style={{
                padding: `${space[1]}px ${space[3]}px`, borderRadius: radii.full, cursor: "pointer",
                border: `1px solid ${draft.type === t ? TC[t] : colors.borderDefault}`,
                backgroundColor: draft.type === t ? TC[t] + "22" : "transparent",
                color: draft.type === t ? TC[t] : colors.textMuted, fontFamily: text.caption.fontFamily, fontSize: text.caption.fontSize,
              }}>{TL[t]}</button>
            ))}
          </div>
          <label style={{ ...lblSt, marginTop: space[3] }}>Notes</label>
          <textarea style={{ ...inputSt, minHeight: 60, resize: "vertical" }} value={draft.notes ?? ""} placeholder="Relationship notes..." onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          <div style={{ display: "flex", gap: space[2], marginTop: space[4] }}>
            <button onClick={saveEdit} style={btnSt}>Save</button>
            <button onClick={() => setEditId(null)} style={{ ...btnSt, backgroundColor: "transparent", color: colors.textMuted, border: `1px solid ${colors.borderDefault}` }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
