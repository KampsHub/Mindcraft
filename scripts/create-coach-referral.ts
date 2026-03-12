/**
 * Create a coach-specific referral promo code in Stripe.
 *
 * Usage:
 *   npx tsx scripts/create-coach-referral.ts \
 *     --coach-id <supabase-coach-uuid> \
 *     --code COACH-SARAH \
 *     --percent-off 20
 *
 * This creates (or reuses) a "Coach Referral" coupon and generates
 * a unique promotion code for the coach. The coach's Supabase ID is
 * stored in the promotion code metadata so the webhook can link clients
 * to the referring coach automatically.
 */

import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const COUPON_NAME = "Coach Referral";

async function main() {
  const args = process.argv.slice(2);
  const coachId = getArg(args, "--coach-id");
  const code = getArg(args, "--code");
  const percentOff = Number(getArg(args, "--percent-off") || "20");

  if (!coachId || !code) {
    console.error(
      "Usage: npx tsx scripts/create-coach-referral.ts --coach-id <uuid> --code COACH-SARAH [--percent-off 20]"
    );
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // 1. Find or create the "Coach Referral" coupon
  let coupon: Stripe.Coupon | undefined;

  const coupons = await stripe.coupons.list({ limit: 100 });
  coupon = coupons.data.find((c) => c.name === COUPON_NAME && c.percent_off === percentOff);

  if (!coupon) {
    coupon = await stripe.coupons.create({
      name: COUPON_NAME,
      percent_off: percentOff,
      duration: "repeating",
      duration_in_months: 3, // discount lasts 3 months
      currency: "usd",
    });
    console.log(`Created coupon "${COUPON_NAME}" (${percentOff}% off for 3 months): ${coupon.id}`);
  } else {
    console.log(`Reusing coupon "${COUPON_NAME}": ${coupon.id}`);
  }

  // 2. Create the promotion code for this coach
  const promoCode = await stripe.promotionCodes.create({
    coupon: coupon.id,
    code: code.toUpperCase(),
    metadata: {
      coach_id: coachId,
      type: "coach_referral",
    },
  });

  console.log(`\nPromo code created: ${promoCode.code}`);
  console.log(`  → ${percentOff}% off for 3 months`);
  console.log(`  → Linked to coach: ${coachId}`);
  console.log(`  → Stripe promo ID: ${promoCode.id}`);
  console.log(`\nGive "${promoCode.code}" to the coach — their clients enter it at checkout.`);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : undefined;
}

main().catch(console.error);
