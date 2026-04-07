"use client";

import { useEffect } from "react";
import { colors, fonts, layout } from "@/lib/theme";
import { trackEvent } from "@/components/GoogleAnalytics";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    trackEvent("error_boundary_caught", {
      page: "global",
      error_message: error.message || "unknown",
      digest: error.digest || "",
    });
  }, [error]);
  return (
    <div
      style={{
        ...layout.page,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: colors.errorWash,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
        }}
      >
        !
      </div>

      <h1
        style={{
          fontFamily: fonts.display,
          fontSize: 24,
          fontWeight: 700,
          color: colors.textPrimary,
          margin: 0,
        }}
      >
        Something went wrong
      </h1>

      <p
        style={{
          fontSize: 15,
          color: colors.textMuted,
          maxWidth: 380,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        An unexpected error occurred. You can try again, or head back to your
        dashboard.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => { trackEvent("error_retry_attempted", { page: "global" }); reset(); }}
          style={{
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            color: colors.bgSurface,
            backgroundColor: colors.coral,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Try again
        </button>

        <a
          href="/dashboard"
          style={{
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            color: colors.textSecondary,
            backgroundColor: "transparent",
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: 8,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
