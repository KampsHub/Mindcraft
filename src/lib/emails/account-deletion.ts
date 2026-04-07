/**
 * Account deletion confirmation email — sent by /api/cron/process-deletions
 * after the 30-day deletion window completes.
 */

export const accountDeletionFrom = "Mindcraft <crew@allmindsondeck.com>";

export function accountDeletionSubject(): string {
  return "Your Mindcraft data has been deleted";
}

export function accountDeletionHtml(): string {
  return `
<div style="background-color:#18181c;padding:40px 20px;font-family:-apple-system,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background-color:#26262c;border-radius:12px;padding:36px 32px;color:#f0ede6;">
    <h1 style="font-size:22px;font-weight:800;margin:0 0 14px 0;color:#f0ede6;">Your data has been deleted.</h1>
    <p style="font-size:14px;line-height:1.65;color:#d0ccc6;margin:0 0 14px 0;">
      As requested, we&rsquo;ve permanently removed your journal entries, exercise responses,
      coaching summaries, intake data, goals, final insights, and referrals from Mindcraft.
      Your account has been closed.
    </p>
    <p style="font-size:14px;line-height:1.65;color:#d0ccc6;margin:0 0 14px 0;">
      If you ever want to return, you&rsquo;re welcome anytime &mdash; you&rsquo;d start fresh.
    </p>
    <p style="font-size:12px;color:#6b6b72;margin:24px 0 0 0;">
      Sent with care by the crew at All Minds On Deck.
    </p>
  </div>
</div>`;
}
