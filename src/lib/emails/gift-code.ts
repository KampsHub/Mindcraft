/**
 * Gift code email — sent by /api/webhook when a Stripe gift purchase succeeds.
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

export type GiftCodeOpts = {
  giftCode: string;
};

export const giftCodeFrom = "Mindcraft <crew@allmindsondeck.com>";

export function giftCodeSubject(): string {
  return "Your Mindcraft gift code is ready";
}

export function giftCodeHtml({ giftCode }: GiftCodeOpts): string {
  const heroHtml = hero({
    tag: "Gift purchased",
    headline: "Your gift is ready.",
    intro: "Send this code to the person you&rsquo;d like to gift a Mindcraft program to. They&rsquo;ll use it at checkout to enroll for free.",
  });

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.gift}</td>
        <td style="vertical-align:top;">
          ${eyebrow("The code")}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 14px 0;">
            <tr>
              <td style="background-color:${EMAIL_COLORS.ochreWash};border:1.5px dashed ${EMAIL_COLORS.ochre};border-radius:14px;padding:24px 28px;text-align:center;">
                <p style="color:${EMAIL_COLORS.textMuted};font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px 0;">
                  Single-use, 100% off
                </p>
                <p style="font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace;font-size:26px;font-weight:700;color:${EMAIL_COLORS.ochre};letter-spacing:0.16em;margin:0;">
                  ${giftCode}
                </p>
              </td>
            </tr>
          </table>
          <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.6;margin:0;">
            Works at <a href="https://mindcraft.ing" style="color:${EMAIL_COLORS.ochre};text-decoration:underline;">mindcraft.ing</a> checkout. The recipient enters this code at the price step.
          </p>
        </td>
      </tr>
    </table>

    ${signoff({ replyNote: "Hit reply if there&rsquo;s any trouble with the code." })}
  `;

  return emailShell({
    title: giftCodeSubject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}
