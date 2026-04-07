/**
 * Welcome email — sent on first login/signup.
 * Imported by /api/welcome-email/route.ts AND /admin/emails preview.
 * Single source of truth for the HTML.
 */

export type WelcomeEmailOpts = {
  appUrl: string;
};

export const welcomeEmailSubject = "Welcome to Mindcraft";
export const welcomeEmailFrom = "Stefanie from Mindcraft <stefanie@allmindsondeck.com>";

export function welcomeEmailHtml({ appUrl }: WelcomeEmailOpts): string {
  return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #1a1a1a;">
          <div style="margin-bottom: 32px;">
            <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em;">mindcraft</span>
          </div>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Hello and Welcome.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            I&rsquo;m glad you&rsquo;re here.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            You signed up during what&rsquo;s probably one of the harder stretches of your career.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            Practical tools matter &mdash; and there are great programs that offer them. Mindcraft goes a layer deeper. Over the next 30 days, you&rsquo;ll have a curated coaching experience &mdash; guided exercises, journaling, and tools that help you think with more clarity than you may have had in a while.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
            If you have questions or feedback at any point, there&rsquo;s a <strong>Contact</strong> button right on your dashboard. I read every message personally.
          </p>

          <div style="margin: 32px 0;">
            <a href="${appUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #C4943A; color: #1a1a1a; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
              Go to your dashboard
            </a>
          </div>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 4px 0;">
            Wishing you the best on this journey.
          </p>

          <p style="font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
            <strong>Stefanie Kamps</strong><br />
            <span style="color: #666; font-size: 14px;">Founder &middot; Mindcraft</span>
          </p>

          <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 20px;">
            <p style="font-size: 12px; color: #999; line-height: 1.5; margin: 0;">
              Mindcraft by All Minds on Deck LLC<br />
              <a href="${appUrl}/privacy-policy" style="color: #999;">Privacy Policy</a> &middot;
              <a href="${appUrl}/terms" style="color: #999;">Terms</a>
            </p>
          </div>
        </div>
      `;
}
