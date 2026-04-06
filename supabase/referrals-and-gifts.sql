-- Referral and gift code tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,              -- auth.users id of person who generated the code
  referral_code text NOT NULL UNIQUE,     -- e.g. "STEF-K7X2"
  stripe_promo_id text,                   -- Stripe promotion code ID
  stripe_coupon_id text,                  -- Stripe coupon ID (20% off)
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.referral_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES referrals(id),
  referred_email text,                    -- email of person who used the code
  referred_user_id uuid,                  -- their auth.users id (set on checkout)
  stripe_session_id text,                 -- checkout session that used the code
  status text NOT NULL DEFAULT 'redeemed' CHECK (status IN ('redeemed', 'eligible', 'rewarded', 'refunded', 'cancelled')),
  redeemed_at timestamptz DEFAULT now(),  -- when they paid
  eligible_at timestamptz,                -- redeemed_at + 7 days
  rewarded_at timestamptz,                -- when gift card was sent
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gift_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gifter_id uuid,                         -- auth.users id (nullable if unauthenticated)
  gifter_email text NOT NULL,
  gift_code text NOT NULL UNIQUE,         -- single-use 100% off code
  stripe_promo_id text,                   -- Stripe promotion code ID
  stripe_session_id text,                 -- checkout session where gifter paid
  program text NOT NULL,                  -- parachute, jetstream, basecamp
  recipient_email text,                   -- set when redeemed
  recipient_user_id uuid,                 -- set when redeemed
  status text NOT NULL DEFAULT 'purchased' CHECK (status IN ('purchased', 'redeemed')),
  purchased_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own referrals" ON referrals FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "Service role full" ON referrals FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full" ON referral_redemptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Referrers see own redemptions" ON referral_redemptions FOR SELECT
  USING (referral_id IN (SELECT id FROM referrals WHERE referrer_id = auth.uid()));

CREATE POLICY "Gifters see own gifts" ON gift_codes FOR SELECT USING (gifter_id = auth.uid());
CREATE POLICY "Service role full" ON gift_codes FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals (referral_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON referral_redemptions (status, redeemed_at);
CREATE INDEX IF NOT EXISTS idx_gift_codes_code ON gift_codes (gift_code);
CREATE INDEX IF NOT EXISTS idx_gift_codes_status ON gift_codes (status);
