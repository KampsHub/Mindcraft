/**
 * Contact form alert email — sent to crew@ on contact form submission.
 */

export type ContactAlertOpts = {
  senderName: string;
  senderEmail: string;
  issueType: string;
  message: string;
};

export const contactAlertFrom = "Mindcraft <noreply@allmindsondeck.org>";

export function contactAlertSubject({ issueType }: ContactAlertOpts): string {
  return `Mindcraft Contact: ${issueType}`;
}

export function contactAlertHtml({ senderName, senderEmail, issueType, message }: ContactAlertOpts): string {
  return `
            <div style="font-family: sans-serif; max-width: 600px;">
              <p><strong>From:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
              <p><strong>Type:</strong> ${issueType}</p>
              <hr style="border: 1px solid #eee;" />
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
          `;
}
