ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[],
  ADD COLUMN IF NOT EXISTS team_members JSONB,
  ADD COLUMN IF NOT EXISTS responsible_first_name TEXT,
  ADD COLUMN IF NOT EXISTS responsible_last_name TEXT,
  ADD COLUMN IF NOT EXISTS responsible_role TEXT,
  ADD COLUMN IF NOT EXISTS responsible_email TEXT,
  ADD COLUMN IF NOT EXISTS responsible_phone TEXT,
  ADD COLUMN IF NOT EXISTS legal_entity_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_entity_tax_id TEXT,
  ADD COLUMN IF NOT EXISTS declares_legal_authority BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS organization_signature_name TEXT,
  ADD COLUMN IF NOT EXISTS organization_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS organization_signed_ip INET;

COMMENT ON COLUMN public.therapists.gallery_urls IS 'Public gallery of organisation images.';
COMMENT ON COLUMN public.therapists.team_members IS 'Repeatable team members for organisation plans.';
COMMENT ON COLUMN public.therapists.responsible_first_name IS 'First name of the organisation responsible person.';
COMMENT ON COLUMN public.therapists.responsible_last_name IS 'Last name of the organisation responsible person.';
COMMENT ON COLUMN public.therapists.responsible_role IS 'Role or position of the responsible person.';
COMMENT ON COLUMN public.therapists.responsible_email IS 'Email of the organisation responsible person.';
COMMENT ON COLUMN public.therapists.responsible_phone IS 'Phone of the organisation responsible person.';
COMMENT ON COLUMN public.therapists.legal_entity_name IS 'Legal entity name for organisation onboarding.';
COMMENT ON COLUMN public.therapists.legal_entity_tax_id IS 'Tax identifier for organisation onboarding.';
COMMENT ON COLUMN public.therapists.declares_legal_authority IS 'Whether the organisation representative declared legal authority.';
COMMENT ON COLUMN public.therapists.organization_signature_name IS 'Name typed by the organisation representative at submission.';
COMMENT ON COLUMN public.therapists.organization_signed_at IS 'Server-side timestamp recorded when the organisation onboarding was submitted.';
COMMENT ON COLUMN public.therapists.organization_signed_ip IS 'Server-side IP address recorded when the organisation onboarding was submitted.';
