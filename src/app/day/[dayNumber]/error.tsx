"use client";

import { useEffect } from "react";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export default function DayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Day page error:", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: colors.bgDeep,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <p style={{
        fontFamily: display, fontSize: 20, fontWeight: 700,
        color: colors.textPrimary, marginBottom: 10,
      }}>
        Session hit a snag
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        marginBottom: 8, maxWidth: 500, textAlign: "center", lineHeight: 1.5,
      }}>
        {error.message || "An unexpected error occurred."}
      </p>
      <p style={{
        fontFamily: body, fontSize: 11, color: colors.textMuted,
        marginBottom: 20,
      }}>
        {error.digest && `Error ID: ${error.digest}`}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 24px", borderRadius: 100, fontSize: 14, fontWeight: 600,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: "pointer", fontFamily: display,
          }}
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          style={{
            padding: "10px 24px", borderRadius: 100, fontSize: 14, fontWeight: 600,
            backgroundColor: "transparent", color: colors.textPrimary,
            border: `1px solid ${colors.borderDefault}`, cursor: "pointer", fontFamily: display,
          }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
