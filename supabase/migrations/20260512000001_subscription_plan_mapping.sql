-- ============ STRIPE PLAN MAPPING ============
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS billing_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_interval TEXT NOT NULL DEFAULT 'month';

CREATE INDEX IF NOT EXISTS idx_plans_billing_enabled
ON public.plans (billing_enabled, rank);

CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id
ON public.plans (stripe_price_id)
WHERE stripe_price_id IS NOT NULL;

INSERT INTO public.plans (slug, name, price_monthly_cents, description, features, rank, billing_enabled, billing_interval)
VALUES
  (
    'presencia',
    'Presencia',
    0,
    'Perfil verificado gratuito dentro del ecosistema Mallorca Holistica.',
    '{"direct_contact": false, "activities": false}'::jsonb,
    10,
    false,
    'month'
  ),
  (
    'profesional',
    'Profesional',
    2900,
    'Plan para profesionales verificados que quieren mostrar contacto directo y enlaces de reserva.',
    '{"direct_contact": true, "activities": false}'::jsonb,
    20,
    true,
    'month'
  ),
  (
    'centros-organizadores',
    'Centros & Organizadores',
    5900,
    'Plan para centros y organizadores verificados con visibilidad avanzada y actividades.',
    '{"direct_contact": true, "activities": true}'::jsonb,
    30,
    true,
    'month'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  rank = EXCLUDED.rank,
  billing_enabled = EXCLUDED.billing_enabled,
  billing_interval = EXCLUDED.billing_interval;

UPDATE public.plans
SET stripe_price_id = 'price_1TVhCGB0PmMiFfkDBt929ffT'
WHERE slug = 'profesional';

UPDATE public.plans
SET stripe_price_id = 'price_1TVhD1B0PmMiFfkDcDzJNeZg'
WHERE slug = 'centros-organizadores';
