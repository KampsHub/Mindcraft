"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface AnnotationTag {
  id: string;
  label: string;
  color: string;
}

interface SplitRow {
  id: string;
  leftText: string;
  rightText: string;
  tags: string[];
}

interface SplitAnnotatorProps {
  leftColumnLabel: string;
  rightColumnLabel: string;
  rows: SplitRow[];
  availableTags: AnnotationTag[];
  onChange?: (rows: SplitRow[]) => void;
  onAddRow?: () => void;
}

/* ── Auto-resize textarea hook ── */

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

/* ── Sub-components ── */

function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useAutoResize(value);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      style={{
        ...text.body,
        width: "100%",
        color: colors.textPrimary,
        backgroundColor: colors.bgInput,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radii.sm,
        padding: space[3],
        resize: "none",
        overflow: "hidden",
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}

/* ── Main Component ── */

export default function SplitAnnotator({
  leftColumnLabel,
  rightColumnLabel,
  rows,
  availableTags,
  onChange,
  onAddRow,
}: SplitAnnotatorProps) {
  const tagMap = Object.fromEntries(availableTags.map((t) => [t.id, t]));

  const updateRow = useCallback(
    (rowId: string, patch: Partial<SplitRow>) => {
      if (!onChange) return;
      onChange(rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
    },
    [rows, onChange],
  );

  const toggleTag = useCallback(
    (rowId: string, tagId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row || !onChange) return;
      const next = row.tags.includes(tagId)
        ? row.tags.filter((t) => t !== tagId)
        : [...row.tags, tagId];
      updateRow(rowId, { tags: next });
    },
    [rows, onChange, updateRow],
  );

  return (
    <div style={{ backgroundColor: colors.bgDeep, fontFamily: fonts.body }}>
      {/* Column headers */}
      <div style={{ display: "flex", gap: space[3], marginBottom: space[3] }}>
        <div style={{ flex: 1, paddingLeft: space[3] }}>
          <span style={{ ...text.caption, color: colors.plumLight, textTransform: "uppercase" }}>
            {leftColumnLabel}
          </span>
        </div>
        <div style={{ flex: 1, paddingLeft: space[3] }}>
          <span style={{ ...text.caption, color: colors.coralLight, textTransform: "uppercase" }}>
            {rightColumnLabel}
          </span>
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
        {rows.map((row) => (
          <div key={row.id}>
            {/* Two-column text */}
            <div style={{ display: "flex", gap: space[3] }}>
              <div style={{
                flex: 1,
                borderLeft: `3px solid ${colors.plumLight}`,
                paddingLeft: space[3],
              }}>
                <AutoTextarea
                  value={row.leftText}
                  onChange={(v) => updateRow(row.id, { leftText: v })}
                  placeholder="Source / fact..."
                />
              </div>
              <div style={{
                flex: 1,
                borderLeft: `3px solid ${colors.coralLight}`,
                paddingLeft: space[3],
              }}>
                <AutoTextarea
                  value={row.rightText}
                  onChange={(v) => updateRow(row.id, { rightText: v })}
                  placeholder="Interpretation..."
                />
              </div>
            </div>

            {/* Tag chips */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: space[2],
              marginTop: space[2],
              paddingLeft: space[3],
            }}>
              {availableTags.map((tag) => {
                const active = row.tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(row.id, tag.id)}
                    style={{
                      ...text.caption,
                      padding: `2px ${space[3]}px`,
                      borderRadius: radii.full,
                      border: `1px solid ${active ? tag.color : colors.borderSubtle}`,
                      backgroundColor: active ? `${tag.color}22` : "transparent",
                      color: active ? tag.color : colors.textMuted,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Active tag pills */}
            {row.tags.length > 0 && (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: space[1],
                marginTop: space[2],
                paddingLeft: space[3],
              }}>
                {row.tags.map((tid) => {
                  const t = tagMap[tid];
                  if (!t) return null;
                  return (
                    <span key={tid} style={{
                      ...text.caption,
                      fontSize: 10,
                      padding: `1px ${space[2]}px`,
                      borderRadius: radii.full,
                      backgroundColor: `${t.color}33`,
                      color: t.color,
                    }}>
                      {t.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add row button */}
      {onAddRow && (
        <button
          onClick={onAddRow}
          style={{
            ...text.secondary,
            marginTop: space[4],
            padding: `${space[2]}px ${space[4]}px`,
            color: colors.textMuted,
            backgroundColor: "transparent",
            border: `1px dashed ${colors.borderDefault}`,
            borderRadius: radii.sm,
            cursor: "pointer",
            width: "100%",
            transition: "border-color 0.15s",
          }}
        >
          + Add row
        </button>
      )}
    </div>
  );
}
