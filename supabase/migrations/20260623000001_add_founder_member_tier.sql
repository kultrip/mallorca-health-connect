-- Add founder member support to plans and therapists tables.
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS founder_price_monthly_cents INTEGER,
ADD COLUMN IF NOT EXISTS founder_stripe_price_id TEXT UNIQUE;

-- Update pricing to align with requirements:
-- Standard Profesional: 25€ (2500 cents)
-- Standard Centros: 50€ (5000 cents)
-- Founder Profesional: 15€ (1500 cents)
-- Founder Centros: 35€ (3500 cents)

UPDATE public.plans
SET 
  price_monthly_cents = 2500,
  founder_price_monthly_cents = 1500,
  founder_stripe_price_id = 'price_1TVhCGB0PmMiFfkDBt929ffT_founder' -- placeholder / configuration value
WHERE slug = 'profesional';

UPDATE public.plans
SET 
  price_monthly_cents = 5000,
  founder_price_monthly_cents = 3500,
  founder_stripe_price_id = 'price_1TVhD1B0PmMiFfkDcDzJNeZg_founder' -- placeholder / configuration value
WHERE slug = 'centros-organizadores';
