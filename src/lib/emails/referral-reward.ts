/**
 * Referral reward emails — sent by /api/referral-rewards cron at 1pm PT.
 * Two variants: recipient (referrer) and admin notification.
 */

import {
  emailShell,
  heroWithBody,
  hero,
  EMAIL_COLORS,
  ICONS,
  eyebrow,
  signoff,
} from "@/lib/emails/shell";

export type ReferralRewardRecipientOpts = Record<string, never>;

export type ReferralRewardAdminOpts = {
  referrerEmail: string;
  referredEmail: string;
};

export const referralRewardFrom = "Mindcraft <noreply@allmindsondeck.org>";

// ── Recipient (the referrer) ──────────────────────────────────────────

export function referralRewardRecipientSubject(): string {
  return "Your $10 Amazon gift card is on its way";
}

export function referralRewardRecipientHtml(_: ReferralRewardRecipientOpts = {}): string {
  const heroHtml = hero({
    tag: "Thank you",
    headline: "Your $10 gift card is on the way.",
    intro: "Someone you referred just completed their first week on Mindcraft. That&rsquo;s a real signal &mdash; thanks for sharing.",
  });

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.reward}</td>
        <td style="vertical-align:top;">
          ${eyebrow("How it works")}
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
            Your $10 Amazon gift card is being sent to this email by Tremendous (our gift card partner). Check your inbox in the next few hours &mdash; the email comes from <code style="background:${EMAIL_COLORS.ochreWash};padding:2px 6px;border-radius:4px;font-size:13px;">notifications@tremendous.com</code>, not from us.
          </p>
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0;">
            Want to refer another friend? Your referral code is still active. Send it to anyone going through a hard career stretch &mdash; they get 20% off, you get another $10 when they finish their first week.
          </p>
        </td>
      </tr>
    </table>

    ${signoff({ replyNote: "Hit reply if the gift card doesn't arrive within 24 hours." })}
  `;

  return emailShell({
    title: referralRewardRecipientSubject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}

// ── Admin notification ────────────────────────────────────────────────

export function referralRewardAdminSubject({ referrerEmail }: ReferralRewardAdminOpts): string {
  return `Referral reward sent — ${referrerEmail}`;
}

export function referralRewardAdminHtml({ referrerEmail, referredEmail }: ReferralRewardAdminOpts): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};vertical-align:top;width:140px;">
      <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0;">${label}</p>
    </td><td style="padding:10px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};">
      <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.5;margin:0;">${value}</p>
    </td></tr>`;

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.reward}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Reward sent")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 16px 0;letter-spacing:-0.015em;">
            $10 Amazon card sent
          </h2>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${row("Referrer", referrerEmail)}
            ${row("Referred", referredEmail)}
            ${row("Amount", "$10 USD (Amazon)")}
            ${row("Provider", "Tremendous")}
          </table>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    title: referralRewardAdminSubject({ referrerEmail, referredEmail }),
    body: bodyHtml,
  });
}
