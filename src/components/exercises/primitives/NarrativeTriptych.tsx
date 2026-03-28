"use client";

import React, { useCallback, useRef, useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface Panel {
  id: string;
  title: string;
  subtitle?: string;
  placeholder?: string;
  content: string;
}

interface NarrativeTriptychProps {
  panels: Panel[];
  onChange?: (panelId: string, content: string) => void;
  highlightDifferences?: boolean;
}

/* ── Helpers ── */

const wordCount = (s: string): number =>
  s.trim() ? s.trim().split(/\s+/).length : 0;

/* ── Main Component ── */

export default function NarrativeTriptych({
  panels,
  onChange,
}: NarrativeTriptychProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, []);

  const handleChange = useCallback(
    (panelId: string, value: string) => {
      onChange?.(panelId, value);
      autoResize(textareaRefs.current[panelId] ?? null);
    },
    [onChange, autoResize],
  );

  const setRef = useCallback(
    (panelId: string) => (el: HTMLTextAreaElement | null) => {
      textareaRefs.current[panelId] = el;
      autoResize(el);
    },
    [autoResize],
  );

  const totalWords = panels.reduce((sum, p) => sum + wordCount(p.content), 0);

  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: radii.lg,
      border: `1px solid ${colors.borderDefault}`,
      padding: space[5],
      fontFamily: fonts.body,
    }}>
      {/* Panels */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: space[4],
      }}>
        {panels.map((panel) => {
          const active = focusedId === panel.id;
          return (
            <div
              key={panel.id}
              style={{
                display: "flex",
                flexDirection: "column",
                borderRadius: radii.md,
                backgroundColor: colors.bgRecessed,
                border: `1px solid ${active ? colors.coral : colors.borderSubtle}`,
                borderTop: `3px solid ${active ? colors.coral : colors.borderSubtle}`,
                opacity: focusedId && !active ? 0.7 : 1,
                transition: "opacity 0.2s, border-color 0.2s",
              }}
            >
              {/* Header */}
              <div style={{ padding: `${space[3]}px ${space[4]}px ${space[2]}px` }}>
                <h4 style={{
                  ...text.heading,
                  fontSize: 15,
                  color: colors.textPrimary,
                  margin: 0,
                }}>
                  {panel.title}
                </h4>
                {panel.subtitle && (
                  <p style={{
                    ...text.caption,
                    color: colors.textMuted,
                    margin: `${space[1]}px 0 0`,
                  }}>
                    {panel.subtitle}
                  </p>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={setRef(panel.id)}
                value={panel.content}
                placeholder={panel.placeholder ?? "Begin writing..."}
                onChange={(e) => handleChange(panel.id, e.target.value)}
                onFocus={() => setFocusedId(panel.id)}
                onBlur={() => setFocusedId(null)}
                style={{
                  ...text.body,
                  color: colors.textPrimary,
                  backgroundColor: colors.bgInput,
                  border: "none",
                  outline: "none",
                  resize: "none",
                  minHeight: 160,
                  padding: space[4],
                  margin: `0 ${space[3]}px`,
                  borderRadius: radii.sm,
                  fontFamily: fonts.serif,
                  lineHeight: 1.8,
                }}
              />

              {/* Char count */}
              <div style={{
                ...text.caption,
                color: colors.textMuted,
                textAlign: "right",
                padding: `${space[2]}px ${space[4]}px ${space[3]}px`,
              }}>
                {panel.content.length} chars&ensp;·&ensp;{wordCount(panel.content)} words
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison summary */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: space[4],
        padding: `${space[3]}px ${space[4]}px`,
        backgroundColor: colors.bgRecessed,
        borderRadius: radii.sm,
        flexWrap: "wrap",
        gap: space[2],
      }}>
        {panels.map((panel) => (
          <span key={panel.id} style={{ ...text.caption, color: colors.textSecondary }}>
            {panel.title}: <strong style={{ color: colors.textPrimary }}>{wordCount(panel.content)}</strong> words
          </span>
        ))}
        <span style={{ ...text.caption, color: colors.textMuted }}>
          Total: {totalWords} words
        </span>
      </div>
    </div>
  );
}
