-- Migration to support AI-powered Professional Discovery (Phase 1)
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS extracted_therapies TEXT[],
  ADD COLUMN IF NOT EXISTS extracted_municipality TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours TEXT,
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS imported_by_ai BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS crm_status TEXT NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS first_contact_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS import_metadata JSONB DEFAULT '[]'::jsonb;

-- Add comments for clarity and documentation
COMMENT ON COLUMN public.therapists.business_name IS 'Comercial/business name if different from the legal/full name.';
COMMENT ON COLUMN public.therapists.description IS 'Extracted raw description or summary from the discovery pipeline.';
COMMENT ON COLUMN public.therapists.postal_code IS 'Postal code of the professional practice address.';
COMMENT ON COLUMN public.therapists.profession IS 'Main profession or core discipline of the lead.';
COMMENT ON COLUMN public.therapists.extracted_therapies IS 'Array of raw therapies extracted from the maps or website prior to taxonomy mapping.';
COMMENT ON COLUMN public.therapists.extracted_municipality IS 'Raw municipality name extracted from the pipeline prior to mapping.';
COMMENT ON COLUMN public.therapists.profile_image_url IS 'Imported external profile/cover image URL.';
COMMENT ON COLUMN public.therapists.opening_hours IS 'Business opening hours as extracted from GMaps or the website.';
COMMENT ON COLUMN public.therapists.is_claimed IS 'Indicates if the therapist profile has been claimed by the actual professional.';
COMMENT ON COLUMN public.therapists.verification_date IS 'The date/time when the administrator verified the profile claim.';
COMMENT ON COLUMN public.therapists.source IS 'The extraction source (e.g. google_maps, instagram, website).';
COMMENT ON COLUMN public.therapists.source_url IS 'The source page or Google Maps direct reference URL.';
COMMENT ON COLUMN public.therapists.imported_by_ai IS 'Indicates whether this record was auto-created through the AI ingestion pipeline.';
COMMENT ON COLUMN public.therapists.crm_status IS 'CRM status tracking the pipeline state (DRAFT, PUBLISHED, CONTACTED, WAITING_RESPONSE, CLAIMED, VERIFIED, REJECTED).';
COMMENT ON COLUMN public.therapists.first_contact_date IS 'Date of first contact with the lead.';
COMMENT ON COLUMN public.therapists.last_contact_date IS 'Date of the most recent interaction with the lead.';
COMMENT ON COLUMN public.therapists.owner_user_id IS 'References the auth.users ID of the therapist after profile claim ownership is transferred.';
COMMENT ON COLUMN public.therapists.internal_notes IS 'Internal administrative or CRM remarks.';
COMMENT ON COLUMN public.therapists.import_metadata IS 'JSONB array recording individual field level audit history (source, timestamp, confidence).';
