import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Create the product
  const product = await stripe.products.create({
    name: "Mindcraft — Monthly Coaching",
    description:
      "Your daily coaching companion. Personalised exercises, AI-powered reflections, and pattern recognition.",
  });

  console.log(`Product created: ${product.id}`);

  // Create the $75/month recurring price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 7500, // $75.00
    currency: "usd",
    recurring: { interval: "month" },
  });

  console.log(`Price created: ${price.id}`);
  console.log(`\nAdd this to your .env.local and Vercel env vars:`);
  console.log(`STRIPE_PRICE_ID=${price.id}`);
}

main().catch(console.error);
