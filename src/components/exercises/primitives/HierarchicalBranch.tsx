"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface BranchLevel {
  id: string;
  label: string;
  prompt: string;
  content: string;
  color?: string;
}

interface HierarchicalBranchProps {
  levels: BranchLevel[];
  onChange?: (levelId: string, content: string) => void;
  title?: string;
}

const LEVEL_COLORS = [colors.coral, colors.coralPressed, colors.plum, colors.plumPressed];
const LEVEL_BGS = [colors.bgSurface, colors.bgRecessed, colors.bgRecessed, colors.bgDeep];
const BASE_WIDTH = 100; // percentage
const SHRINK_PER_LEVEL = 6; // percentage narrower each level
const INDENT_PER_LEVEL = 8; // px additional indent per level
const CARD_GAP = 16;
const CONNECTOR_HEIGHT = 32;

function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      style={{
        width: "100%",
        background: colors.bgInput,
        color: colors.textPrimary,
        fontFamily: fonts.bodyAlt,
        fontSize: text.body.fontSize,
        lineHeight: text.body.lineHeight,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radii.sm,
        padding: `${space[2]}px ${space[3]}px`,
        resize: "none",
        overflow: "hidden",
        outline: "none",
        boxSizing: "border-box",
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.coral;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.borderSubtle;
      }}
    />
  );
}

export default function HierarchicalBranch({
  levels,
  onChange,
  title,
}: HierarchicalBranchProps) {
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    levels.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => new Set(prev).add(i));
      }, i * 180);
    });
  }, [levels.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        background: colors.bgDeep,
        borderRadius: radii.lg,
        padding: space[5],
        fontFamily: fonts.body,
      }}
    >
      {title && (
        <h3
          style={{
            ...text.heading,
            color: colors.textPrimary,
            marginTop: 0,
            marginBottom: space[5],
            textAlign: "center",
          }}
        >
          {title}
        </h3>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {levels.map((level, i) => {
          const borderColor = level.color || LEVEL_COLORS[i % LEVEL_COLORS.length];
          const bgColor = LEVEL_BGS[Math.min(i, LEVEL_BGS.length - 1)];
          const widthPct = Math.max(60, BASE_WIDTH - i * SHRINK_PER_LEVEL);
          const indent = i * INDENT_PER_LEVEL;
          const isVisible = visible.has(i);

          return (
            <React.Fragment key={level.id}>
              {/* Connector SVG between cards */}
              {i > 0 && (
                <svg
                  width="2"
                  height={CONNECTOR_HEIGHT}
                  style={{
                    display: "block",
                    opacity: isVisible ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2={CONNECTOR_HEIGHT - 8}
                    stroke={colors.borderDefault}
                    strokeWidth="2"
                  />
                  <polygon
                    points={`-4,${CONNECTOR_HEIGHT - 10} 1,${CONNECTOR_HEIGHT} 6,${CONNECTOR_HEIGHT - 10}`}
                    fill={colors.borderDefault}
                  />
                </svg>
              )}

              {/* Level card */}
              <div
                style={{
                  width: `${widthPct}%`,
                  marginLeft: indent,
                  background: bgColor,
                  borderRadius: radii.md,
                  borderLeft: `4px solid ${borderColor}`,
                  padding: space[4],
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                  marginBottom: i === levels.length - 1 ? 0 : CARD_GAP / 4,
                }}
              >
                {/* Level label */}
                <div
                  style={{
                    ...text.caption,
                    color: borderColor,
                    textTransform: "uppercase",
                    marginBottom: space[1],
                  }}
                >
                  {level.label}
                </div>

                {/* Guiding prompt */}
                <div
                  style={{
                    ...text.secondary,
                    color: colors.textMuted,
                    fontStyle: "italic",
                    marginBottom: space[3],
                  }}
                >
                  {level.prompt}
                </div>

                {/* Editable textarea */}
                <AutoTextarea
                  value={level.content}
                  onChange={(val) => onChange?.(level.id, val)}
                  placeholder="Write your response..."
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
