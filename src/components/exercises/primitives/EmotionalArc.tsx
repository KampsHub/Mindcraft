"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { animate } from "motion";
import { colors, fonts, space, radii, text } from "@/lib/theme";

interface ArcPhase {
  id: string;
  label: string;
  prompt: string;
  content: string;
  intensity: number; // 0-100
}

interface EmotionalArcProps {
  phases: ArcPhase[];
  onChange?: (phaseId: string, content: string) => void;
  onIntensityChange?: (phaseId: string, intensity: number) => void;
  emotionLabel?: string;
  title?: string;
}

const SVG_H = 200, PAD_T = 30, PAD_B = 40, PAD_X = 40, DOT_R = 8;
const CURVE_H = SVG_H - PAD_T - PAD_B;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function curvePath(pts: { x: number; y: number }[], closed: boolean) {
  if (pts.length < 2) return "";
  const d = [`M${pts[0].x},${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i].x + pts[i + 1].x) / 2;
    d.push(`C${cx},${pts[i].y} ${cx},${pts[i + 1].y} ${pts[i + 1].x},${pts[i + 1].y}`);
  }
  if (closed) {
    const baseY = SVG_H - PAD_B;
    d.push(`L${pts[pts.length - 1].x},${baseY} L${pts[0].x},${baseY} Z`);
  }
  return d.join(" ");
}

const taStyle: React.CSSProperties = {
  width: "100%", background: colors.bgInput, color: colors.textPrimary,
  fontFamily: fonts.bodyAlt, fontSize: text.body.fontSize, lineHeight: text.body.lineHeight,
  border: `1px solid ${colors.borderSubtle}`, borderRadius: radii.sm,
  padding: `${space[2]}px ${space[3]}px`, resize: "none", overflow: "hidden",
  outline: "none", boxSizing: "border-box",
};

function AutoTA({ value, onInput, placeholder }: { value: string; onInput: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fit = useCallback(() => { const e = ref.current; if (e) { e.style.height = "auto"; e.style.height = `${e.scrollHeight}px`; } }, []);
  useEffect(() => { fit(); }, [value, fit]);
  return (
    <textarea ref={ref} value={value} onChange={(e) => onInput(e.target.value)} placeholder={placeholder} rows={3} style={taStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = colors.coral; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = colors.borderSubtle; }} />
  );
}

export default function EmotionalArc({ phases, onChange, onIntensityChange, emotionLabel, title }: EmotionalArcProps) {
  const [activeId, setActiveId] = useState<string | null>(phases[0]?.id ?? null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<string | null>(null);
  const svgW = Math.max(360, phases.length * 120 + PAD_X * 2);

  const points = useMemo(
    () => phases.map((p, i) => ({
      x: PAD_X + (i / Math.max(1, phases.length - 1)) * (svgW - PAD_X * 2),
      y: PAD_T + CURVE_H * (1 - p.intensity / 100),
      id: p.id,
    })),
    [phases, svgW],
  );

  const linePath = curvePath(points, false);
  const fillPath = curvePath(points, true);

  const onPtrDown = (pid: string) => (e: React.PointerEvent) => {
    e.preventDefault(); dragging.current = pid;
    (e.target as SVGElement).setPointerCapture(e.pointerId);
  };
  const onPtrMove = (e: React.PointerEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const localY = e.clientY - svgRef.current.getBoundingClientRect().top;
    onIntensityChange?.(dragging.current, clamp(Math.round((1 - (localY - PAD_T) / CURVE_H) * 100), 0, 100));
  };
  const onPtrUp = () => { dragging.current = null; };
  const activePhase = phases.find((p) => p.id === activeId);

  return (
    <div style={{ background: colors.bgDeep, borderRadius: radii.lg, padding: space[5], fontFamily: fonts.body }}>
      {emotionLabel && (
        <div style={{ ...text.caption, color: colors.coral, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: space[1] }}>
          {emotionLabel}
        </div>
      )}
      {title && (
        <h3 style={{ ...text.heading, color: colors.textPrimary, margin: 0, marginBottom: space[4], textAlign: "center" }}>
          {title}
        </h3>
      )}

      {/* SVG Curve */}
      <div style={{ overflowX: "auto", marginBottom: space[4] }}>
        <svg ref={svgRef} width={svgW} height={SVG_H} style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}
          onPointerMove={onPtrMove} onPointerUp={onPtrUp} onPointerLeave={onPtrUp}>
          <defs>
            <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.coral} stopOpacity={0.6} />
              <stop offset="100%" stopColor={colors.plum} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          {points.length >= 2 && <path d={fillPath} fill="url(#arcFill)" />}
          {points.length >= 2 && (
            <path d={linePath} fill="none" stroke={colors.coral} strokeWidth={2.5} strokeLinejoin="round" />
          )}
          {points.map((pt) => {
            const phase = phases.find((p) => p.id === pt.id)!;
            const active = pt.id === activeId;
            return (
              <g key={pt.id}>
                <circle cx={pt.x} cy={pt.y} r={active ? DOT_R + 2 : DOT_R}
                  fill={active ? colors.coral : colors.bgSurface}
                  stroke={active ? colors.coral : colors.textMuted} strokeWidth={2}
                  style={{ cursor: "ns-resize" }}
                  onPointerDown={onPtrDown(pt.id)} onClick={() => setActiveId(pt.id)} />
                <text x={pt.x} y={pt.y - DOT_R - 6} textAnchor="middle"
                  fill={active ? colors.coral : colors.textMuted}
                  fontSize={11} fontFamily={fonts.display} fontWeight={600}>
                  {phase.intensity}
                </text>
                <text x={pt.x} y={SVG_H - PAD_B + 18} textAnchor="middle"
                  fill={active ? colors.coral : colors.textMuted}
                  fontSize={12} fontFamily={fonts.display} fontWeight={active ? 700 : 400}
                  style={{ cursor: "pointer" }} onClick={() => setActiveId(pt.id)}>
                  {phase.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active phase card */}
      {activePhase && (
        <div
          ref={(el) => {
            if (el) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (animate as any)(el, { opacity: [0, 1], y: [8, 0] }, { duration: 0.3, easing: [0.22, 1, 0.36, 1] });
            }
          }}
          key={activePhase.id}
          style={{ background: colors.bgSurface, borderRadius: radii.md, borderLeft: `4px solid ${colors.coral}`, padding: space[4] }}>
          <div style={{ ...text.caption, color: colors.coral, textTransform: "uppercase", marginBottom: space[1] }}>
            {activePhase.label}
          </div>
          <div style={{ ...text.secondary, color: colors.textMuted, fontStyle: "italic", marginBottom: space[3] }}>
            {activePhase.prompt}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: space[3], marginBottom: space[3] }}>
            <span style={{ ...text.caption, color: colors.textMuted, minWidth: 60 }}>Intensity</span>
            <input type="range" min={0} max={100} value={activePhase.intensity}
              onChange={(e) => onIntensityChange?.(activePhase.id, Number(e.target.value))}
              style={{ flex: 1, accentColor: colors.coral }} />
            <span style={{ ...text.caption, color: colors.coral, minWidth: 28, textAlign: "right" }}>
              {activePhase.intensity}
            </span>
          </div>
          <AutoTA value={activePhase.content} onInput={(v) => onChange?.(activePhase.id, v)}
            placeholder="Journal your experience at this phase..." />
        </div>
      )}
    </div>
  );
}
