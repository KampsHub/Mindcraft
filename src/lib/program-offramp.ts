import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendServerEvent, syntheticClientId } from "./ga-measurement-protocol";

/**
 * Shared off-ramp helper. Called both by the daily completion cron and by
 * the user-initiated /api/enrollment/close-early endpoint.
 *
 * Steps:
 *   1. Mark enrollment terminal (completed or closed_early)
 *   2. Create a 20% off personal promo code in Stripe + DB
 *   3. Insert a placeholder final_insights row and kick off generation
 *   4. Send the completion/close email
 *
 * Fully idempotent: if the enrollment is already terminal, the helper is a no-op.
 */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode(prefix = "GROW", len = 6): string {
  let out = `${prefix}-`;
  for (let i = 0; i < len; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export type OfframpReason = "completed" | "closed_early";

export interface OfframpResult {
  ok: boolean;
  enrollment_id: string;
  promo_code?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Run the off-ramp for a single enrollment. `supabase` must be a service-role
 * client (we write to tables users can't reach directly).
 */
export async function runOfframp(
  supabase: SupabaseClient,
  enrollmentId: string,
  opts: { reason: OfframpReason }
): Promise<OfframpResult> {
  const terminalStatus = opts.reason === "closed_early" ? "closed_early" : "completed";

  // 1. Load enrollment + program info
  const { data: enrollment, error: loadErr } = await supabase
    .from("program_enrollments")
    .select("id, client_id, program_id, status, current_day, started_at, ga_client_id, max_inactivity_days, had_3d_gap, had_7d_gap, programs(slug, name)")
    .eq("id", enrollmentId)
    .single();

  if (loadErr || !enrollment) {
    return { ok: false, enrollment_id: enrollmentId, error: loadErr?.message || "Enrollment not found" };
  }

  // Idempotency guard — already terminal, nothing to do.
  if (enrollment.status === "completed" || enrollment.status === "closed_early") {
    return { ok: true, enrollment_id: enrollmentId, skipped: true };
  }

  const clientId = enrollment.client_id as string;
  const program = enrollment.programs as unknown as { slug: string; name: string } | null;
  const programSlug = program?.slug ?? "unknown";
  const programName = program?.name ?? "your program";
  const currentDay = (enrollment.current_day as number) ?? 0;

  // 2. Mark enrollment terminal (atomic via status guard)
  const { error: updErr } = await supabase
    .from("program_enrollments")
    .update({ status: terminalStatus, completed_at: new Date().toISOString() })
    .eq("id", enrollmentId)
    .not("status", "in", "(completed,closed_early)");
  if (updErr) {
    return { ok: false, enrollment_id: enrollmentId, error: updErr.message };
  }

  // Fire program_completed (or program_closed_early) via GA4 Measurement Protocol.
  // Uses the stored ga_client_id so the event ties to the correct GA user.
  try {
    const startedAt = enrollment.started_at ? new Date(enrollment.started_at as string) : null;
    const daysToComplete = startedAt
      ? Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const gaClientId =
      (enrollment.ga_client_id as string | null) ||
      syntheticClientId(`enrollment.${enrollmentId}`);
    await sendServerEvent(
      gaClientId,
      opts.reason === "completed" ? "program_completed" : "program_closed_early",
      {
        program: programSlug,
        total_days: currentDay,
        days_to_complete: daysToComplete,
        had_3d_gap: Boolean(enrollment.had_3d_gap),
        had_7d_gap: Boolean(enrollment.had_7d_gap),
        max_inactivity_days: (enrollment.max_inactivity_days as number) ?? 0,
        enrollment_id: enrollmentId,
      },
    );
  } catch {
    // Analytics failure must not block off-ramp
  }

  // 3. Personal promo code — 20% off, single-use
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  let personalCode = newCode("GROW");
  let stripePromoId: string | null = null;

  if (stripe) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const coupon = await stripe.coupons.create({
          percent_off: 20,
          duration: "once",
          name: `Personal reward: ${personalCode}`,
          max_redemptions: 1,
        });
        const promo = await stripe.promotionCodes.create({
          promotion: { type: "coupon", coupon: coupon.id },
          code: personalCode,
          max_redemptions: 1,
          metadata: {
            type: "personal_reward",
            client_id: clientId,
            source_enrollment_id: enrollmentId,
            reason: opts.reason,
          },
        });
        stripePromoId = promo.id;
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.toLowerCase().includes("already exists")) {
          personalCode = newCode("GROW");
          continue;
        }
        console.error("offramp: stripe promo creation failed", msg);
        break;
      }
    }
  }

  await supabase.from("personal_promo_codes").insert({
    client_id: clientId,
    code: personalCode,
    discount_percent: 20,
    stripe_promo_id: stripePromoId,
    source: "program_completion",
    source_enrollment_id: enrollmentId,
  });

  // 4. Placeholder final_insight row + trigger generation
  await supabase.from("final_insights").upsert({
    client_id: clientId,
    enrollment_id: enrollmentId,
    program_slug: programSlug,
    content: "",
    status: "generating",
  }, { onConflict: "enrollment_id" });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mindcraft.allmindsondeck.com";
  const cronSecret = process.env.CRON_SECRET;

  fetch(`${appUrl}/api/insights/final/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
    },
    body: JSON.stringify({ enrollment_id: enrollmentId, reason: opts.reason }),
  }).catch((e) => console.error("offramp: final insight trigger failed", e));

  // 5. Completion email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(clientId);
      const recipientEmail = authUser?.user?.email;
      if (recipientEmail) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        const insightsUrl = `${appUrl}/insights/final?enrollment=${enrollmentId}`;
        const deleteUrl = `${appUrl}/account/delete`;
        const referUrl = `${appUrl}/refer`;
        const shareUrl = `${appUrl}/share`;
        await resend.emails.send({
          from: "Mindcraft <crew@allmindsondeck.com>",
          to: recipientEmail,
          subject: opts.reason === "closed_early"
            ? `You closed ${programName}.`
            : `You finished ${programName}.`,
          html: offrampEmailHtml({
            programName,
            currentDay,
            reason: opts.reason,
            insightsUrl,
            deleteUrl,
            referUrl,
            shareUrl,
            personalCode,
            appUrl,
            coachingUrl: `${appUrl}/contact?topic=coaching`,
          }),
        });
      }
    } catch (e) {
      console.warn("offramp: email send failed", e);
    }
  }

  return { ok: true, enrollment_id: enrollmentId, promo_code: personalCode };
}


/* ─────────────────────────── email template ─────────────────────────── */

import {
  emailShell,
  heroWithBody,
  hero,
  primaryButton,
  secondaryButton,
  EMAIL_COLORS,
  ICONS,
  eyebrow,
  divider,
  dataFooter,
  escapeHtml as shellEscapeHtml,
} from "@/lib/emails/shell";

export function offrampEmailHtml(opts: {
  programName: string;
  currentDay: number;
  reason: OfframpReason;
  insightsUrl: string;
  deleteUrl: string;
  referUrl: string;
  shareUrl: string;
  personalCode: string;
  appUrl: string;
  coachingUrl: string;
}): string {
  const { programName, currentDay, reason, insightsUrl, deleteUrl, shareUrl, personalCode, coachingUrl } = opts;
  // referUrl, appUrl intentionally unused — referral now lives inside the share section
  void opts.referUrl;
  void opts.appUrl;

  const headline = reason === "closed_early"
    ? `You closed ${shellEscapeHtml(programName)} on day ${currentDay}.`
    : `You finished ${shellEscapeHtml(programName)}.`;

  const openingLine = reason === "closed_early"
    ? `Closing early isn&rsquo;t quitting. It&rsquo;s a choice about what you need next. Whatever made you pause &mdash; another program, a different season, something else entirely &mdash; that&rsquo;s valid.`
    : `Thirty days is longer than it sounds. Whatever you carried in, you sat with it.`;

  const reflectionBlurb = reason === "closed_early"
    ? `A look at the patterns across your ${currentDay} day${currentDay === 1 ? "" : "s"} &mdash; what shifted, what you may have moved past too quickly, and what to watch for next.`
    : `A look at the patterns across your 30 days &mdash; what shifted, what you may have moved past too quickly, and what to watch for next.`;

  const tagLabel = reason === "closed_early" ? "Program closed" : "You made it";

  // Hero — for completed flow we show a giant "30" stat
  const heroHtml = reason === "closed_early"
    ? hero({ tag: tagLabel, headline, intro: openingLine })
    : hero({ tag: tagLabel, headline, intro: openingLine, stat: "30", statLabel: "days · done" });

  // Numbered share-options list
  const numberedOption = (n: string, title: string, desc: string, isLast: boolean) => `
    <tr>
      <td style="padding:14px 0;border-top:1px solid ${EMAIL_COLORS.borderSubtle};${isLast ? `border-bottom:1px solid ${EMAIL_COLORS.borderSubtle};` : ""}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:top;width:36px;color:${EMAIL_COLORS.ochre};font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;font-style:italic;">${n}</td>
            <td style="vertical-align:top;">
              <p style="color:${EMAIL_COLORS.textPrimary};font-size:14px;line-height:1.55;margin:0;font-weight:600;">${title}</p>
              <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;line-height:1.55;margin:4px 0 0 0;">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const bodyHtml = `
    <!-- Reflection -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.reflection}</td>
        <td style="vertical-align:top;">
          ${eyebrow("The work, looked at")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.015em;">
            Your final reflection is ready.
          </h2>
          <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0 0 20px 0;">
            ${reflectionBlurb}
          </p>
          ${primaryButton({ href: insightsUrl, label: "Read your reflection \u2192" })}
        </td>
      </tr>
    </table>

    ${divider()}

    <!-- Personal gift code -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.gift}</td>
        <td style="vertical-align:top;">
          ${eyebrow("A small thing")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.015em;">
            20% off your next program.
          </h2>
          <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0 0 20px 0;">
            If you come back for another program, this is yours.
          </p>
        </td>
      </tr>
    </table>

    <!-- Ticket stub -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 14px 0;">
      <tr>
        <td style="background-color:${EMAIL_COLORS.ochreWash};border:1.5px dashed ${EMAIL_COLORS.ochre};border-radius:14px;padding:24px 28px;text-align:center;">
          <p style="color:${EMAIL_COLORS.textMuted};font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px 0;">
            Your code
          </p>
          <p style="font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace;font-size:26px;font-weight:700;color:${EMAIL_COLORS.ochre};letter-spacing:0.16em;margin:0 0 8px 0;">
            ${shellEscapeHtml(personalCode)}
          </p>
          <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;line-height:1.5;margin:0;">
            20% off &middot; single-use &middot; any program
          </p>
        </td>
      </tr>
    </table>

    <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;line-height:1.55;margin:0;text-align:center;">
      If it doesn&rsquo;t work, email <a href="mailto:crew@allmindsondeck.com" style="color:${EMAIL_COLORS.ochre};text-decoration:underline;">crew@allmindsondeck.com</a>.
    </p>

    ${divider()}

    <!-- A real ask, from me -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.ask}</td>
        <td style="vertical-align:top;">
          ${eyebrow("A real ask, from me")}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;line-height:1.25;margin:0 0 18px 0;letter-spacing:-0.02em;">
            Would you tell one person what changed?
          </h2>
        </td>
      </tr>
    </table>

    <!-- Pull quote -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
      <tr>
        <td style="border-left:3px solid ${EMAIL_COLORS.ochre};padding:8px 0 8px 20px;">
          <p style="color:${EMAIL_COLORS.textBody};font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;line-height:1.6;margin:0;">
            Mindcraft is still small. Small enough that one honest sentence from you can be the reason someone else trusts us with a tough stretch of their career.
          </p>
        </td>
      </tr>
    </table>

    <!-- Three numbered options -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
      ${numberedOption("01", "Send a friend your referral code", "They get 20% off, you get $10 Amazon.", false)}
      ${numberedOption("02", "Post on LinkedIn or anywhere you&rsquo;re seen", "A sentence is enough.", false)}
      ${numberedOption("03", "Write a quote for the site", "Two minutes.", true)}
    </table>

    ${primaryButton({ href: shareUrl, label: "Share your story \u2192" })}

    ${divider()}

    <!-- 1:1 coaching -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="vertical-align:top;padding-right:14px;width:30px;">${ICONS.coach}</td>
        <td style="vertical-align:top;">
          ${eyebrow("Want a thought partner?", EMAIL_COLORS.plum)}
          <h2 style="color:${EMAIL_COLORS.textPrimary};font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.01em;">
            Work 1:1, in real time.
          </h2>
          <p style="color:${EMAIL_COLORS.textBody};font-size:14px;line-height:1.7;margin:0 0 18px 0;">
            If something surfaced you want to keep working on with someone in real time, that&rsquo;s what 1:1 coaching is for. One person, paying full attention.
          </p>
          ${secondaryButton({ href: coachingUrl, label: "Talk to me about 1:1 \u2192" })}
        </td>
      </tr>
    </table>

    ${dataFooter(deleteUrl)}

    <!-- Personal sign-off -->
    <div style="margin-top:40px;">
      <p style="color:${EMAIL_COLORS.ochre};font-family:'Snell Roundhand','Apple Chancery','Lucida Handwriting',Georgia,cursive;font-size:36px;font-weight:400;font-style:italic;line-height:1;margin:0 0 6px 0;letter-spacing:-0.01em;">
        Stefanie
      </p>
      <p style="color:${EMAIL_COLORS.textMuted};font-size:11px;margin:0;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
        Founder, Mindcraft
      </p>
      <p style="color:${EMAIL_COLORS.textMuted};font-size:13px;font-style:italic;font-family:Georgia,'Times New Roman',serif;line-height:1.55;margin:22px 0 0 0;">
        Hit reply. This lands in my actual inbox.
      </p>
    </div>
  `;

  return emailShell({
    title: headline.replace(/<[^>]+>/g, ""),
    body: heroWithBody({ heroHtml, bodyHtml }),
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}
