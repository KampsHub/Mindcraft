/**
 * Re-engagement emails — sent by /api/email/re-engage cron at 3pm PT.
 *
 * Cadence (days since last sign-in via auth.users.last_sign_in_at):
 *   Day 3  → Nudge 1: gentle door
 *   Day 6  → Nudge 2: reframe the effort
 *   Day 9  → Nudge 3: quiet exit (we voice)
 *   Day 14 → Exit survey: what got in the way
 *
 * Each nudge fires at most ONCE per enrollment lifetime. No reset on sign-in.
 * If a customer receives nudge 1, signs in, then lapses again, the next nudge
 * in the sequence (nudge 2) is what fires when their next 6+ day gap appears —
 * not nudge 1 again.
 */

const ASK_BUTTON_PRIMARY = `display:inline-block;padding:14px 32px;background-color:#C4943A;color:#18181c;font-size:15px;font-weight:700;text-decoration:none;border-radius:100px;letter-spacing:0.01em;`;

const CARD_OPEN = `<div style="background-color:#18181c;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><div style="max-width:560px;margin:0 auto;background-color:#26262c;border-radius:16px;padding:40px 32px;color:#f0ede6;">`;
const CARD_CLOSE = `</div></div>`;

const SIGNATURE_STEFANIE = `
  <p style="color:#f0ede6;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-style:italic;margin:28px 0 4px 0;">
    &mdash; Stefanie
  </p>
  <p style="color:#a0a0a8;font-size:11px;font-style:italic;line-height:1.55;margin:14px 0 0 0;">
    Reply STOP to opt out of these check-ins.
  </p>
`;

const SIGNATURE_TEAM = `
  <p style="color:#f0ede6;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-style:italic;margin:28px 0 4px 0;">
    &mdash; Stefanie &amp; the Mindcraft team
  </p>
`;

// ── Common metadata ──
export const reEngageNudgeFrom = "Mindcraft <noreply@allmindsondeck.org>";
export const reEngageExitSurveyFrom = "Mindcraft <crew@allmindsondeck.com>";

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 1 — gentle door (day 3)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge1Opts = {
  appUrl: string;
};

export function reEngageNudge1Subject(): string {
  return "Just leaving the door open.";
}

export function reEngageNudge1Html({ appUrl }: ReEngageNudge1Opts): string {
  return `${CARD_OPEN}
    <p style="color:#f0ede6;font-size:16px;line-height:1.7;margin:0 0 18px 0;">
      You haven&rsquo;t been around the last couple of days. No judgment &mdash; life pulls in a hundred directions at once, especially when the thing you&rsquo;re working through is the reason you signed up in the first place.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
      Mindcraft is here whenever you want to come back. No catch-up, no pressure, no clock running.
    </p>
    <div style="text-align:center;margin:32px 0 8px 0;">
      <a href="${appUrl}/dashboard" style="${ASK_BUTTON_PRIMARY}">
        Open the program &rarr;
      </a>
    </div>
    ${SIGNATURE_STEFANIE}
  ${CARD_CLOSE}`;
}

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 2 — reframe the effort (day 6)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge2Opts = {
  appUrl: string;
};

export function reEngageNudge2Subject(): string {
  return "You don't have to catch up.";
}

export function reEngageNudge2Html({ appUrl }: ReEngageNudge2Opts): string {
  return `${CARD_OPEN}
    <p style="color:#f0ede6;font-size:16px;line-height:1.7;margin:0 0 18px 0;">
      You don&rsquo;t have to do all of it. You don&rsquo;t even have to do most of it. Mindcraft was built to bend around real life, not the other way around.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
      If you want to come back, just open one day. Skip what you missed. Pick up wherever feels right. There&rsquo;s no penalty for gaps, no scoreboard, no version of &ldquo;behind&rdquo; that exists here.
    </p>
    <div style="text-align:center;margin:32px 0 8px 0;">
      <a href="${appUrl}/dashboard" style="${ASK_BUTTON_PRIMARY}">
        Open the program &rarr;
      </a>
    </div>
    ${SIGNATURE_STEFANIE}
  ${CARD_CLOSE}`;
}

// ─────────────────────────────────────────────────────────────────────────
// NUDGE 3 — quiet exit, "we" voice (day 9)
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageNudge3Opts = {
  appUrl: string;
};

export function reEngageNudge3Subject(): string {
  return "Going quiet \u2014 your work is safe.";
}

export function reEngageNudge3Html(_opts: ReEngageNudge3Opts): string {
  return `${CARD_OPEN}
    <p style="color:#f0ede6;font-size:16px;line-height:1.7;margin:0 0 18px 0;">
      We&rsquo;re going to stop sending program reminders. The last thing someone in a hard stretch needs is another inbox getting louder.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      Your account is still here. Your journal entries, your exercises, your reflection &mdash; all of it is preserved. Nothing expires. If you want to come back next week, next month, or next year, just sign in and pick it up.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      If you&rsquo;re still away in a couple of weeks, we&rsquo;ll send one short follow-up asking what got in the way &mdash; that helps us make Mindcraft better for the next person. Then we&rsquo;ll really go quiet.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
      Either way, your work stays put until you decide otherwise.
    </p>
    <p style="color:#f0ede6;font-size:15px;line-height:1.7;margin:0 0 0 0;">
      Take care of yourself.
    </p>
    ${SIGNATURE_TEAM}
  ${CARD_CLOSE}`;
}

// ─────────────────────────────────────────────────────────────────────────
// EXIT SURVEY — day 14, what got in the way
// ─────────────────────────────────────────────────────────────────────────

export type ReEngageExitSurveyOpts = {
  appUrl: string;
  exitSurveyUrl: string;
};

export function reEngageExitSurveySubject(): string {
  return "One short question, then we're done.";
}

export function reEngageExitSurveyHtml({ exitSurveyUrl }: ReEngageExitSurveyOpts): string {
  return `${CARD_OPEN}
    <p style="color:#f0ede6;font-size:16px;line-height:1.7;margin:0 0 18px 0;">
      A couple of weeks ago you started Mindcraft and stepped away. We promised one last note, and this is it.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 18px 0;">
      If you have two minutes, we&rsquo;d love to know what got in the way. Two short questions. No follow-up unless you ask for one.
    </p>
    <p style="color:#d0ccc6;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
      Your answers don&rsquo;t go into a dashboard or a sales pipeline &mdash; they go into how we build the next version of Mindcraft for the next person who&rsquo;s where you were.
    </p>
    <div style="text-align:center;margin:32px 0 8px 0;">
      <a href="${exitSurveyUrl}" style="${ASK_BUTTON_PRIMARY}">
        Tell us what got in the way &rarr;
      </a>
    </div>
    <p style="color:#a0a0a8;font-size:13px;line-height:1.65;margin:24px 0 0 0;">
      Your account stays put. Your work stays put. Nothing changes whether you fill this out or not &mdash; if you ever want to come back, just sign in.
    </p>
    ${SIGNATURE_TEAM}
  ${CARD_CLOSE}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Legacy exports — kept so existing imports don't break.
// The cron route should be migrated to use the new functions above.
// ─────────────────────────────────────────────────────────────────────────

/** @deprecated Use reEngageNudge1/2/3 instead. */
export type ReEngageNudgeOpts = {
  currentDay: number;
  themeReference: string;
  reminderIndex: number;
};

/** @deprecated Use reEngageNudge1Subject/2Subject/3Subject instead. */
export function reEngageNudgeSubject({ reminderIndex }: ReEngageNudgeOpts): string {
  if (reminderIndex === 0) return reEngageNudge1Subject();
  if (reminderIndex === 1) return reEngageNudge2Subject();
  return reEngageNudge3Subject();
}

/** @deprecated Use reEngageNudge1Html/2Html/3Html instead. */
export function reEngageNudgeHtml({ reminderIndex }: ReEngageNudgeOpts): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mindcraft.ing";
  if (reminderIndex === 0) return reEngageNudge1Html({ appUrl });
  if (reminderIndex === 1) return reEngageNudge2Html({ appUrl });
  return reEngageNudge3Html({ appUrl });
}
