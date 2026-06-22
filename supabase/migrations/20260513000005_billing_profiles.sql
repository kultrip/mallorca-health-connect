CREATE TABLE IF NOT EXISTS public.billing_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  legal_name TEXT,
  tax_id_type TEXT CHECK (
    tax_id_type IS NULL OR tax_id_type IN ('nif', 'nie', 'cif', 'other')
  ),
  tax_id_value TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT NOT NULL DEFAULT 'ES',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_therapist_id
  ON public.billing_profiles (therapist_id);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_stripe_customer_id
  ON public.billing_profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "billing_profiles_owner_read"
  ON public.billing_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_owner_insert"
  ON public.billing_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_owner_update"
  ON public.billing_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "billing_profiles_owner_delete"
  ON public.billing_profiles
  FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
