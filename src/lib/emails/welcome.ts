/**
 * Welcome email — sent on first login/signup.
 */

import {
  emailShell,
  heroWithBody,
  hero,
  primaryButton,
  signoff,
  EMAIL_COLORS,
} from "@/lib/emails/shell";

export type WelcomeEmailOpts = {
  appUrl: string;
};

export const welcomeEmailSubject = "Welcome to Mindcraft";
export const welcomeEmailFrom = "Stefanie from Mindcraft <stefanie@allmindsondeck.com>";

export function welcomeEmailHtml({ appUrl }: WelcomeEmailOpts): string {
  const heroHtml = hero({
    tag: "Welcome",
    headline: "Hello and welcome.",
    intro: "I&rsquo;m glad you&rsquo;re here.",
  });

  const bodyHtml = `
    <p style="color:${EMAIL_COLORS.textBody};font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.7;margin:0 0 18px 0;">
      You signed up during what&rsquo;s probably one of the harder stretches of your career.
    </p>

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      Practical tools matter &mdash; and there are great programs that offer them. Mindcraft goes a layer deeper. Over the next 30 days, you&rsquo;ll have a curated coaching experience: guided exercises, journaling, and tools that help you think with more clarity than you may have had in a while.
    </p>

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:0 0 28px 0;">
      If you have questions or feedback at any point, there&rsquo;s a <strong>Contact</strong> button right on your dashboard. I read every message personally.
    </p>

    ${primaryButton({ href: `${appUrl}/dashboard`, label: "Go to your dashboard \u2192" })}

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.7;margin:36px 0 0 0;">
      Wishing you the best on this journey.
    </p>

    ${signoff()}
  `;

  return emailShell({
    title: welcomeEmailSubject,
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}
