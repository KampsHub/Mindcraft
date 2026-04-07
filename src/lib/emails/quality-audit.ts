/**
 * Quality audit weekly report — sent by /api/quality-audit cron Mon 4pm PT.
 */

export type QualityAuditOpts = {
  auditWeek: string;
  evaluatedCount: number;
  avgTotal: number;
  dimensionAverages: Record<string, number>;
  flagFrequency: Record<string, number>;
  bottomOutputs: { total: number; feedback: string; flags: string[] }[];
  userFlagsCount: number;
  bloomWarning: string | null;
  appUrl: string;
};

export const qualityAuditFrom = "Mindcraft Quality <noreply@allmindsondeck.org>";

export function qualityAuditSubject({ avgTotal, evaluatedCount }: QualityAuditOpts): string {
  return `Weekly Quality Audit — ${Math.round(avgTotal)}/30 avg (${evaluatedCount} outputs)`;
}

export function qualityAuditHtml(opts: QualityAuditOpts): string {
  const { auditWeek, evaluatedCount, avgTotal, dimensionAverages, flagFrequency, bottomOutputs, userFlagsCount, bloomWarning, appUrl } = opts;

  const dimRows = Object.entries(dimensionAverages)
    .map(([dim, avg]) => {
      const bar = "█".repeat(Math.round(avg));
      const empty = "░".repeat(5 - Math.round(avg));
      return `<tr><td style="padding:4px 12px;font-size:14px;color:#B5ADB6;">${dim.replace(/_/g, " ")}</td><td style="padding:4px 12px;font-size:14px;font-weight:600;color:#E4DDE2;">${avg}</td><td style="padding:4px 12px;font-family:monospace;color:#E09585;">${bar}${empty}</td></tr>`;
    })
    .join("");

  const flagRows = Object.entries(flagFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(([flag, count]) => `<tr><td style="padding:3px 12px;font-size:14px;color:#B5ADB6;">${flag.replace(/_/g, " ")}</td><td style="padding:3px 12px;font-size:14px;font-weight:600;color:#D25858;">${count}</td></tr>`)
    .join("");

  const worstRows = bottomOutputs
    .slice(0, 3)
    .map((r) => `<li style="margin-bottom:8px;"><strong>${r.total}/30</strong> — ${r.feedback} ${r.flags.length ? `<span style="color:#D25858;">[${r.flags.join(", ")}]</span>` : ""}</li>`)
    .join("");

  const scoreColor = avgTotal >= 24 ? "#6AB282" : avgTotal >= 18 ? "#D6B65D" : "#D25858";

  return `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#E4DDE2;background:#18181C;">
            <h1 style="font-size:20px;font-weight:700;margin:0 0 4px 0;">Mindcraft Quality Audit</h1>
            <p style="font-size:13px;color:#99929B;margin:0 0 28px 0;">Week of ${auditWeek} &middot; ${evaluatedCount} outputs evaluated</p>

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;text-align:center;">
              <p style="font-size:48px;font-weight:700;color:${scoreColor};margin:0 0 4px 0;">${Math.round(avgTotal * 10) / 10}</p>
              <p style="font-size:13px;color:#99929B;margin:0;">average score (out of 30)</p>
            </div>

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Dimension Breakdown</h2>
              <table style="width:100%;border-collapse:collapse;">${dimRows}</table>
            </div>

            ${Object.keys(flagFrequency).length > 0 ? `
            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Flags</h2>
              <table style="width:100%;border-collapse:collapse;">${flagRows}</table>
            </div>
            ` : ""}

            ${worstRows ? `
            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">Lowest Scoring Outputs</h2>
              <ul style="margin:0;padding:0 0 0 16px;color:#B5ADB6;font-size:14px;line-height:1.7;">${worstRows}</ul>
            </div>
            ` : ""}

            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;">
              <h2 style="font-size:13px;font-weight:700;color:#99929B;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.06em;">User Flags This Week</h2>
              <p style="font-size:28px;font-weight:700;color:${userFlagsCount > 0 ? "#D25858" : "#6AB282"};margin:0;">${userFlagsCount}</p>
            </div>

            ${bloomWarning ? `
            <div style="background:#333339;border-radius:14px;padding:20px;margin-bottom:20px;border-left:3px solid #D25858;">
              <p style="font-size:14px;color:#E4DDE2;margin:0;line-height:1.5;">${bloomWarning}</p>
            </div>
            ` : ""}

            <p style="font-size:12px;color:#99929B;text-align:center;margin-top:28px;">
              <a href="${appUrl}/coach" style="color:#E09585;">View full dashboard &rarr;</a>
            </p>
          </div>
        `;
}
