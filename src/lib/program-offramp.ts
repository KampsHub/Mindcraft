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
  const { programName, currentDay, reason, insightsUrl, deleteUrl, referUrl, shareUrl, personalCode, appUrl, coachingUrl } = opts;

  const headline = reason === "closed_early"
    ? `You closed ${escapeHtml(programName)} on day ${currentDay}.`
    : `You finished ${escapeHtml(programName)}.`;

  const openingLine = reason === "closed_early"
    ? `Closing early isn&rsquo;t quitting. It&rsquo;s a choice about what you need next. Whatever made you pause &mdash; another program, a different season, something else entirely &mdash; that&rsquo;s valid.`
    : `Thirty days is longer than it sounds. Whatever you carried in, you sat with it.`;

  const reflectionBlurb = reason === "closed_early"
    ? `A look at the patterns across your ${currentDay} day${currentDay === 1 ? "" : "s"} &mdash; what shifted, what you may have moved past too quickly, and what to watch for next.`
    : `A look at the patterns across your 30 days &mdash; what shifted, what you may have moved past too quickly, and what to watch for next.`;

  const tagLabel = reason === "closed_early" ? "Program closed" : "You made it";

  // ── Visual ornaments ──
  const dividerOrnament = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="height:1px;width:60px;background:linear-gradient(90deg,transparent,rgba(196,148,58,0.45));font-size:0;line-height:0;">&nbsp;</td>
              <td style="padding:0 14px;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background-color:#c4943a;"></span>
              </td>
              <td style="height:1px;width:60px;background:linear-gradient(90deg,rgba(196,148,58,0.45),transparent);font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  // Section eyebrow tag with icon dot
  const eyebrow = (label: string, color = "#c4943a") =>
    `<p style="color:${color};font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 12px 0;">
      <span style="display:inline-block;width:5px;height:5px;border-radius:50%;background-color:${color};vertical-align:middle;margin-right:8px;margin-top:-2px;"></span>${label}
    </p>`;

  // Inline SVG icons (small, monochrome ochre)
  const iconReflection = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4943a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/><circle cx="12" cy="12" r="3"/></svg>`;
  const iconGift = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4943a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
  const iconAsk = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4943a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  const iconCoach = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B9AAD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;

  // Hero stat — only for completed (not closed_early)
  const heroStat = reason === "closed_early"
    ? ""
    : `
      <div style="text-align:center;margin:0 0 28px 0;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:64px;font-weight:800;color:#c4943a;line-height:1;letter-spacing:-0.04em;">
          30
        </div>
        <p style="color:#a0a0a8;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:6px 0 0 0;">
          days &middot; done
        </p>
      </div>
    `;

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${headline}</title>
</head>
<body style="background-color:#18181c;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,sans-serif;">

  <!-- ── Brand mark above the card ── -->
  <div style="max-width:600px;margin:0 auto 16px;text-align:center;">
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:13px;font-weight:600;color:#a0a0a8;letter-spacing:0.04em;">
      mindcraft
    </span>
  </div>

  <div style="max-width:600px;margin:0 auto;background-color:#26262c;border-radius:20px;padding:0;color:#f0ede6;box-shadow:0 40px 100px rgba(0,0,0,0.55),0 0 0 1px rgba(196,148,58,0.08);overflow:hidden;">

    <!-- ── HERO BAND (slightly different background) ── -->
    <div style="background:radial-gradient(ellipse at top,rgba(196,148,58,0.10),transparent 70%),#2a2a30;padding:56px 40px 44px;text-align:center;border-bottom:1px solid rgba(196,148,58,0.12);">

      ${heroStat}

      <p style="color:#c4943a;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin:0 0 14px 0;">
        ${tagLabel}
      </p>

      <h1 style="color:#f0ede6;font-size:32px;line-height:1.1;font-weight:800;margin:0 0 20px 0;letter-spacing:-0.03em;font-family:Georgia,'Times New Roman',serif;">
        ${headline}
      </h1>

      <p style="color:#d0ccc6;font-size:16px;line-height:1.7;margin:0 auto;max-width:440px;">
        ${openingLine}
      </p>
    </div>

    <!-- ── BODY ── -->
    <div style="padding:48px 40px 40px;">

      <!-- ── Reflection ── -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;padding-right:14px;width:30px;">
            ${iconReflection}
          </td>
          <td style="vertical-align:top;">
            ${eyebrow("The work, looked at")}
            <h2 style="color:#f0ede6;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.015em;font-family:Georgia,'Times New Roman',serif;">
              Your final reflection is ready.
            </h2>
            <p style="color:#d0ccc6;font-size:14px;line-height:1.7;margin:0 0 20px 0;">
              ${reflectionBlurb}
            </p>
            <a href="${insightsUrl}" style="display:inline-block;padding:13px 26px;background-color:#c4943a;color:#18181c;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;letter-spacing:0.01em;">
              Read your reflection &rarr;
            </a>
          </td>
        </tr>
      </table>

      ${dividerOrnament}

      <!-- ── Personal gift code (ticket-stub treatment) ── -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;padding-right:14px;width:30px;">
            ${iconGift}
          </td>
          <td style="vertical-align:top;">
            ${eyebrow("A small thing")}
            <h2 style="color:#f0ede6;font-size:21px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.015em;font-family:Georgia,'Times New Roman',serif;">
              20% off your next program.
            </h2>
            <p style="color:#d0ccc6;font-size:14px;line-height:1.7;margin:0 0 20px 0;">
              If you come back for another program, this is yours.
            </p>
          </td>
        </tr>
      </table>

      <!-- Ticket stub — full width under the icon row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 14px 0;">
        <tr>
          <td style="background:linear-gradient(135deg,rgba(196,148,58,0.18),rgba(196,148,58,0.04));border:1.5px dashed rgba(196,148,58,0.55);border-radius:14px;padding:24px 28px;text-align:center;">
            <p style="color:#a0a0a8;font-size:10px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;margin:0 0 10px 0;">
              Your code
            </p>
            <p style="font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace;font-size:26px;font-weight:700;color:#c4943a;letter-spacing:0.16em;margin:0 0 8px 0;">
              ${escapeHtml(personalCode)}
            </p>
            <p style="color:#6b6b72;font-size:11px;line-height:1.5;margin:0;">
              20% off &middot; single-use &middot; any program
            </p>
          </td>
        </tr>
      </table>

      <p style="color:#6b6b72;font-size:11px;line-height:1.55;margin:0;text-align:center;">
        If it doesn&rsquo;t work, email <a href="mailto:crew@allmindsondeck.com" style="color:#a0a0a8;text-decoration:underline;">crew@allmindsondeck.com</a>.
      </p>

      ${dividerOrnament}

      <!-- ── A real ask, from me — pull-quote treatment ── -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;padding-right:14px;width:30px;">
            ${iconAsk}
          </td>
          <td style="vertical-align:top;">
            ${eyebrow("A real ask, from me")}
            <h2 style="color:#f0ede6;font-size:24px;font-weight:700;line-height:1.25;margin:0 0 18px 0;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;">
              Would you tell one person what changed?
            </h2>
          </td>
        </tr>
      </table>

      <!-- Pull quote -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px 0;">
        <tr>
          <td style="border-left:3px solid #c4943a;padding:8px 0 8px 20px;">
            <p style="color:#d0ccc6;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-style:italic;line-height:1.6;margin:0;">
              Mindcraft is still small. Small enough that one honest sentence from you can be the reason someone else trusts us with a tough stretch of their career.
            </p>
          </td>
        </tr>
      </table>

      <!-- Three options as a cleaner numbered list -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
        <tr>
          <td style="padding:14px 0;border-top:1px solid rgba(196,148,58,0.18);">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;width:32px;color:#c4943a;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;font-style:italic;">01</td>
                <td style="vertical-align:top;">
                  <p style="color:#f0ede6;font-size:14px;line-height:1.55;margin:0;font-weight:600;">
                    Send a friend your referral code
                  </p>
                  <p style="color:#a0a0a8;font-size:13px;line-height:1.55;margin:4px 0 0 0;">
                    They get 20% off, you get $10 Amazon.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0;border-top:1px solid rgba(196,148,58,0.18);">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;width:32px;color:#c4943a;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;font-style:italic;">02</td>
                <td style="vertical-align:top;">
                  <p style="color:#f0ede6;font-size:14px;line-height:1.55;margin:0;font-weight:600;">
                    Post on LinkedIn or anywhere you&rsquo;re seen
                  </p>
                  <p style="color:#a0a0a8;font-size:13px;line-height:1.55;margin:4px 0 0 0;">
                    A sentence is enough.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 0;border-top:1px solid rgba(196,148,58,0.18);border-bottom:1px solid rgba(196,148,58,0.18);">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="vertical-align:top;width:32px;color:#c4943a;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:700;font-style:italic;">03</td>
                <td style="vertical-align:top;">
                  <p style="color:#f0ede6;font-size:14px;line-height:1.55;margin:0;font-weight:600;">
                    Write a quote for the site
                  </p>
                  <p style="color:#a0a0a8;font-size:13px;line-height:1.55;margin:4px 0 0 0;">
                    Two minutes.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <a href="${shareUrl}" style="display:inline-block;padding:14px 30px;background-color:#c4943a;color:#18181c;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;letter-spacing:0.01em;">
        Share your story &rarr;
      </a>

      ${dividerOrnament}

      <!-- ── 1:1 coaching ── -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="vertical-align:top;padding-right:14px;width:30px;">
            ${iconCoach}
          </td>
          <td style="vertical-align:top;">
            ${eyebrow("Want a thought partner?", "#7B9AAD")}
            <h2 style="color:#f0ede6;font-size:18px;font-weight:700;line-height:1.3;margin:0 0 10px 0;letter-spacing:-0.01em;font-family:Georgia,'Times New Roman',serif;">
              Work 1:1, in real time.
            </h2>
            <p style="color:#d0ccc6;font-size:14px;line-height:1.7;margin:0 0 18px 0;">
              If something surfaced you want to keep working on with someone in real time, that&rsquo;s what 1:1 coaching is for. One person, paying full attention.
            </p>
            <a href="${coachingUrl}" style="display:inline-block;padding:11px 22px;background-color:transparent;border:1.5px solid #7B9AAD;color:#7B9AAD;font-weight:700;font-size:13px;text-decoration:none;border-radius:999px;">
              Talk to me about 1:1 &rarr;
            </a>
          </td>
        </tr>
      </table>

      <!-- ── Footer (data + sign-off) ── -->
      <div style="border-top:1px solid #44444c;margin-top:48px;padding-top:28px;">
        <p style="color:#a0a0a8;font-size:12px;line-height:1.7;margin:0 0 10px 0;">
          <strong style="color:#d0ccc6;">Your data is yours.</strong> We keep your journal entries, exercise responses, and reflection so you can come back to them anytime. If you&rsquo;d rather we didn&rsquo;t, you can request deletion from your account settings &mdash; we purge everything within 30 days.
        </p>
        <a href="${deleteUrl}" style="color:#a0a0a8;font-size:12px;text-decoration:underline;">
          Delete my account and data &rarr;
        </a>
      </div>

      <!-- ── Personal sign-off ── -->
      <div style="margin-top:40px;">
        <!-- Hand-drawn signature flourish -->
        <p style="color:#c4943a;font-family:'Snell Roundhand','Apple Chancery','Lucida Handwriting',Georgia,cursive;font-size:36px;font-weight:400;font-style:italic;line-height:1;margin:0 0 6px 0;letter-spacing:-0.01em;">
          Stefanie
        </p>
        <p style="color:#a0a0a8;font-size:11px;margin:0;letter-spacing:0.06em;text-transform:uppercase;font-weight:600;">
          Founder, Mindcraft
        </p>
        <p style="color:#6b6b72;font-size:13px;font-style:italic;font-family:Georgia,'Times New Roman',serif;line-height:1.55;margin:22px 0 0 0;">
          Hit reply. This lands in my actual inbox.
        </p>
      </div>

    </div>
  </div>

  <!-- ── Outer footer (subtle, plain text) ── -->
  <p style="color:#6b6b72;font-size:11px;text-align:center;margin:24px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
    Mindcraft by All Minds on Deck LLC
  </p>
</body>
</html>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}
