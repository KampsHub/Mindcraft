/**
 * Waitlist emails — sent on waitlist signup.
 * Two variants: team alert (text) and user confirmation (HTML).
 */

export type WaitlistOpts = {
  email: string;
  program: string;
};

export const waitlistFrom = "Mindcraft <crew@allmindsondeck.com>";

// ── Team alert (plain text) ──
export function waitlistTeamAlertSubject({ program }: WaitlistOpts): string {
  return `Waitlist signup: ${program}`;
}

export function waitlistTeamAlertText({ email, program }: WaitlistOpts): string {
  return `New waitlist signup:\n\nEmail: ${email}\nProgram: ${program}\nDate: ${new Date().toISOString()}`;
}

// ── User confirmation (HTML) ──
export function waitlistUserConfirmationSubject({ program }: WaitlistOpts): string {
  return `You're on the list — ${program}`;
}

export function waitlistUserConfirmationHtml({ program }: WaitlistOpts): string {
  return `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a1a; margin-bottom: 16px;">You're on the waitlist.</h2>
            <p style="color: #333; line-height: 1.6;">
              We'll let you know as soon as the <strong>${program}</strong> program is ready.
              No spam, just one email when it launches.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
              — The Mindcraft team
            </p>
          </div>
        `;
}
