-- ============ STRIPE BILLING FIELDS ============
ALTER TABLE public.therapists 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN subscription_status TEXT;

-- Let therapists read their own stripe data
-- RLS policies on therapists already allow users to read their own rows.
-- We want to make sure the backend (service role) can update these fields.
