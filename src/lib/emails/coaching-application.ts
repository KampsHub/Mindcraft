/**
 * Coaching application email — sent to stefanie@ on coaching apply form submission.
 */

export type CoachingApplicationOpts = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  situation: string;
  sixMonthGoal: string;
  funding?: string;
  budget?: string;
  referral?: string;
  anythingElse?: string;
};

export const coachingApplicationFrom = "Mindcraft <stefanie@allmindsondeck.com>";

export function coachingApplicationSubject({ firstName, lastName }: CoachingApplicationOpts): string {
  return `Coaching Application — ${firstName} ${lastName}`;
}

export function coachingApplicationHtml(opts: CoachingApplicationOpts): string {
  const { firstName, lastName, email, phone, company, location, situation, sixMonthGoal, funding, budget, referral, anythingElse } = opts;

  const row = (label: string, value?: string) =>
    value ? `<tr><td style="padding:8px 16px 8px 0;font-weight:600;color:#333;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:8px 0;color:#555">${value}</td></tr>` : "";

  return `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a">
          <p style="font-size:20px;font-weight:700;margin:0 0 24px">New Coaching Application</p>
          <table style="border-collapse:collapse;width:100%;font-size:15px;line-height:1.6">
            ${row("Name", `${firstName} ${lastName}`)}
            ${row("Email", `<a href="mailto:${email}">${email}</a>`)}
            ${row("Phone", phone)}
            ${row("Company", company)}
            ${row("Location", location)}
          </table>
          <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/>
          <p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">What's going on right now?</p>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${situation}</p>
          <p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">Six-month goal</p>
          <p style="font-size:15px;color:#555;line-height:1.7;margin:0 0 20px">${sixMonthGoal}</p>
          <table style="border-collapse:collapse;width:100%;font-size:15px;line-height:1.6">
            ${row("Funding", funding)}
            ${row("Budget", budget)}
            ${row("Referral", referral)}
          </table>
          ${anythingElse ? `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/><p style="font-size:14px;font-weight:700;color:#333;margin:0 0 8px">Anything else</p><p style="font-size:15px;color:#555;line-height:1.7;margin:0">${anythingElse}</p>` : ""}
        </div>
      `;
}
