import Link from "next/link";

export default function SandboxHome() {
  return (
    <div style={{ padding: 48, maxWidth: 600, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Mindcraft Sandbox</h1>
      <p style={{ color: "#8A9199", marginBottom: 32 }}>Internal dev tools — not deployed to production.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href="/exercises/preview" style={{ color: "#C4943A", fontSize: 16 }}>
          Exercise Primitives Preview →
        </Link>
        <Link href="/exercises/catalog" style={{ color: "#C4943A", fontSize: 16 }}>
          Exercise Catalog (all 356) →
        </Link>
      </div>
    </div>
  );
}
