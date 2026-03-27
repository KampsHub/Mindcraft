"use client";

import { colors, fonts } from "@/lib/theme";

const display = fonts.display;

interface ViewModeToggleProps {
  mode: "form" | "chat";
  onChange: (mode: "form" | "chat") => void;
}

export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div style={{
      display: "inline-flex", gap: 2,
      padding: 3, borderRadius: 100,
      backgroundColor: colors.bgElevated,
      border: `1px solid ${colors.borderDefault}`,
    }}>
      <button
        onClick={() => onChange("form")}
        style={{
          fontFamily: display, fontSize: 11, fontWeight: 600,
          padding: "6px 14px", borderRadius: 100,
          backgroundColor: mode === "form" ? colors.bgSurface : "transparent",
          color: mode === "form" ? "#ffffff" : colors.textMuted,
          border: mode === "form" ? `1px solid ${colors.borderDefault}` : "1px solid transparent",
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "all 0.2s",
        }}
      >
        Read
      </button>
      <button
        onClick={() => onChange("chat")}
        style={{
          fontFamily: display, fontSize: 11, fontWeight: 600,
          padding: "6px 14px", borderRadius: 100,
          backgroundColor: mode === "chat" ? colors.bgSurface : "transparent",
          color: mode === "chat" ? colors.coral : colors.textMuted,
          border: mode === "chat" ? `1px solid rgba(224, 149, 133, 0.3)` : "1px solid transparent",
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "all 0.2s",
        }}
      >
        💬 Chat
      </button>
    </div>
  );
}
