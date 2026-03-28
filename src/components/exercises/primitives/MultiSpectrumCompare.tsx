"use client";

import React, { useCallback, useRef, useState } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

/* ── Types ── */
interface SpectrumDimension { id: string; label: string; leftLabel: string; rightLabel: string }
interface SpectrumMarker { dimensionId: string; markerId: string; label: string; value: number; color?: string }
interface MultiSpectrumCompareProps {
  dimensions: SpectrumDimension[];
  markers: SpectrumMarker[];
  onChange?: (markerId: string, dimensionId: string, value: number) => void;
  legend?: { id: string; label: string; color: string }[];
}

/* ── Constants ── */
const clamp = (v: number) => Math.max(0, Math.min(100, v));
const TRACK_H = 6;
const MR = 10; // marker radius px

const trackBase: React.CSSProperties = {
  position: "absolute", top: "50%", left: 0, right: 0, height: TRACK_H,
  transform: "translateY(-50%)", borderRadius: radii.full,
};

/* ── Component ── */
export default function MultiSpectrumCompare({ dimensions, markers, onChange, legend }: MultiSpectrumCompareProps) {
  const trackRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dragInfo, setDragInfo] = useState<{ markerId: string; dimensionId: string } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const posFrom = useCallback((dimId: string, cx: number): number => {
    const t = trackRefs.current.get(dimId);
    if (!t) return 50;
    const r = t.getBoundingClientRect();
    return clamp(((cx - r.left) / r.width) * 100);
  }, []);

  const onDown = useCallback((e: React.PointerEvent, mid: string, did: string) => {
    e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragInfo({ markerId: mid, dimensionId: did });
    onChange?.(mid, did, Math.round(posFrom(did, e.clientX)));
  }, [onChange, posFrom]);

  const onMove = useCallback((e: React.PointerEvent, did: string) => {
    if (!dragInfo || dragInfo.dimensionId !== did) return;
    onChange?.(dragInfo.markerId, did, Math.round(posFrom(did, e.clientX)));
  }, [dragInfo, onChange, posFrom]);

  const onUp = useCallback(() => setDragInfo(null), []);

  return (
    <div style={{ fontFamily: fonts.body, userSelect: "none" }}>
      {/* Legend */}
      {legend && legend.length > 0 && (
        <div style={{ display: "flex", gap: space[4], marginBottom: space[4], flexWrap: "wrap" }}>
          {legend.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: space[2] }}>
              <div style={{ width: MR * 2, height: MR * 2, borderRadius: radii.full, backgroundColor: item.color, opacity: 0.85 }} />
              <span style={{ ...text.caption, color: colors.textSecondary }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dimensions */}
      <div style={{ display: "flex", flexDirection: "column", gap: space[5] }}>
        {dimensions.map((dim) => {
          const dm = markers.filter((m) => m.dimensionId === dim.id);
          return (
            <div key={dim.id}>
              <div style={{ fontFamily: text.heading.fontFamily, fontSize: text.secondary.fontSize, fontWeight: 600, color: colors.textPrimary, marginBottom: space[2] }}>
                {dim.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: space[3] }}>
                <div style={{ width: 80, flexShrink: 0, textAlign: "right", ...text.caption, color: colors.textMuted }}>{dim.leftLabel}</div>
                {/* Track */}
                <div
                  ref={(el) => { if (el) trackRefs.current.set(dim.id, el); }}
                  onPointerMove={(e) => onMove(e, dim.id)} onPointerUp={onUp} onPointerCancel={onUp}
                  style={{ flex: 1, position: "relative", height: 40, touchAction: "none", cursor: "pointer" }}
                >
                  <div style={{ ...trackBase, backgroundColor: colors.bgElevated }} />
                  <div style={{ ...trackBase, background: `linear-gradient(90deg, ${colors.plumDeep}, transparent, ${colors.coralOnDark})`, opacity: 0.4 }} />
                  {/* Markers */}
                  {dm.map((m) => {
                    const dragging = dragInfo?.markerId === m.markerId && dragInfo.dimensionId === dim.id;
                    const hover = hoverId === `${m.markerId}-${dim.id}`;
                    const c = m.color ?? colors.coral;
                    return (
                      <React.Fragment key={m.markerId}>
                        {(hover || dragging) && (
                          <div style={{
                            position: "absolute", left: `${m.value}%`, top: -4, transform: "translate(-50%, -100%)",
                            padding: `${space[1]}px ${space[2]}px`, backgroundColor: colors.bgSurface,
                            border: `1px solid ${colors.borderDefault}`, borderRadius: radii.sm,
                            ...text.caption, color: colors.textPrimary, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10,
                          }}>
                            {m.label}: {Math.round(m.value)}
                          </div>
                        )}
                        <div
                          onPointerDown={(e) => onDown(e, m.markerId, dim.id)}
                          onPointerEnter={() => setHoverId(`${m.markerId}-${dim.id}`)}
                          onPointerLeave={() => setHoverId(null)}
                          style={{
                            position: "absolute", top: "50%", left: `${m.value}%`,
                            width: MR * 2, height: MR * 2, borderRadius: radii.full,
                            backgroundColor: c, border: `2px solid ${dragging ? colors.textPrimary : c}`,
                            transform: "translate(-50%, -50%)", transition: dragging ? "none" : "left 0.1s ease-out",
                            boxShadow: dragging ? `0 0 12px ${c}88` : `0 0 6px ${c}44`,
                            zIndex: dragging ? 5 : 2, cursor: dragging ? "grabbing" : "grab",
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
                <div style={{ width: 80, flexShrink: 0, ...text.caption, color: colors.textMuted }}>{dim.rightLabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
