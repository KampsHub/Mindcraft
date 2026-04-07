/**
 * Enneagram purchase webhook email — sent by /api/webhook on Stripe enneagram purchase.
 * Internal admin notification.
 */

import { emailShell, EMAIL_COLORS, ICONS, eyebrow } from "@/lib/emails/shell";

export type EnneagramPurchaseWebhookOpts = {
  customerEmail: string | null | undefined;
  tier: string;
  program: string | null | undefined;
  amountCents: string;
  stripeCustomerId: string;
};

export const enneagramPurchaseWebhookFrom = "Mindcraft <crew@allmindsondeck.com>";

export function enneagramPurchaseWebhookSubject({ customerEmail }: EnneagramPurchaseWebhookOpts): string {
  return `🎯 New Enneagram Purchase — ${customerEmail || "Unknown"}`;
}

export function enneagramPurchaseWebhookHtml({
  customerEmail,
  tier,
  program,
  amountCents,
  stripeCustomerId,
}: EnneagramPurchaseWebhookOpts): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};vertical-align:top;width:140px;">
      <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0;">${label}</p>
    </td><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};">
      <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.5;margin:0;font-family:'SFMono-Regular',Menlo,monospace;">${value}</p>
    </td></tr>`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.shopping}</td>
        <td style="vertical-align:top;">
          ${eyebrow("New purchase")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 6px 0;letter-spacing:-0.015em;">
            New Enneagram Purchase
          </h2>
          <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.5;margin:0 0 18px 0;">
            ${customerEmail || "Unknown customer"}
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
            ${row("Customer", customerEmail || "Not provided")}
            ${row("Tier", tier)}
            ${row("Program", program || "standalone")}
            ${row("Amount", `$${(Number(amountCents) / 100).toFixed(2)}`)}
            ${row("Stripe customer", stripeCustomerId)}
          </table>

          <div style="background-color:${EMAIL_COLORS.ochreWash};border-left:3px solid ${EMAIL_COLORS.ochre};border-radius:0 8px 8px 0;padding:14px 18px;">
            <p style="color:${EMAIL_COLORS.textBody};font-size:13px;line-height:1.6;margin:0;">
              <strong>Action needed:</strong> Order IEQ9 assessment for this customer and coordinate debrief scheduling.
            </p>
          </div>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    title: enneagramPurchaseWebhookSubject({ customerEmail, tier, program, amountCents, stripeCustomerId }),
    body: bodyHtml,
  });
}
