ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS pending_plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pending_plan_slug TEXT,
  ADD COLUMN IF NOT EXISTS stripe_setup_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_pending_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_activation_error TEXT;

CREATE INDEX IF NOT EXISTS idx_therapists_pending_plan
  ON public.therapists (pending_plan_id)
  WHERE pending_plan_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_therapists_stripe_setup_intent
  ON public.therapists (stripe_setup_intent_id)
  WHERE stripe_setup_intent_id IS NOT NULL;
