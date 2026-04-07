/**
 * Waitlist user-confirmation email — sent to the user who joined the waitlist.
 * (The team-alert version was removed; only the user confirmation remains.)
 */

import {
  emailShell,
  heroWithBody,
  hero,
  EMAIL_COLORS,
  signoff,
} from "@/lib/emails/shell";

export type WaitlistOpts = {
  email: string;
  program: string;
};

export const waitlistFrom = "Mindcraft <crew@allmindsondeck.com>";

export function waitlistUserConfirmationSubject({ program }: WaitlistOpts): string {
  return `You're on the list — ${program}`;
}

export function waitlistUserConfirmationHtml({ program }: WaitlistOpts): string {
  const heroHtml = hero({
    tag: "Waitlist confirmed",
    headline: "You're on the list.",
    intro: `We&rsquo;ll let you know as soon as the <strong>${program}</strong> program is ready.`,
  });

  const bodyHtml = `
    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      No spam, no marketing drips. One email when the program launches, and you can decide then whether it&rsquo;s right for you.
    </p>

    <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.65;margin:0;font-style:italic;font-family:Georgia,'Times New Roman',serif;">
      In the meantime, if you&rsquo;re going through something hard right now and can&rsquo;t wait, take a look at our other programs at <a href="https://mindcraft.ing" style="color:${EMAIL_COLORS.ochre};text-decoration:underline;">mindcraft.ing</a>. They&rsquo;re for different career situations but the underlying tools are the same.
    </p>

    ${signoff({ replyNote: "Reply if you have questions. I read every message." })}
  `;

  return emailShell({
    title: waitlistUserConfirmationSubject({ email: "", program }),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}
