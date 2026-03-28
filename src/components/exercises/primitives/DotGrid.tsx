"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface DotItem {
  id: string;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
}

interface DotGridProps {
  items: DotItem[];
  axisLabels: { top: string; bottom: string; left: string; right: string };
  onChange?: (items: DotItem[]) => void;
  title?: string;
}

const GRID = 360;
const DOT_R = 14;
const PAD = 40;
const TOTAL = GRID + PAD * 2;

const toSvgX = (pct: number) => PAD + (pct / 100) * GRID;
const toSvgY = (pct: number) => PAD + ((100 - pct) / 100) * GRID;
const toPctX = (px: number) => Math.max(0, Math.min(100, ((px - PAD) / GRID) * 100));
const toPctY = (px: number) => Math.max(0, Math.min(100, 100 - ((px - PAD) / GRID) * 100));

const QUADS = [
  { x: PAD, y: PAD, fill: colors.plumDeep },
  { x: PAD + GRID / 2, y: PAD, fill: colors.plumWash },
  { x: PAD, y: PAD + GRID / 2, fill: colors.plumWash },
  { x: PAD + GRID / 2, y: PAD + GRID / 2, fill: colors.plumPressed },
];

export default function DotGrid({ items, axisLabels, onChange, title }: DotGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dots, setDots] = useState<DotItem[]>(items);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => { setDots(items); }, [items]);

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingId(id);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
    setDots((prev) => prev.map((d) =>
      d.id === draggingId ? { ...d, x: toPctX(svgPt.x), y: toPctY(svgPt.y) } : d
    ));
  }, [draggingId]);

  const handlePointerUp = useCallback(() => {
    if (draggingId) {
      setDraggingId(null);
      setDots((prev) => { onChange?.(prev); return prev; });
    }
  }, [draggingId, onChange]);

  return (
    <div style={S.container}>
      {title && <p style={S.title}>{title}</p>}
      <div style={S.gridWrapper}>
        <div style={{ ...S.axisLabel, ...S.axisTop }}>{axisLabels.top}</div>
        <div style={{ ...S.axisLabel, ...S.axisBottom }}>{axisLabels.bottom}</div>
        <div style={{ ...S.axisLabel, ...S.axisLeft }}>{axisLabels.left}</div>
        <div style={{ ...S.axisLabel, ...S.axisRight }}>{axisLabels.right}</div>

        <svg
          ref={svgRef} viewBox={`0 0 ${TOTAL} ${TOTAL}`} style={S.svg}
          onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
        >
          {QUADS.map((q, i) => (
            <rect key={i} x={q.x} y={q.y} width={GRID / 2} height={GRID / 2} fill={q.fill} opacity={0.5} />
          ))}
          <rect x={PAD} y={PAD} width={GRID} height={GRID} fill="none" stroke={colors.borderDefault} strokeWidth={1} />
          <line x1={PAD + GRID / 2} y1={PAD} x2={PAD + GRID / 2} y2={PAD + GRID} stroke={colors.borderDefault} strokeWidth={1} strokeDasharray="4 4" />
          <line x1={PAD} y1={PAD + GRID / 2} x2={PAD + GRID} y2={PAD + GRID / 2} stroke={colors.borderDefault} strokeWidth={1} strokeDasharray="4 4" />

          {dots.map((dot) => {
            const cx = toSvgX(dot.x), cy = toSvgY(dot.y);
            const isHov = hoveredId === dot.id, isDrag = draggingId === dot.id;
            const showLabel = isHov || isDrag;
            return (
              <g key={dot.id}>
                <circle
                  cx={cx} cy={cy} r={DOT_R + 8} fill="transparent" style={{ cursor: "grab" }}
                  onPointerDown={(e) => handlePointerDown(dot.id, e)}
                  onPointerEnter={() => setHoveredId(dot.id)}
                  onPointerLeave={() => !isDrag && setHoveredId(null)}
                />
                <circle
                  cx={cx} cy={cy} r={isDrag ? DOT_R + 2 : DOT_R}
                  fill={isDrag ? colors.coralLight : colors.coral}
                  stroke={colors.bgDeep} strokeWidth={2}
                  style={{ transition: isDrag ? "none" : "r 0.15s ease", pointerEvents: "none",
                    filter: isDrag ? "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" : "none" }}
                />
                {showLabel && (
                  <g>
                    <rect x={cx - 50} y={cy - DOT_R - 28} width={100} height={22} rx={4} fill={colors.bgElevated} opacity={0.95} />
                    <text x={cx} y={cy - DOT_R - 14} textAnchor="middle" fill={colors.textPrimary}
                      fontSize={11} fontFamily={fonts.bodyAlt} fontWeight={600} style={{ pointerEvents: "none" }}>
                      {dot.label.length > 16 ? dot.label.slice(0, 15) + "\u2026" : dot.label}
                    </text>
                  </g>
                )}
                <text
                  x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
                  fill={colors.bgDeep} fontSize={11} fontFamily={fonts.display} fontWeight={700}
                  style={{ pointerEvents: "none", userSelect: "none" }}>
                  {dot.label.charAt(0).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: { padding: space[5], backgroundColor: colors.bgDeep, borderRadius: radii.lg, maxWidth: 480, margin: "0 auto" },
  title: { fontFamily: fonts.display, fontSize: text.heading.fontSize, fontWeight: 700, color: colors.textPrimary, textAlign: "center", margin: `0 0 ${space[4]}px` },
  gridWrapper: { position: "relative", width: "100%", maxWidth: 480, margin: "0 auto", paddingTop: space[6], paddingBottom: space[6], paddingLeft: space[5], paddingRight: space[5] },
  svg: { width: "100%", height: "auto", display: "block", touchAction: "none" },
  axisLabel: { position: "absolute", fontFamily: fonts.display, fontSize: text.caption.fontSize, fontWeight: 600, color: colors.textMuted, letterSpacing: text.caption.letterSpacing, textTransform: "uppercase" as const, whiteSpace: "nowrap" },
  axisTop: { top: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" },
  axisBottom: { bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" },
  axisLeft: { left: -8, top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "center" },
  axisRight: { right: -8, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "center" },
};
