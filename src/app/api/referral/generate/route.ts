import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Standard product IDs (eligible for 20% referral discount — NOT sliding scale)
const STANDARD_PRODUCTS = [
  "prod_U950fARo03dl1l", // Parachute standard $49
  "prod_UD4mxe6Dg0FoNE", // Basecamp standard $49
  "prod_UD4mJMz3x4luYO", // Jetstream standard $49
];

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MC-${code}`;
}

export async function POST() {
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
      return NextResponse.json({ error: "Please sign in to generate a referral code." }, { status: 401 });
    }

    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from("referrals")
      .select("id, referral_code")
      .eq("referrer_id", user.id)
      .single();

    if (existing) {
      return NextResponse.json({ code: existing.referral_code });
    }

    const code = generateCode();

    // Create Stripe coupon (20% off, once, for standard products only)
    const coupon = await stripe.coupons.create({
      percent_off: 20,
      duration: "once",
      name: `Referral: ${code}`,
      applies_to: { products: STANDARD_PRODUCTS },
    });

    // Create Stripe promotion code
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      metadata: {
        type: "user_referral",
        referrer_id: user.id,
      },
    });

    // Save to DB
    await supabase.from("referrals").insert({
      referrer_id: user.id,
      referral_code: code,
      stripe_promo_id: promoCode.id,
      stripe_coupon_id: coupon.id,
    });

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Referral generate error:", error);
    return NextResponse.json({ error: "Failed to generate referral code." }, { status: 500 });
  }
}
