"use client";

import React, { useState, useCallback } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface HeatmapCell { rowId: string; colId: string; value: number; note?: string }

interface HeatmapTrackerProps {
  rows: { id: string; label: string }[];
  columns: { id: string; label: string }[];
  cells: HeatmapCell[];
  onChange?: (rowId: string, colId: string, value: number) => void;
  onNoteChange?: (rowId: string, colId: string, note: string) => void;
  title?: string;
}

const SZ = 40;
const COLORS = [colors.bgRecessed, colors.plumWash, "rgba(123,82,120,0.3)", colors.plum, colors.coralWash, colors.coral];
const txtCol = (v: number) => (v >= 3 ? colors.textPrimary : colors.textMuted);
const capStyle: React.CSSProperties = { ...text.caption, color: colors.textMuted, textAlign: "center", fontWeight: 600 };

function find(cells: HeatmapCell[], r: string, c: string) {
  return cells.find((x) => x.rowId === r && x.colId === c) ?? { rowId: r, colId: c, value: 0 } as HeatmapCell;
}

export default function HeatmapTracker({ rows, columns, cells, onChange, onNoteChange, title }: HeatmapTrackerProps) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [editing, setEditing] = useState<{ rowId: string; colId: string } | null>(null);
  const [noteVal, setNoteVal] = useState("");

  const click = useCallback((r: string, c: string) => {
    if (!onChange) return;
    onChange(r, c, (find(cells, r, c).value + 1) % 6);
  }, [cells, onChange]);

  const ctx = useCallback((e: React.MouseEvent, r: string, c: string) => {
    e.preventDefault();
    setEditing({ rowId: r, colId: c });
    setNoteVal(find(cells, r, c).note ?? "");
  }, [cells]);

  const save = useCallback(() => {
    if (editing && onNoteChange) onNoteChange(editing.rowId, editing.colId, noteVal);
    setEditing(null);
    setNoteVal("");
  }, [editing, noteVal, onNoteChange]);

  const rowSum = (r: string) => columns.reduce((s, c) => s + find(cells, r, c.id).value, 0);
  const colSum = (c: string) => rows.reduce((s, r) => s + find(cells, r.id, c).value, 0);

  return (
    <div style={{ background: colors.bgDeep, borderRadius: radii.lg, padding: space[5], fontFamily: fonts.bodyAlt, position: "relative" }}>
      {title && <h3 style={{ ...text.heading, color: colors.textPrimary, marginBottom: space[4], fontSize: 16 }}>{title}</h3>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "auto" }}>
          <thead>
            <tr>
              <th style={{ width: 120 }} />
              {columns.map((c) => (
                <th key={c.id} style={{ ...capStyle, width: SZ, padding: `0 0 ${space[2]}px 0` }}>{c.label}</th>
              ))}
              <th style={{ ...capStyle, width: SZ, paddingLeft: space[2] }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={{ ...text.secondary, color: colors.textSecondary, paddingRight: space[3], whiteSpace: "nowrap", verticalAlign: "middle" }}>
                  {row.label}
                </td>
                {columns.map((col) => {
                  const cell = find(cells, row.id, col.id);
                  return (
                    <td key={col.id} style={{ padding: 1 }}>
                      <div
                        onClick={() => click(row.id, col.id)}
                        onContextMenu={(e) => ctx(e, row.id, col.id)}
                        onMouseEnter={(e) => {
                          if (cell.note) {
                            const r = (e.target as HTMLElement).getBoundingClientRect();
                            setTip({ x: r.left + r.width / 2, y: r.top - 8, text: cell.note });
                          }
                        }}
                        onMouseLeave={() => setTip(null)}
                        style={{
                          width: SZ, height: SZ, background: COLORS[cell.value] ?? COLORS[0],
                          borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", border: `1px solid ${colors.borderSubtle}`, transition: "background 0.15s",
                          position: "relative",
                        }}
                      >
                        {cell.value > 0 && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: txtCol(cell.value), fontFamily: fonts.display }}>{cell.value}</span>
                        )}
                        {cell.note && (
                          <span style={{ position: "absolute", top: 2, right: 3, width: 4, height: 4, borderRadius: "50%", background: colors.coralLight }} />
                        )}
                      </div>
                    </td>
                  );
                })}
                <td style={{ ...capStyle, paddingLeft: space[2], verticalAlign: "middle" }}>{rowSum(row.id)}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...capStyle, textAlign: "right", paddingRight: space[3], paddingTop: space[2] }}>Total</td>
              {columns.map((c) => (
                <td key={c.id} style={{ ...capStyle, paddingTop: space[2], padding: 1 }}>{colSum(c.id)}</td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      {tip && (
        <div style={{
          position: "fixed", left: tip.x, top: tip.y, transform: "translate(-50%,-100%)",
          background: colors.bgElevated, color: colors.textPrimary, fontSize: text.caption.fontSize,
          fontFamily: fonts.bodyAlt, padding: `${space[1]}px ${space[3]}px`, borderRadius: radii.sm,
          border: `1px solid ${colors.borderDefault}`, pointerEvents: "none", zIndex: 1000, maxWidth: 200,
        }}>
          {tip.text}
        </div>
      )}

      {editing && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}
          onClick={save}
        >
          <div style={{ background: colors.bgSurface, borderRadius: radii.md, padding: space[5], width: 280, border: `1px solid ${colors.borderDefault}` }} onClick={(e) => e.stopPropagation()}>
            <p style={{ ...text.secondary, color: colors.textSecondary, marginBottom: space[3] }}>Add a note</p>
            <textarea
              value={noteVal} onChange={(e) => setNoteVal(e.target.value)} autoFocus rows={3}
              style={{
                width: "100%", background: colors.bgInput, border: `1px solid ${colors.borderDefault}`,
                borderRadius: radii.sm, color: colors.textPrimary, fontSize: text.secondary.fontSize,
                fontFamily: fonts.bodyAlt, padding: space[3], resize: "vertical", outline: "none", boxSizing: "border-box",
              }}
            />
            <button onClick={save} style={{
              marginTop: space[3], padding: `${space[2]}px ${space[4]}px`, background: colors.coral,
              color: colors.bgDeep, border: "none", borderRadius: radii.full, fontSize: text.secondary.fontSize,
              fontFamily: fonts.bodyAlt, fontWeight: 600, cursor: "pointer",
            }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
