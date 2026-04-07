/**
 * Referral reward emails — sent by /api/referral-rewards cron at 1pm PT.
 * Two variants: recipient (referrer) and admin notification.
 */

export type ReferralRewardRecipientOpts = {
  // No params needed today, but kept as object for consistency
};

export type ReferralRewardAdminOpts = {
  referrerEmail: string;
  referredEmail: string;
};

export const referralRewardFrom = "Mindcraft <noreply@allmindsondeck.org>";

export function referralRewardRecipientSubject(): string {
  return "Your $10 Amazon gift card is on its way";
}

export function referralRewardRecipientHtml(_: ReferralRewardRecipientOpts = {}): string {
  return `
            <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, sans-serif;">
              <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                  Someone you referred just completed their first week on Mindcraft.
                </p>
                <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
                  Your $10 Amazon gift card is being sent to this email. Check your inbox (it comes from Tremendous).
                </p>
                <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6; margin: 0;">
                  Thank you for sharing Mindcraft with someone who needed it.
                </p>
              </div>
            </div>
          `;
}

export function referralRewardAdminSubject({ referrerEmail }: ReferralRewardAdminOpts): string {
  return `Referral reward sent — ${referrerEmail}`;
}

export function referralRewardAdminHtml({ referrerEmail, referredEmail }: ReferralRewardAdminOpts): string {
  return `<p>$10 Amazon gift card sent to ${referrerEmail} for referring ${referredEmail}.</p>`;
}
