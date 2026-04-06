import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find redemptions eligible for reward (redeemed 7+ days ago, not yet rewarded)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: eligible } = await supabase
      .from("referral_redemptions")
      .select("id, referral_id, referred_email, referrals(referrer_id)")
      .eq("status", "redeemed")
      .lte("redeemed_at", sevenDaysAgo);

    if (!eligible || eligible.length === 0) {
      return NextResponse.json({ rewarded: 0 });
    }

    const results: string[] = [];

    for (const redemption of eligible) {
      const referrerId = (redemption.referrals as unknown as { referrer_id: string })?.referrer_id;
      if (!referrerId) continue;

      // Get referrer email
      const { data: { user: referrer } } = await supabase.auth.admin.getUserById(referrerId);
      if (!referrer?.email) continue;

      // Send reward via Tremendous (if configured)
      const tremendousKey = process.env.TREMENDOUS_API_KEY;
      const fundingSource = process.env.TREMENDOUS_FUNDING_SOURCE_ID;

      if (tremendousKey && fundingSource) {
        try {
          const res = await fetch("https://www.tremendous.com/api/v2/orders", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${tremendousKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment: { funding_source_id: fundingSource },
              rewards: [{
                value: { denomination: 10, currency_code: "USD" },
                delivery: { method: "EMAIL" },
                recipient: { email: referrer.email, name: "Mindcraft Referrer" },
                products: ["amazon.com"],
              }],
            }),
          });

          if (!res.ok) {
            console.error("Tremendous error:", await res.text());
            continue;
          }
        } catch (err) {
          console.error("Tremendous API error:", err);
          continue;
        }
      }

      // Mark as rewarded
      await supabase
        .from("referral_redemptions")
        .update({ status: "rewarded", rewarded_at: new Date().toISOString() })
        .eq("id", redemption.id);

      // Notify referrer
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Mindcraft <noreply@allmindsondeck.org>",
          to: referrer.email,
          subject: "Your $10 Amazon gift card is on its way",
          html: `
            <div style="background-color: #18181c; padding: 40px 20px; font-family: system-ui, sans-serif;">
              <div style="max-width: 560px; margin: 0 auto; background-color: #2a2a30; border-radius: 12px; padding: 40px 32px;">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                  Someone you referred just completed their first week on Mindcraft.
                </p>
                <p style="color: #a0a0a8; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">
                  Your $10 Amazon gift card is being sent to this email. Check your inbox (it comes from Tremendous).
                </p>
                <p style="color: #a0a0a8; font-size: 14px; line-height: 1.6; margin: 0;">
                  Thank you for sharing Mindcraft with someone who needed it.
                </p>
              </div>
            </div>
          `,
        }).catch(() => {});
      }

      // Notify admin
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Mindcraft <noreply@allmindsondeck.org>",
          to: "crew@allmindsondeck.com",
          subject: `Referral reward sent — ${referrer.email}`,
          html: `<p>$10 Amazon gift card sent to ${referrer.email} for referring ${redemption.referred_email}.</p>`,
        }).catch(() => {});
      }

      results.push(referrer.email);
    }

    return NextResponse.json({ rewarded: results.length, emails: results });
  } catch (error) {
    console.error("Referral rewards error:", error);
    return NextResponse.json({ error: "Failed to process rewards." }, { status: 500 });
  }
}
