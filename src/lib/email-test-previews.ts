/**
 * Test previews for the /admin/emails "Send test to me" button.
 *
 * Every preview imports the REAL production HTML function from src/lib/emails/.
 * No drift possible — when you edit a template, the preview updates automatically.
 *
 * Add a new email:
 *   1. Create src/lib/emails/<name>.ts exporting <name>Html, <name>Subject, <name>From
 *   2. Import the route at the top of this file
 *   3. Add a key to EMAIL_PREVIEWS with sample data
 */

import { offrampEmailHtml } from "@/lib/program-offramp";
import { welcomeEmailHtml, welcomeEmailSubject } from "@/lib/emails/welcome";
import {
  reEngageNudge1Html,
  reEngageNudge1Subject,
  reEngageNudge2Html,
  reEngageNudge2Subject,
  reEngageNudge3Html,
  reEngageNudge3Subject,
  reEngageExitSurveyHtml,
  reEngageExitSurveySubject,
} from "@/lib/emails/re-engage";
import {
  referralRewardRecipientHtml,
  referralRewardRecipientSubject,
  referralRewardAdminHtml,
  referralRewardAdminSubject,
} from "@/lib/emails/referral-reward";
import { giftCodeHtml, giftCodeSubject } from "@/lib/emails/gift-code";
import {
  enneagramPurchaseWebhookHtml,
  enneagramPurchaseWebhookSubject,
} from "@/lib/emails/enneagram-purchase-webhook";
import { contactAlertHtml, contactAlertSubject } from "@/lib/emails/contact-alert";
import { coachingApplicationHtml, coachingApplicationSubject } from "@/lib/emails/coaching-application";
import {
  waitlistUserConfirmationHtml,
  waitlistUserConfirmationSubject,
} from "@/lib/emails/waitlist";
import { qualityAuditHtml, qualityAuditSubject } from "@/lib/emails/quality-audit";
import { accountDeletionHtml, accountDeletionSubject } from "@/lib/emails/account-deletion";

export type EmailPreview = {
  subject: string;
  html: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://mindcraft.ing";

// ─────────────────────────────────────────────────────────────────────────
// Registry — every preview imports the REAL production HTML function.
// Sample data is realistic but invented. The HTML is byte-for-byte identical
// to what users receive in production.
// ─────────────────────────────────────────────────────────────────────────

export const EMAIL_PREVIEWS: Record<string, () => EmailPreview> = {
  welcome: () => ({
    subject: welcomeEmailSubject,
    html: welcomeEmailHtml({ appUrl: APP_URL }),
  }),

  "program-offramp": () => ({
    subject: "You finished Parachute.",
    html: offrampEmailHtml({
      programName: "Parachute",
      currentDay: 30,
      reason: "completed",
      insightsUrl: `${APP_URL}/insights/final?enrollment=test`,
      deleteUrl: `${APP_URL}/account/delete`,
      referUrl: `${APP_URL}/refer`,
      shareUrl: `${APP_URL}/share`,
      personalCode: "MC-TEST-20OFF",
      appUrl: APP_URL,
      coachingUrl: `${APP_URL}/contact?topic=coaching`,
    }),
  }),

  "re-engage-nudge-1": () => ({
    subject: reEngageNudge1Subject(),
    html: reEngageNudge1Html({ appUrl: APP_URL }),
  }),

  "re-engage-nudge-2": () => ({
    subject: reEngageNudge2Subject(),
    html: reEngageNudge2Html({ appUrl: APP_URL }),
  }),

  "re-engage-nudge-3": () => ({
    subject: reEngageNudge3Subject(),
    html: reEngageNudge3Html({ appUrl: APP_URL }),
  }),

  "re-engage-exit-survey": () => ({
    subject: reEngageExitSurveySubject(),
    html: reEngageExitSurveyHtml({
      appUrl: APP_URL,
      exitSurveyUrl: `${APP_URL}/feedback/exit`,
    }),
  }),

  "referral-reward-recipient": () => ({
    subject: referralRewardRecipientSubject(),
    html: referralRewardRecipientHtml(),
  }),

  "referral-reward-admin": () => {
    const opts = {
      referrerEmail: "jane@example.com",
      referredEmail: "alex@example.com",
    };
    return {
      subject: referralRewardAdminSubject(opts),
      html: referralRewardAdminHtml(opts),
    };
  },

  "gift-code": () => ({
    subject: giftCodeSubject(),
    html: giftCodeHtml({ giftCode: "GIFT-PARACHUTE-TEST-AB12" }),
  }),

  "contact-alert": () => {
    const opts = {
      senderName: "Jane Smith",
      senderEmail: "jane@example.com",
      issueType: "General question",
      message: "Just wanted to ask about the coaching option — is it available for people outside the US?\n\nI'm based in Berlin and the time zones could be tricky.",
    };
    return {
      subject: contactAlertSubject(opts),
      html: contactAlertHtml(opts),
    };
  },

  "coaching-application": () => {
    const opts = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      phone: "+1 (555) 123-4567",
      company: "Acme Corp",
      location: "San Francisco, CA",
      situation: "Two months into a PIP and trying to decide whether to fight for the role or start looking. The performance feedback is contradictory and I can't tell what's real anymore.",
      sixMonthGoal: "Either back in stride here with a clear sense of what changed, or in a new role I chose deliberately — not from panic.",
      funding: "Self-funded",
      budget: "$1500/mo",
      referral: "Found you through a LinkedIn post",
      anythingElse: "I've worked with a coach before but it felt too abstract. Looking for someone who can be specific about what to actually do.",
    };
    return {
      subject: coachingApplicationSubject(opts),
      html: coachingApplicationHtml(opts),
    };
  },

  "waitlist-user-confirmation": () => {
    const opts = { email: "jane@example.com", program: "First-Time Manager" };
    return {
      subject: waitlistUserConfirmationSubject(opts),
      html: waitlistUserConfirmationHtml(opts),
    };
  },

  "enneagram-purchase-webhook": () => {
    const opts = {
      customerEmail: "jane@example.com",
      tier: "enneagram",
      program: "parachute",
      amountCents: "29000",
      stripeCustomerId: "cus_TestCustomerId123",
    };
    return {
      subject: enneagramPurchaseWebhookSubject(opts),
      html: enneagramPurchaseWebhookHtml(opts),
    };
  },

  "quality-audit-report": () => {
    const opts = {
      auditWeek: new Date().toISOString().split("T")[0],
      evaluatedCount: 42,
      avgTotal: 24.3,
      dimensionAverages: {
        groundedness: 4.5,
        specificity: 4.2,
        warmth: 4.6,
        coach_voice: 4.4,
        actionability: 3.8,
        accuracy: 4.7,
      },
      flagFrequency: {
        clinical_language: 3,
        vague_attribution: 2,
        missing_evidence: 1,
      },
      bottomOutputs: [
        { total: 14, feedback: "Day 9 themes — too abstract, no quotes from user", flags: ["vague_attribution"] },
        { total: 16, feedback: "Day 12 process — used 'studies show' twice", flags: ["missing_evidence"] },
        { total: 17, feedback: "Day 6 exercise framing — generic placeholder", flags: [] },
      ],
      userFlagsCount: 2,
      bloomWarning: null,
      appUrl: APP_URL,
    };
    return {
      subject: qualityAuditSubject(opts),
      html: qualityAuditHtml(opts),
    };
  },

  "account-deletion-confirmation": () => ({
    subject: accountDeletionSubject(),
    html: accountDeletionHtml(),
  }),
};

export function getEmailPreview(key: string): EmailPreview | null {
  const fn = EMAIL_PREVIEWS[key];
  return fn ? fn() : null;
}
