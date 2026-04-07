/**
 * Account deletion confirmation email — sent by /api/cron/process-deletions
 * after the 30-day deletion window completes.
 */

import {
  emailShell,
  heroWithBody,
  hero,
  EMAIL_COLORS,
  signoff,
} from "@/lib/emails/shell";

export const accountDeletionFrom = "Mindcraft <crew@allmindsondeck.com>";

export function accountDeletionSubject(): string {
  return "Your Mindcraft data has been deleted";
}

export function accountDeletionHtml(): string {
  const heroHtml = hero({
    tag: "Deletion confirmed",
    headline: "Your data has been deleted.",
    intro: "As you requested, everything has been permanently removed.",
  });

  const bodyHtml = `
    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      We&rsquo;ve permanently removed your journal entries, exercise responses, coaching summaries, intake data, goals, final insights, and referrals from Mindcraft. Your account has been closed.
    </p>

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      If you ever want to return, you&rsquo;re welcome anytime &mdash; you&rsquo;d start fresh.
    </p>

    <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.65;margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif;">
      Thank you for being part of Mindcraft, even briefly.
    </p>

    ${signoff({ replyNote: "" })}
  `;

  return emailShell({
    title: accountDeletionSubject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}
