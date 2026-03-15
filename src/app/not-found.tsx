import { colors, fonts, layout } from "@/lib/theme";

export default function NotFound() {
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
          fontFamily: fonts.display,
          fontSize: 72,
          fontWeight: 800,
          color: colors.coralPressed,
          lineHeight: 1,
        }}
      >
        404
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
        Page not found
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
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <a
        href="/dashboard"
        style={{
          padding: "12px 28px",
          fontSize: 15,
          fontWeight: 600,
          color: colors.bgSurface,
          backgroundColor: colors.coral,
          border: "none",
          borderRadius: 8,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Back to dashboard
      </a>
    </div>
  );
}
