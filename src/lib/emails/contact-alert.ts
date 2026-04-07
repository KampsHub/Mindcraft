/**
 * Contact form alert email — sent to crew@ on contact form submission.
 * Internal admin notification, not customer-facing.
 */

import { emailShell, EMAIL_COLORS, ICONS, eyebrow } from "@/lib/emails/shell";

export type ContactAlertOpts = {
  senderName: string;
  senderEmail: string;
  issueType: string;
  message: string;
};

export const contactAlertFrom = "Mindcraft <noreply@allmindsondeck.org>";

export function contactAlertSubject({ issueType }: ContactAlertOpts): string {
  return `Mindcraft Contact: ${issueType}`;
}

export function contactAlertHtml({ senderName, senderEmail, issueType, message }: ContactAlertOpts): string {
  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.inbox}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Inbound")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 18px 0;letter-spacing:-0.015em;">
            New contact: ${issueType}
          </h2>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px 0;">
            <tr>
              <td style="padding:8px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};">
                <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px 0;">From</p>
                <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.5;margin:0;">
                  ${senderName} &lt;<a href="mailto:${senderEmail}" style="color:${EMAIL_COLORS.ochre};text-decoration:none;">${senderEmail}</a>&gt;
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};">
                <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px 0;">Type</p>
                <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.5;margin:0;">${issueType}</p>
              </td>
            </tr>
          </table>

          <div style="background-color:${EMAIL_COLORS.ochreWash};border-left:3px solid ${EMAIL_COLORS.ochre};border-radius:0 8px 8px 0;padding:18px 22px;margin:0 0 8px 0;">
            <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap;">${message.replace(/\n/g, "<br>")}</p>
          </div>
        </td>
      </tr>
    </table>
  `;

  return emailShell({ title: contactAlertSubject({ senderName, senderEmail, issueType, message }), body: bodyHtml });
}
