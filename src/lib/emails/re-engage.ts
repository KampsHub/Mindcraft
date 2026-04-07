/**
 * Re-engagement emails — sent by /api/email/re-engage cron at 3pm PT.
 *
 * Cadence (days since last sign-in via auth.users.last_sign_in_at):
 *   Day 3  → Nudge 1: gentle door (Stefanie I-voice)
 *   Day 6  → Nudge 2: reframe the effort (Stefanie I-voice)
 *   Day 9  → Nudge 3: quiet exit ("we" voice, no CTA)
 *   Day 14 → Exit survey: what got in the way (yellow button)
 *
 * Each nudge fires at most ONCE per enrollment lifetime.
 */

import {
  emailShell,
  heroWithBody,
  hero,
  primaryButton,
  EMAIL_COLORS,
  ICONS,
  signoff,
  teamSignoff,
  stopFooter,
  eyebrow,
} from "@/lib/emails/shell";

export const reEngageNudgeFrom = "Mindcraft <noreply@allmindsondeck.org>";
export const reEngageExitSurveyFrom = "Mindcraft <crew@allmindsondeck.com>";

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 1 — gentle door (day 3)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge1Opts = { appUrl: string };

export function reEngageNudge1Subject(): string {
  return "Just leaving the door open.";
}

export function reEngageNudge1Html({ appUrl }: ReEngageNudge1Opts): string {
  const heroHtml = hero({
    tag: "Just checking in",
    headline: "Just leaving the door open.",
  });

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.door}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Day 3")}
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
            You haven&rsquo;t been around the last couple of days. No judgment &mdash; life pulls in a hundred directions at once, especially when the thing you&rsquo;re working through is the reason you signed up in the first place.
          </p>
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 26px 0;">
            Mindcraft is here whenever you want to come back. No catch-up, no pressure, no clock running.
          </p>
          ${primaryButton({ href: `${appUrl}/dashboard`, label: "Open the program \u2192" })}
        </td>
      </tr>
    </table>

    ${signoff({ replyNote: "" })}
    ${stopFooter()}
  `;

  return emailShell({
    title: reEngageNudge1Subject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 2 — reframe the effort (day 6)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge2Opts = { appUrl: string };

export function reEngageNudge2Subject(): string {
  return "You don't have to catch up.";
}

export function reEngageNudge2Html({ appUrl }: ReEngageNudge2Opts): string {
  const heroHtml = hero({
    tag: "Day 6",
    headline: "You don't have to catch up.",
  });

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.pause}</td>
        <td style="vertical-align:top;">
          ${eyebrow("A different angle")}
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
            You don&rsquo;t have to do all of it. You don&rsquo;t even have to do most of it. Mindcraft was built to bend around real life, not the other way around.
          </p>
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 26px 0;">
            If you want to come back, just open one day. Skip what you missed. Pick up wherever feels right. There&rsquo;s no penalty for gaps, no scoreboard, no version of &ldquo;behind&rdquo; that exists here.
          </p>
          ${primaryButton({ href: `${appUrl}/dashboard`, label: "Open one day \u2192" })}
        </td>
      </tr>
    </table>

    ${signoff({ replyNote: "" })}
    ${stopFooter()}
  `;

  return emailShell({
    title: reEngageNudge2Subject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 3 — quiet exit, "we" voice (day 9)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge3Opts = { appUrl: string };

export function reEngageNudge3Subject(): string {
  return "Going quiet \u2014 your work is safe.";
}

export function reEngageNudge3Html(_opts: ReEngageNudge3Opts): string {
  const heroHtml = hero({
    tag: "Day 9",
    headline: "Going quiet — your work is safe.",
  });

  const bodyHtml = `
    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
      We&rsquo;re going to stop sending program reminders. The last thing someone in a hard stretch needs is another inbox getting louder.
    </p>

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
      Your account is still here. Your journal entries, your exercises, your reflection &mdash; all of it is preserved. Nothing expires. If you want to come back next week, next month, or next year, just sign in and pick it up.
    </p>

    <div style="background-color:${EMAIL_COLORS.ochreWash};border-left:3px solid ${EMAIL_COLORS.ochre};border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 18px 0;">
      <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0;">
        If you&rsquo;re still away in a couple of weeks, we&rsquo;ll send one short follow-up asking what got in the way &mdash; that helps us make Mindcraft better for the next person. Then we&rsquo;ll really go quiet.
      </p>
    </div>

    <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 8px 0;">
      Either way, your work stays put until you decide otherwise.
    </p>

    <p style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;line-height:1.6;margin:24px 0 0 0;">
      Take care of yourself.
    </p>

    ${teamSignoff()}
  `;

  return emailShell({
    title: reEngageNudge3Subject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}

// ─────────────────────────────────────────────────────────────────────────
// EXIT SURVEY — day 14
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageExitSurveyOpts = {
  appUrl: string;
  exitSurveyUrl: string;
};

export function reEngageExitSurveySubject(): string {
  return "One short question, then we're done.";
}

export function reEngageExitSurveyHtml({ exitSurveyUrl }: ReEngageExitSurveyOpts): string {
  const heroHtml = hero({
    tag: "One last note",
    headline: "One short question, then we're done.",
  });

  const bodyHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.question}</td>
        <td style="vertical-align:top;">
          ${eyebrow("From the team")}
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
            A couple of weeks ago you started Mindcraft and stepped away. We promised one last note, and this is it.
          </p>
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 18px 0;">
            If you have two minutes, we&rsquo;d love to know what got in the way. Two short questions. No follow-up unless you ask for one.
          </p>
          <p style="color:${EMAIL_COLORS.textBody};font-size:15px;line-height:1.75;margin:0 0 26px 0;">
            Your answers don&rsquo;t go into a dashboard or a sales pipeline &mdash; they go into how we build the next version of Mindcraft for the next person who&rsquo;s where you were.
          </p>
          ${primaryButton({ href: exitSurveyUrl, label: "Tell us what got in the way \u2192" })}
          <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.65;margin:24px 0 0 0;">
            Your account stays put. Your work stays put. Nothing changes whether you fill this out or not &mdash; if you ever want to come back, just sign in.
          </p>
        </td>
      </tr>
    </table>

    ${teamSignoff()}
  `;

  return emailShell({
    title: reEngageExitSurveySubject(),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}
