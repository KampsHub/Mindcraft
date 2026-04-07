/**
 * Gift code email — sent by /api/webhook when a Stripe gift purchase succeeds.
 */

export type GiftCodeOpts = {
  giftCode: string;
};

export const giftCodeFrom = "Mindcraft <crew@allmindsondeck.com>";

export function giftCodeSubject(): string {
  return "Your Mindcraft gift code is ready";
}

export function giftCodeHtml({ giftCode }: GiftCodeOpts): string {
  return `
                <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, sans-serif;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                    <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                      Your gift is ready.
                    </p>
                    <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                      Send this code to the person you&rsquo;d like to gift a Mindcraft program to. They&rsquo;ll use it at checkout to enroll for free.
                    </p>
                    <div style="text-align: center; margin: 28px 0; padding: 20px; background-color: rgba(255,255,255,0.06); border-radius: 10px;">
                      <p style="font-size: 28px; font-weight: 700; color: #e09585; margin: 0; letter-spacing: 0.08em;">
                        ${giftCode}
                      </p>
                    </div>
                    <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                      This code is single-use and works at <a href="https://mindcraft.ing" style="color: #e09585; text-decoration: none;">mindcraft.ing</a> checkout.
                    </p>
                  </div>
                </div>
              `;
}
