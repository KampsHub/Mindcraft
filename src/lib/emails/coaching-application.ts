/**
 * Coaching application email — sent to stefanie@ on coaching apply form submission.
 * Internal admin notification.
 */

import { emailShell, EMAIL_COLORS, ICONS, eyebrow } from "@/lib/emails/shell";

export type CoachingApplicationOpts = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  situation: string;
  sixMonthGoal: string;
  funding?: string;
  budget?: string;
  referral?: string;
  anythingElse?: string;
};

export const coachingApplicationFrom = "Mindcraft <stefanie@allmindsondeck.com>";

export function coachingApplicationSubject({ firstName, lastName }: CoachingApplicationOpts): string {
  return `Coaching Application — ${firstName} ${lastName}`;
}

export function coachingApplicationHtml(opts: CoachingApplicationOpts): string {
  const { firstName, lastName, email, phone, company, location, situation, sixMonthGoal, funding, budget, referral, anythingElse } = opts;

  const row = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};vertical-align:top;width:140px;">
          <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0;">${label}</p>
        </td><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};">
          <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.5;margin:0;">${value}</p>
        </td></tr>`
      : "";

  const longField = (label: string, value: string) =>
    `<div style="margin:18px 0;">
      <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px 0;">${label}</p>
      <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0;">${value}</p>
    </div>`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.application}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Coaching application")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 18px 0;letter-spacing:-0.015em;">
            ${firstName} ${lastName} wants to talk.
          </h2>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${row("Email", `<a href="mailto:${email}" style="color:${EMAIL_COLORS.ochre};text-decoration:none;">${email}</a>`)}
            ${row("Phone", phone)}
            ${row("Company", company)}
            ${row("Location", location)}
          </table>

          ${longField("What's going on right now?", situation)}
          ${longField("Six-month goal", sixMonthGoal)}

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${row("Funding", funding)}
            ${row("Budget", budget)}
            ${row("Referral", referral)}
          </table>

          ${anythingElse ? longField("Anything else", anythingElse) : ""}
        </td>
      </tr>
    </table>
  `;

  return emailShell({ title: coachingApplicationSubject(opts), body: bodyHtml });
}
