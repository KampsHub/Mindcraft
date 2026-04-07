/**
 * Quality audit weekly report — sent by /api/quality-audit cron Mon 4pm PT.
 * Internal admin notification.
 */

import { emailShell, EMAIL_COLORS, ICONS, eyebrow } from "@/lib/emails/shell";

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
  const {
    auditWeek,
    evaluatedCount,
    avgTotal,
    dimensionAverages,
    flagFrequency,
    bottomOutputs,
    userFlagsCount,
    bloomWarning,
    appUrl,
  } = opts;

  // Score color based on average
  const scoreColor =
    avgTotal >= 24 ? "#3A8A4A" : avgTotal >= 18 ? "#B8881C" : "#B8453A";

  const dimRows = Object.entries(dimensionAverages)
    .map(([dim, avg]) => {
      const filled = Math.round(avg);
      const bar = "█".repeat(filled) + "░".repeat(Math.max(0, 5 - filled));
      return `<tr>
        <td style="padding:6px 0;font-size:13px;color:${EMAIL_COLORS.textBody};">${dim.replace(/_/g, " ")}</td>
        <td style="padding:6px 12px;font-size:13px;font-weight:700;color:${EMAIL_COLORS.textPrimary};text-align:right;">${avg}</td>
        <td style="padding:6px 0;font-family:'SFMono-Regular',Menlo,monospace;font-size:13px;color:${EMAIL_COLORS.ochre};">${bar}</td>
      </tr>`;
    })
    .join("");

  const flagRows = Object.entries(flagFrequency)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([flag, count]) =>
        `<tr>
          <td style="padding:4px 0;font-size:13px;color:${EMAIL_COLORS.textBody};">${flag.replace(/_/g, " ")}</td>
          <td style="padding:4px 0;font-size:13px;font-weight:700;color:#B8453A;text-align:right;">${count}</td>
        </tr>`
    )
    .join("");

  const worstRows = bottomOutputs
    .slice(0, 3)
    .map(
      (r) =>
        `<li style="margin-bottom:8px;color:${EMAIL_COLORS.textBody};font-size:13px;line-height:1.6;"><strong style="color:${EMAIL_COLORS.textPrimary};">${r.total}/30</strong> &mdash; ${r.feedback}${
          r.flags.length ? ` <span style="color:#B8453A;">[${r.flags.join(", ")}]</span>` : ""
        }</li>`
    )
    .join("");

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.chart}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Quality audit")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 6px 0;letter-spacing:-0.015em;">
            Weekly quality audit
          </h2>
          <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;margin:0 0 22px 0;">
            Week of ${auditWeek} &middot; ${evaluatedCount} outputs evaluated
          </p>

          <!-- Big score -->
          <div style="background-color:${EMAIL_COLORS.ochreWash};border:1px solid ${EMAIL_COLORS.borderSubtle};border-radius:14px;padding:24px;margin:0 0 20px 0;text-align:center;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:48px;font-weight:800;color:${scoreColor};margin:0;line-height:1;letter-spacing:-0.04em;">
              ${Math.round(avgTotal * 10) / 10}
            </p>
            <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:8px 0 0 0;">
              average score · out of 30
            </p>
          </div>

          <!-- Dimension breakdown -->
          <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">Dimension breakdown</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
            ${dimRows}
          </table>

          ${
            Object.keys(flagFrequency).length > 0
              ? `
            <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">Flags</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
              ${flagRows}
            </table>
          `
              : ""
          }

          ${
            worstRows
              ? `
            <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">Lowest scoring outputs</p>
            <ul style="margin:0 0 22px 0;padding:0 0 0 18px;">${worstRows}</ul>
          `
              : ""
          }

          <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px 0;">User flags this week</p>
          <p style="color:${userFlagsCount > 0 ? "#B8453A" : "#3A8A4A"};font-family:Georgia,serif;font-size:32px;font-weight:800;margin:0 0 22px 0;line-height:1;">${userFlagsCount}</p>

          ${
            bloomWarning
              ? `
            <div style="background-color:${EMAIL_COLORS.ochreWash};border-left:3px solid #B8453A;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 22px 0;">
              <p style="color:${EMAIL_COLORS.textBody};font-size:13px;line-height:1.6;margin:0;">${bloomWarning}</p>
            </div>
          `
              : ""
          }

          <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;text-align:center;margin:24px 0 0 0;">
            <a href="${appUrl}/coach" style="color:${EMAIL_COLORS.ochre};text-decoration:underline;">View full dashboard &rarr;</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return emailShell({ title: qualityAuditSubject(opts), body: bodyHtml });
}
