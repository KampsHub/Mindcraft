import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  referralRewardRecipientHtml,
  referralRewardRecipientSubject,
  referralRewardAdminHtml,
  referralRewardAdminSubject,
  referralRewardFrom,
} from "@/lib/emails/referral-reward";

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
          from: referralRewardFrom,
          to: referrer.email,
          subject: referralRewardRecipientSubject(),
          html: referralRewardRecipientHtml(),
        }).catch(() => {});
      }

      // Notify admin
      if (resendKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        const adminOpts = {
          referrerEmail: referrer.email,
          referredEmail: redemption.referred_email || "(unknown)",
        };
        await resend.emails.send({
          from: referralRewardFrom,
          to: "crew@allmindsondeck.com",
          subject: referralRewardAdminSubject(adminOpts),
          html: referralRewardAdminHtml(adminOpts),
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
