CREATE TABLE IF NOT EXISTS public.founder_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp TEXT NOT NULL,
  normalized_whatsapp TEXT NOT NULL,
  invite_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  invited_name TEXT,
  invited_email TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.normalize_founder_whatsapp(input_value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  cleaned TEXT;
  digits TEXT;
  has_explicit_country_code BOOLEAN;
BEGIN
  cleaned := regexp_replace(trim(coalesce(input_value, '')), '[^\d+]', '', 'g');

  IF left(cleaned, 2) = '00' THEN
    cleaned := '+' || substring(cleaned from 3);
  END IF;

  has_explicit_country_code := left(cleaned, 1) = '+';
  digits := regexp_replace(cleaned, '\D', '', 'g');

  IF digits = '' THEN
    RETURN '';
  END IF;

  IF NOT has_explicit_country_code AND length(digits) = 9 THEN
    RETURN '34' || digits;
  END IF;

  RETURN digits;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_founder_invite_normalized_whatsapp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.normalized_whatsapp := public.normalize_founder_whatsapp(NEW.whatsapp);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_founder_invites_normalize_whatsapp ON public.founder_invites;
CREATE TRIGGER trg_founder_invites_normalize_whatsapp
  BEFORE INSERT OR UPDATE OF whatsapp ON public.founder_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_founder_invite_normalized_whatsapp();

CREATE UNIQUE INDEX IF NOT EXISTS founder_invites_invite_token_key
  ON public.founder_invites (invite_token);

CREATE UNIQUE INDEX IF NOT EXISTS founder_invites_unused_whatsapp_key
  ON public.founder_invites (normalized_whatsapp)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_founder_invites_used_by_user_id
  ON public.founder_invites (used_by_user_id)
  WHERE used_by_user_id IS NOT NULL;

ALTER TABLE public.founder_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_invites_admin_read" ON public.founder_invites;
CREATE POLICY "founder_invites_admin_read"
  ON public.founder_invites
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "founder_invites_admin_insert" ON public.founder_invites;
CREATE POLICY "founder_invites_admin_insert"
  ON public.founder_invites
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "founder_invites_admin_update" ON public.founder_invites;
CREATE POLICY "founder_invites_admin_update"
  ON public.founder_invites
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "founder_invites_admin_delete" ON public.founder_invites;
CREATE POLICY "founder_invites_admin_delete"
  ON public.founder_invites
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS trg_founder_invites_updated ON public.founder_invites;
CREATE TRIGGER trg_founder_invites_updated
  BEFORE UPDATE ON public.founder_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.founder_invites IS
  'Single-use founder invitations keyed by normalized WhatsApp number.';

COMMENT ON COLUMN public.founder_invites.normalized_whatsapp IS
  'Digits-only normalized WhatsApp number used for founder invite matching.';
