import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }

    // Get user's referral code
    const { data: referral } = await supabase
      .from("referrals")
      .select("id, referral_code, created_at")
      .eq("referrer_id", user.id)
      .single();

    if (!referral) {
      return NextResponse.json({ referral: null, redemptions: [], gifts: [] });
    }

    // Get redemptions
    const { data: redemptions } = await supabase
      .from("referral_redemptions")
      .select("id, referred_email, status, redeemed_at, rewarded_at")
      .eq("referral_id", referral.id)
      .order("redeemed_at", { ascending: false });

    // Get gift codes
    const { data: gifts } = await supabase
      .from("gift_codes")
      .select("id, gift_code, program, recipient_email, status, purchased_at, redeemed_at")
      .eq("gifter_id", user.id)
      .order("purchased_at", { ascending: false });

    return NextResponse.json({
      referral: {
        code: referral.referral_code,
        created_at: referral.created_at,
      },
      redemptions: redemptions || [],
      gifts: gifts || [],
    });
  } catch (error) {
    console.error("Referral status error:", error);
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}
