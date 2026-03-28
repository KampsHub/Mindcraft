"use client";
import React, { useState } from "react";
import { colors, space, radii, text, fonts } from "@/lib/theme";

interface Force { id: string; label: string; strength: number; notes?: string; }
interface ForceFieldDiagramProps {
  drivingForces: Force[];
  restrainingForces: Force[];
  centerLabel?: string;
  onAddDriving?: (force: Force) => void;
  onAddRestraining?: (force: Force) => void;
  onStrengthChange?: (id: string, side: "driving" | "restraining", strength: number) => void;
  onRemove?: (id: string, side: "driving" | "restraining") => void;
}

const barColor = (side: "driving" | "restraining", s: number) => {
  const b = side === "driving" ? "106,178,130" : "210,88,88";
  return `rgba(${b},${0.4 + s * 0.12})`;
};
const sumF = (f: Force[]) => f.reduce((a, x) => a + x.strength, 0);

function StrengthPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: space[1] }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: 22, height: 22, borderRadius: radii.full, padding: 0,
          border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
          background: n <= value ? colors.coral : colors.bgInput,
          color: n <= value ? colors.bgDeep : colors.textMuted,
          fontSize: 11, fontFamily: fonts.display,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{n}</button>
      ))}
    </div>
  );
}

function ForceBar({ force, side, onStrengthChange, onRemove }: {
  force: Force; side: "driving" | "restraining";
  onStrengthChange?: ForceFieldDiagramProps["onStrengthChange"];
  onRemove?: ForceFieldDiagramProps["onRemove"];
}) {
  const [open, setOpen] = useState(false);
  const drv = side === "driving";
  const bg = barColor(side, force.strength);
  const w = `${(force.strength / 5) * 100}%`;
  return (
    <div style={{ marginBottom: space[2] }}>
      <div onClick={() => setOpen((p) => !p)}
        style={{ display: "flex", flexDirection: drv ? "row-reverse" : "row", cursor: "pointer" }}>
        <div style={{
          width: w, minWidth: 40, height: 32, background: bg,
          borderRadius: drv ? `${radii.sm}px 0 0 ${radii.sm}px` : `0 ${radii.sm}px ${radii.sm}px 0`,
          display: "flex", alignItems: "center", padding: `0 ${space[2]}px`,
          justifyContent: drv ? "flex-start" : "flex-end", transition: "width 0.3s",
          border: `1px solid ${drv ? colors.success : colors.error}`,
        }}>
          <span style={{ ...text.caption, color: colors.textPrimary,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {force.label}
          </span>
        </div>
        <div style={{
          width: 0, height: 0, flexShrink: 0,
          borderTop: "16px solid transparent", borderBottom: "16px solid transparent",
          ...(drv ? { borderLeft: `10px solid ${bg}` } : { borderRight: `10px solid ${bg}` }),
        }} />
      </div>
      {open && (
        <div style={{ marginTop: space[1], padding: space[2],
          background: colors.bgRecessed, borderRadius: radii.sm }}>
          {force.notes && (
            <div style={{ ...text.secondary, color: colors.textMuted, marginBottom: space[2] }}>
              {force.notes}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: space[3] }}>
            <StrengthPicker value={force.strength}
              onChange={(s) => onStrengthChange?.(force.id, side, s)} />
            {onRemove && (
              <button onClick={(e) => { e.stopPropagation(); onRemove(force.id, side); }}
                style={{ background: "transparent", border: `1px solid ${colors.error}`,
                  color: colors.error, borderRadius: radii.sm,
                  padding: `${space[1]}px ${space[2]}px`, ...text.caption, cursor: "pointer" }}>
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: `${space[2]}px 0`, background: "transparent",
      border: `1px dashed ${colors.borderDefault}`, borderRadius: radii.sm,
      color: colors.textMuted, ...text.caption, cursor: "pointer", marginTop: space[2],
    }}>+ {label}</button>
  );
}

export default function ForceFieldDiagram({
  drivingForces, restrainingForces, centerLabel = "Change Goal",
  onAddDriving, onAddRestraining, onStrengthChange, onRemove,
}: ForceFieldDiagramProps) {
  const dSum = sumF(drivingForces);
  const rSum = sumF(restrainingForces);
  const total = dSum + rSum || 1;
  const dPct = (dSum / total) * 100;
  const newForce = (label: string): Force => ({ id: crypto.randomUUID(), label, strength: 3 });

  const sideStyle: React.CSSProperties = {
    flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
  };

  return (
    <div style={{ background: colors.bgDeep, padding: space[5], borderRadius: radii.lg }}>
      <div style={{ display: "flex", minHeight: 120 }}>
        {/* Driving side */}
        <div style={sideStyle}>
          {drivingForces.map((f) => (
            <ForceBar key={f.id} force={f} side="driving"
              onStrengthChange={onStrengthChange} onRemove={onRemove} />
          ))}
          {onAddDriving && <AddBtn label="Add driving force"
            onClick={() => onAddDriving(newForce("New force"))} />}
        </div>
        {/* Center line */}
        <div style={{
          width: 3, background: colors.coral, borderRadius: radii.full,
          flexShrink: 0, position: "relative", margin: `0 ${space[3]}px`,
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", background: colors.bgDeep,
            border: `2px solid ${colors.coral}`, borderRadius: radii.sm,
            padding: `${space[1]}px ${space[2]}px`, whiteSpace: "nowrap",
            ...text.caption, color: colors.coral,
          }}>{centerLabel}</div>
        </div>
        {/* Restraining side */}
        <div style={sideStyle}>
          {restrainingForces.map((f) => (
            <ForceBar key={f.id} force={f} side="restraining"
              onStrengthChange={onStrengthChange} onRemove={onRemove} />
          ))}
          {onAddRestraining && <AddBtn label="Add restraining force"
            onClick={() => onAddRestraining(newForce("New force"))} />}
        </div>
      </div>
      {/* Balance indicator */}
      <div style={{ marginTop: space[5] }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: space[1] }}>
          <span style={{ ...text.caption, color: colors.success }}>Driving: {dSum}</span>
          <span style={{ ...text.caption, color: colors.error }}>Restraining: {rSum}</span>
        </div>
        <div style={{ height: 10, borderRadius: radii.full, background: colors.bgRecessed,
          overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${dPct}%`, background: colors.success,
            borderRadius: `${radii.full}px 0 0 ${radii.full}px`, transition: "width 0.35s" }} />
          <div style={{ flex: 1, background: colors.error,
            borderRadius: `0 ${radii.full}px ${radii.full}px 0` }} />
        </div>
        <div style={{
          textAlign: "center", marginTop: space[2], ...text.caption,
          color: dSum > rSum ? colors.success : dSum < rSum ? colors.error : colors.textMuted,
        }}>
          {dSum > rSum ? "Forces favor change" : dSum < rSum ? "Forces resist change" : "Forces are balanced"}
        </div>
      </div>
    </div>
  );
}
