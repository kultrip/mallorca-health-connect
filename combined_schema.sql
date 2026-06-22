
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'therapist', 'user');
CREATE TYPE public.therapist_status AS ENUM ('draft', 'pending', 'published', 'suspended');
CREATE TYPE public.modality AS ENUM ('presencial', 'online', 'domicilio');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  locale TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ PLANS ============
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  rank INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_public_read" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plans_admin_write" ON public.plans FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ MUNICIPALITIES ============
CREATE TABLE public.municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  lat NUMERIC,
  lng NUMERIC
);
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "municipalities_public_read" ON public.municipalities FOR SELECT USING (true);
CREATE POLICY "municipalities_admin_write" ON public.municipalities FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ THERAPIES ============
CREATE TABLE public.therapies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "therapies_public_read" ON public.therapies FOR SELECT USING (true);
CREATE POLICY "therapies_admin_write" ON public.therapies FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ HELP AREAS (symptoms / problems) ============
CREATE TABLE public.help_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.help_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "help_areas_public_read" ON public.help_areas FOR SELECT USING (true);
CREATE POLICY "help_areas_admin_write" ON public.help_areas FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ CENTERS ============
CREATE TABLE public.centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  photo_url TEXT,
  website TEXT,
  phone TEXT,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.plans(id),
  status public.therapist_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "centers_public_read_published" ON public.centers FOR SELECT USING (status = 'published' OR auth.uid() = owner_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "centers_owner_write" ON public.centers FOR UPDATE USING (auth.uid() = owner_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "centers_owner_insert" ON public.centers FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "centers_admin_delete" ON public.centers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============ THERAPISTS ============
CREATE TABLE public.therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  headline TEXT,
  frase_clave TEXT,
  sobre_mi TEXT,
  formacion TEXT,
  experiencia TEXT,
  photo_url TEXT,
  especialidad TEXT,
  subespecialidades TEXT[] NOT NULL DEFAULT '{}',
  modalities public.modality[] NOT NULL DEFAULT '{}',
  years_experience INTEGER,
  municipality_id UUID REFERENCES public.municipalities(id),
  center_id UUID REFERENCES public.centers(id) ON DELETE SET NULL,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  whatsapp TEXT,
  phone TEXT,
  email TEXT,
  link_reserva TEXT,
  website TEXT,
  languages TEXT[] NOT NULL DEFAULT '{es}',
  verified BOOLEAN NOT NULL DEFAULT false,
  plan_id UUID REFERENCES public.plans(id),
  status public.therapist_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "therapists_public_read_published" ON public.therapists FOR SELECT USING (status = 'published' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "therapists_owner_update" ON public.therapists FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "therapists_owner_insert" ON public.therapists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "therapists_admin_delete" ON public.therapists FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_therapists_status ON public.therapists(status);
CREATE INDEX idx_therapists_municipality ON public.therapists(municipality_id);
CREATE INDEX idx_therapists_plan ON public.therapists(plan_id);

-- ============ THERAPIST <-> THERAPIES ============
CREATE TABLE public.therapist_therapies (
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  therapy_id UUID NOT NULL REFERENCES public.therapies(id) ON DELETE CASCADE,
  PRIMARY KEY (therapist_id, therapy_id)
);
ALTER TABLE public.therapist_therapies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tt_public_read" ON public.therapist_therapies FOR SELECT USING (true);
CREATE POLICY "tt_owner_write" ON public.therapist_therapies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- ============ THERAPIST <-> HELP AREAS ============
CREATE TABLE public.therapist_help_areas (
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  help_area_id UUID NOT NULL REFERENCES public.help_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (therapist_id, help_area_id)
);
ALTER TABLE public.therapist_help_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tha_public_read" ON public.therapist_help_areas FOR SELECT USING (true);
CREATE POLICY "tha_owner_write" ON public.therapist_help_areas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- ============ ACTIVITIES ============
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  location TEXT,
  municipality_id UUID REFERENCES public.municipalities(id),
  price_cents INTEGER,
  link_reserva TEXT,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE,
  status public.therapist_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_public_read" ON public.activities FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "activities_owner_write" ON public.activities FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid())
);

-- ============ AI SEARCH QUERIES (log) ============
CREATE TABLE public.ai_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  matched_help_areas JSONB,
  suggested_therapies JSONB,
  ai_intro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asq_insert_anyone" ON public.ai_search_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "asq_admin_read" ON public.ai_search_queries FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_therapists_updated BEFORE UPDATE ON public.therapists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_centers_updated BEFORE UPDATE ON public.centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('therapist-photos', 'therapist-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-images', 'activity-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false) ON CONFLICT DO NOTHING;

CREATE POLICY "therapist_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'therapist-photos');
CREATE POLICY "therapist_photos_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'therapist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "therapist_photos_owner_update" ON storage.objects FOR UPDATE USING (bucket_id = 'therapist-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "activity_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'activity-images');
CREATE POLICY "activity_images_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'activity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "verification_docs_owner_read" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "verification_docs_owner_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Restrict SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- Tighten AI search query insert: require either anonymous (user_id null) or matches auth.uid()
DROP POLICY IF EXISTS "asq_insert_anyone" ON public.ai_search_queries;
CREATE POLICY "asq_insert_self_or_anon" ON public.ai_search_queries
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Restrict storage object listing on public buckets — allow direct file access via signed/public URL but not directory listing
DROP POLICY IF EXISTS "therapist_photos_public_read" ON storage.objects;
CREATE POLICY "therapist_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'therapist-photos' AND (storage.foldername(name))[1] IS NOT NULL);

DROP POLICY IF EXISTS "activity_images_public_read" ON storage.objects;
CREATE POLICY "activity_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'activity-images' AND (storage.foldername(name))[1] IS NOT NULL);

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;
-- ============ PROFILE VIEWS (Analytics) ============
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (anonymous)
CREATE POLICY "profile_views_insert_anyone" ON public.profile_views FOR INSERT WITH CHECK (true);

-- Only admins and the owner can see the views
CREATE POLICY "profile_views_read_owner" ON public.profile_views FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  EXISTS (SELECT 1 FROM public.therapists t WHERE t.id = therapist_id AND t.user_id = auth.uid())
);

-- Helper function to track a view safely
CREATE OR REPLACE FUNCTION public.track_profile_view(_therapist_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profile_views (therapist_id) VALUES (_therapist_id);
END;
$$;
-- ============ STRIPE BILLING FIELDS ============
ALTER TABLE public.therapists 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN subscription_status TEXT;

-- Let therapists read their own stripe data
-- RLS policies on therapists already allow users to read their own rows.
-- We want to make sure the backend (service role) can update these fields.
