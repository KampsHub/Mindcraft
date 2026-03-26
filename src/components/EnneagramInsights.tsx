"use client";

import { colors, fonts } from "@/lib/theme";
import type { EnneagramAnalysis, EnneagramDoc } from "./EnneagramUpload";

const display = fonts.display;
const body = fonts.bodyAlt;

interface Props {
  data: EnneagramAnalysis;
}

function CenterBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: body, fontSize: 13, color: "#ffffff" }}>{label}</span>
        <span style={{ fontFamily: display, fontSize: 13, fontWeight: 600, color }}>{value}%</span>
      </div>
      <div style={{
        height: 8, borderRadius: 4, backgroundColor: colors.bgElevated, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${value}%`, borderRadius: 4,
          backgroundColor: color, transition: "width 0.6s ease-out",
        }} />
      </div>
    </div>
  );
}

export default function EnneagramInsights({ data }: Props) {
  function downloadPlan() {
    const text = `# Enneagram Integration Plan\n\nType: ${data.type}w${data.wing} (Tritype: ${data.tritype})\n\nCenters:\n- Action: ${data.centers.action}%\n- Feeling: ${data.centers.feeling}%\n- Thinking: ${data.centers.thinking}%\n\n## Key Development Areas\n\n${data.key_development_areas.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n## Integration Plan\n\n${data.integration_plan}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enneagram-integration-plan.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      padding: 24,
      border: `1px solid ${colors.borderDefault}`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{
          fontFamily: display, fontSize: 16, fontWeight: 700,
          color: colors.textPrimary, margin: 0,
        }}>
          Your Enneagram Profile
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {data.documents?.map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: body, fontSize: 11, fontWeight: 600,
                color: colors.coral, textDecoration: "none",
                padding: "4px 10px", borderRadius: 6,
                backgroundColor: colors.coralWash,
              }}
            >
              {doc.filename.length > 20 ? doc.filename.slice(0, 17) + "..." : doc.filename}
            </a>
          ))}
        </div>
      </div>

      {/* Type badges */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span style={{
          fontFamily: display, fontSize: 22, fontWeight: 700,
          color: colors.coral, padding: "6px 16px", borderRadius: 10,
          backgroundColor: colors.coralWash,
        }}>
          Type {data.type}w{data.wing}
        </span>
        <span style={{
          fontFamily: display, fontSize: 14, fontWeight: 600,
          color: colors.plumLight, padding: "8px 14px", borderRadius: 10,
          backgroundColor: colors.plumWash,
        }}>
          Tritype {data.tritype}
        </span>
      </div>

      {/* Centers */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: display, fontSize: 12, fontWeight: 600,
          color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em",
          marginBottom: 10,
        }}>
          Centers of Intelligence
        </p>
        <CenterBar label="Action (Body)" value={data.centers.action} color={colors.coral} />
        <CenterBar label="Feeling (Heart)" value={data.centers.feeling} color={colors.plumLight} />
        <CenterBar label="Thinking (Head)" value={data.centers.thinking} color={colors.warning} />
      </div>

      {/* Development areas */}
      <div style={{ marginBottom: 20 }}>
        <p style={{
          fontFamily: display, fontSize: 12, fontWeight: 600,
          color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em",
          marginBottom: 10,
        }}>
          Key Development Areas
        </p>
        {data.key_development_areas.map((area, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            padding: "8px 0", borderBottom: i < data.key_development_areas.length - 1
              ? `1px solid ${colors.borderDefault}` : "none",
          }}>
            <span style={{
              fontFamily: display, fontSize: 12, fontWeight: 700,
              color: colors.coral, minWidth: 20,
            }}>
              {i + 1}
            </span>
            <span style={{ fontFamily: body, fontSize: 14, color: "#ffffff", lineHeight: 1.5 }}>
              {area}
            </span>
          </div>
        ))}
      </div>

      {/* Integration plan */}
      {data.integration_plan && (
        <div style={{ marginBottom: 16 }}>
          <p style={{
            fontFamily: display, fontSize: 12, fontWeight: 600,
            color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em",
            marginBottom: 10,
          }}>
            Integration Plan
          </p>
          <div style={{
            fontFamily: body, fontSize: 14, color: "#ffffff", lineHeight: 1.6,
            padding: 16, borderRadius: 10, backgroundColor: colors.bgElevated,
            whiteSpace: "pre-wrap",
          }}>
            {data.integration_plan}
          </div>
        </div>
      )}

      {/* Download */}
      <button
        onClick={downloadPlan}
        style={{
          fontFamily: display, fontSize: 13, fontWeight: 600,
          padding: "8px 20px", borderRadius: 100,
          backgroundColor: colors.bgElevated, color: "#ffffff",
          border: `1px solid ${colors.borderDefault}`, cursor: "pointer",
        }}
      >
        Download Integration Plan
      </button>
    </div>
  );
}
