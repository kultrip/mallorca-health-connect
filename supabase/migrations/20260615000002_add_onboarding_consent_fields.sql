ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS accepted_privacy_policy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_terms_of_use BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_publication BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.therapists.accepted_privacy_policy IS 'Indica si la persona aceptó la política de privacidad durante el onboarding.';
COMMENT ON COLUMN public.therapists.accepted_terms_of_use IS 'Indica si la persona aceptó las condiciones de uso durante el onboarding.';
COMMENT ON COLUMN public.therapists.accepted_publication IS 'Indica si la persona autorizó la publicación de su perfil durante el onboarding.';
