import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

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
    .select("id, client_id, program_id, status, current_day, started_at, programs(slug, name)")
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
            personalCode,
            appUrl,
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

function offrampEmailHtml(opts: {
  programName: string;
  currentDay: number;
  reason: OfframpReason;
  insightsUrl: string;
  deleteUrl: string;
  referUrl: string;
  personalCode: string;
  appUrl: string;
}): string {
  const { programName, currentDay, reason, insightsUrl, deleteUrl, referUrl, personalCode, appUrl } = opts;

  const headline = reason === "closed_early"
    ? `You closed ${escapeHtml(programName)} on day ${currentDay}.`
    : `You finished ${escapeHtml(programName)}.`;

  const openingLine = reason === "closed_early"
    ? `Closing early isn&rsquo;t quitting. It&rsquo;s a choice about what you need next. Whatever made you pause — another program, a different season, something else entirely — that&rsquo;s valid.`
    : `Thirty days is longer than it sounds. Whatever you carried in — a layoff, a PIP, a new role that felt like too much — you sat with it, wrote through it, and did the work. That matters.`;

  const insightBlurb = reason === "closed_early"
    ? `A reflection on what you did cover over the last ${currentDay} day${currentDay === 1 ? "" : "s"} — patterns, reframes, and what you might carry forward.`
    : `A long-form reflection on what shifted over the last 30 days — patterns, breakthroughs, and what&rsquo;s next.`;

  const shareText = encodeURIComponent(
    `I just did some real work with Mindcraft. It changed how I see my career transition. ${appUrl}`
  );
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
  const xShare = `https://twitter.com/intent/tweet?text=${shareText}`;

  return `
<!doctype html>
<html>
<body style="background-color:#18181c;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background-color:#26262c;border-radius:14px;padding:40px 32px;color:#f0ede6;">

    <p style="color:#c4943a;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;margin:0 0 12px 0;">
      ${reason === "closed_early" ? "Program closed" : "You made it"}
    </p>

    <h1 style="color:#f0ede6;font-size:26px;line-height:1.25;font-weight:800;margin:0 0 16px 0;letter-spacing:-0.02em;">
      ${headline}
    </h1>

    <p style="color:#d0ccc6;font-size:15px;line-height:1.65;margin:0 0 24px 0;">
      ${openingLine}
    </p>

    <div style="background-color:#333339;border:1px solid #44444c;border-radius:12px;padding:22px 24px;margin:28px 0;">
      <p style="color:#f0ede6;font-size:15px;font-weight:700;margin:0 0 6px 0;">
        Your final insights are ready
      </p>
      <p style="color:#d0ccc6;font-size:13px;line-height:1.55;margin:0 0 16px 0;">
        ${insightBlurb}
      </p>
      <a href="${insightsUrl}" style="display:inline-block;padding:12px 22px;background-color:#c4943a;color:#18181c;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">
        View your final insights →
      </a>
    </div>

    <div style="background:linear-gradient(135deg,rgba(196,148,58,0.18),rgba(196,148,58,0.04));border:1px solid rgba(196,148,58,0.35);border-radius:12px;padding:22px 24px;margin:24px 0;">
      <p style="color:#c4943a;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px 0;">
        A gift for you
      </p>
      <p style="color:#f0ede6;font-size:15px;font-weight:600;margin:0 0 10px 0;">
        20% off any future Mindcraft program
      </p>
      <p style="color:#d0ccc6;font-size:13px;line-height:1.55;margin:0 0 14px 0;">
        Your code:
      </p>
      <div style="background-color:#18181c;border:1px dashed #c4943a;border-radius:8px;padding:14px;text-align:center;margin-bottom:14px;">
        <span style="font-family:monospace;font-size:20px;font-weight:700;color:#c4943a;letter-spacing:0.08em;">
          ${escapeHtml(personalCode)}
        </span>
      </div>
      <p style="color:#a0a0a8;font-size:12px;line-height:1.5;margin:0;">
        Single-use. Works at checkout on any program page.
      </p>
    </div>

    <div style="margin:28px 0;">
      <p style="color:#f0ede6;font-size:15px;font-weight:700;margin:0 0 10px 0;">
        Know someone else in the thick of a career transition?
      </p>
      <p style="color:#d0ccc6;font-size:13px;line-height:1.55;margin:0 0 14px 0;">
        Gift a program, share your referral code, or post about Mindcraft.
      </p>
      <a href="${referUrl}" style="display:inline-block;padding:10px 18px;margin:4px 6px 4px 0;background-color:transparent;border:1.5px solid #c4943a;color:#c4943a;font-weight:600;font-size:13px;text-decoration:none;border-radius:999px;">
        Gift or refer →
      </a>
      <a href="${linkedInShare}" style="display:inline-block;padding:10px 18px;margin:4px 6px 4px 0;background-color:transparent;border:1px solid #44444c;color:#f0ede6;font-weight:600;font-size:13px;text-decoration:none;border-radius:999px;">
        Share on LinkedIn
      </a>
      <a href="${xShare}" style="display:inline-block;padding:10px 18px;margin:4px 0;background-color:transparent;border:1px solid #44444c;color:#f0ede6;font-weight:600;font-size:13px;text-decoration:none;border-radius:999px;">
        Share on X
      </a>
    </div>

    <div style="border-top:1px solid #44444c;margin-top:32px;padding-top:24px;">
      <p style="color:#a0a0a8;font-size:12px;line-height:1.65;margin:0 0 10px 0;">
        <strong style="color:#d0ccc6;">Your data is yours.</strong> We keep your journal entries,
        exercise responses, and insights so you can return to them anytime. If you&rsquo;d rather
        we didn&rsquo;t, you can request deletion from your account settings &mdash; we purge
        everything within 30 days.
      </p>
      <a href="${deleteUrl}" style="color:#a0a0a8;font-size:12px;text-decoration:underline;">
        Delete my account and data →
      </a>
    </div>

    <p style="color:#6b6b72;font-size:11px;text-align:center;margin:32px 0 0 0;">
      Sent with care by the crew at All Minds On Deck.
    </p>
  </div>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}
