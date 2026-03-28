"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */

interface DialogueTurn {
  id: string;
  voice: string;
  prompt?: string;
  content: string;
}

interface Voice {
  id: string;
  label: string;
  color: string;
}

interface DialogueSequenceProps {
  voices: Voice[];
  turns: DialogueTurn[];
  onChange?: (turns: DialogueTurn[]) => void;
  onAddTurn?: (voiceId: string) => void;
  title?: string;
}

/* ── Auto-resize textarea ── */

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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

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
        backgroundColor: "transparent",
        border: "none",
        resize: "none",
        overflow: "hidden",
        outline: "none",
        padding: 0,
        boxSizing: "border-box",
      }}
    />
  );
}

/* ── Main Component ── */

export default function DialogueSequence({
  voices,
  turns,
  onChange,
  onAddTurn,
  title,
}: DialogueSequenceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(turns.length);
  const voiceMap = Object.fromEntries(voices.map((v) => [v.id, v]));

  // Smooth scroll when a turn is added
  useEffect(() => {
    if (turns.length > prevLen.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    prevLen.current = turns.length;
  }, [turns.length]);

  const updateTurn = useCallback(
    (turnId: string, content: string) => {
      if (!onChange) return;
      onChange(turns.map((t) => (t.id === turnId ? { ...t, content } : t)));
    },
    [turns, onChange],
  );

  // Determine side: alternate based on voice index
  const voiceIndex = (voiceId: string) => voices.findIndex((v) => v.id === voiceId);
  const isLeft = (voiceId: string) => voiceIndex(voiceId) % 2 === 0;

  return (
    <div style={{ backgroundColor: colors.bgDeep, fontFamily: fonts.body }}>
      {title && (
        <h3 style={{
          ...text.heading,
          color: colors.textPrimary,
          margin: 0,
          marginBottom: space[5],
        }}>
          {title}
        </h3>
      )}

      {/* Thread container */}
      <div style={{ position: "relative", paddingLeft: 20 }}>
        {/* Vertical thread line */}
        {turns.length > 1 && (
          <div style={{
            position: "absolute",
            left: 8,
            top: 12,
            bottom: 40,
            width: 2,
            backgroundColor: colors.borderSubtle,
            borderRadius: radii.full,
          }} />
        )}

        {/* Turns */}
        <div style={{ display: "flex", flexDirection: "column", gap: space[4] }}>
          {turns.map((turn) => {
            const voice = voiceMap[turn.voice];
            const left = isLeft(turn.voice);
            const bubbleColor = voice?.color ?? colors.textMuted;

            return (
              <div key={turn.id} style={{ position: "relative" }}>
                {/* Thread dot */}
                <div style={{
                  position: "absolute",
                  left: -16,
                  top: 14,
                  width: 10,
                  height: 10,
                  borderRadius: radii.full,
                  backgroundColor: bubbleColor,
                  border: `2px solid ${colors.bgDeep}`,
                  zIndex: 1,
                }} />

                {/* Bubble wrapper — shift left or right */}
                <div style={{
                  display: "flex",
                  justifyContent: left ? "flex-start" : "flex-end",
                }}>
                  <div style={{
                    maxWidth: "85%",
                    minWidth: 180,
                  }}>
                    {/* Voice label */}
                    <span style={{
                      ...text.caption,
                      color: bubbleColor,
                      display: "block",
                      marginBottom: space[1],
                      textAlign: left ? "left" : "right",
                    }}>
                      {voice?.label ?? turn.voice}
                    </span>

                    {/* Bubble */}
                    <div style={{
                      backgroundColor: `${bubbleColor}18`,
                      border: `1px solid ${bubbleColor}44`,
                      borderRadius: radii.md,
                      padding: space[4],
                    }}>
                      {/* Guided prompt */}
                      {turn.prompt && (
                        <p style={{
                          ...text.secondary,
                          color: colors.textMuted,
                          fontStyle: "italic",
                          margin: 0,
                          marginBottom: space[2],
                        }}>
                          {turn.prompt}
                        </p>
                      )}

                      <AutoTextarea
                        value={turn.content}
                        onChange={(v) => updateTurn(turn.id, v)}
                        placeholder="Write here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Voice selector buttons */}
      {onAddTurn && (
        <div style={{
          display: "flex",
          gap: space[2],
          marginTop: space[5],
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          {voices.map((v) => (
            <button
              key={v.id}
              onClick={() => onAddTurn(v.id)}
              style={{
                ...text.secondary,
                fontWeight: 600,
                padding: `${space[2]}px ${space[4]}px`,
                borderRadius: radii.full,
                border: `1px solid ${v.color}66`,
                backgroundColor: `${v.color}15`,
                color: v.color,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              + {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
