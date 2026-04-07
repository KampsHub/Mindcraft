/**
 * Enneagram purchase webhook email — sent by /api/webhook on Stripe enneagram purchase.
 */

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
  return `
                <div style="font-family: -apple-system, sans-serif; max-width: 520px; padding: 24px;">
                  <h2 style="margin: 0 0 16px;">New Enneagram Purchase</h2>
                  <table style="border-collapse: collapse; width: 100%;">
                    <tr><td style="padding: 8px 0; color: #666;">Customer</td><td style="padding: 8px 0; font-weight: 600;">${customerEmail || "Not provided"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Tier</td><td style="padding: 8px 0; font-weight: 600;">${tier}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Program</td><td style="padding: 8px 0; font-weight: 600;">${program || "standalone"}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Amount</td><td style="padding: 8px 0; font-weight: 600;">$${(Number(amountCents) / 100).toFixed(2)}</td></tr>
                    <tr><td style="padding: 8px 0; color: #666;">Stripe Customer</td><td style="padding: 8px 0;">${stripeCustomerId}</td></tr>
                  </table>
                  <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
                  <p style="color: #666; font-size: 14px;">
                    <strong>Action needed:</strong> Order IEQ9 assessment for this customer and coordinate debrief scheduling.
                  </p>
                </div>
              `;
}
