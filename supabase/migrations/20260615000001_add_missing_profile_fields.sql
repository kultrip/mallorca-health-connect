BEGIN;

ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS professional_name TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT[],
  ADD COLUMN IF NOT EXISTS accompaniment_modalities TEXT[],
  ADD COLUMN IF NOT EXISTS session_modalities TEXT[],
  ADD COLUMN IF NOT EXISTS home_visit_radius TEXT,
  ADD COLUMN IF NOT EXISTS center_name TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS approach_text TEXT,
  ADD COLUMN IF NOT EXISTS differentiator_text TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS calendly_url TEXT,
  ADD COLUMN IF NOT EXISTS fresha_url TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_business_url TEXT,
  ADD COLUMN IF NOT EXISTS other_booking_url TEXT,
  ADD COLUMN IF NOT EXISTS show_whatsapp_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_email_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS languages TEXT[],
  ADD COLUMN IF NOT EXISTS has_liability_insurance BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_deontological_code BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_truthfulness BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS organisation_type TEXT,
  ADD COLUMN IF NOT EXISTS mission_text TEXT,
  ADD COLUMN IF NOT EXISTS facilities TEXT[];

COMMENT ON COLUMN public.therapists.professional_name IS 'Nombre profesional opcional mostrado junto al nombre legal.';
COMMENT ON COLUMN public.therapists.logo_url IS 'Logo del profesional o centro, distinto de la foto de perfil.';
COMMENT ON COLUMN public.therapists.target_audience IS 'Poblaciones o públicos objetivo del profesional.';
COMMENT ON COLUMN public.therapists.accompaniment_modalities IS 'Formatos de acompañamiento ofrecidos, como sesiones individuales o talleres.';
COMMENT ON COLUMN public.therapists.session_modalities IS 'Modalidades de sesión ofrecidas, como presencial, online o a distancia.';
COMMENT ON COLUMN public.therapists.home_visit_radius IS 'Radio de desplazamiento para visitas a domicilio.';
COMMENT ON COLUMN public.therapists.center_name IS 'Nombre público de la práctica, consulta o centro.';
COMMENT ON COLUMN public.therapists.tagline IS 'Frase de presentación pública del profesional o centro.';
COMMENT ON COLUMN public.therapists.approach_text IS 'Descripción pública del enfoque de trabajo.';
COMMENT ON COLUMN public.therapists.differentiator_text IS 'Descripción pública de aquello que diferencia al profesional o centro.';
COMMENT ON COLUMN public.therapists.instagram_url IS 'URL pública de Instagram.';
COMMENT ON COLUMN public.therapists.facebook_url IS 'URL pública de Facebook.';
COMMENT ON COLUMN public.therapists.linkedin_url IS 'URL pública de LinkedIn.';
COMMENT ON COLUMN public.therapists.youtube_url IS 'URL pública de YouTube.';
COMMENT ON COLUMN public.therapists.calendly_url IS 'URL pública de reserva en Calendly.';
COMMENT ON COLUMN public.therapists.fresha_url IS 'URL pública de reserva en Fresha.';
COMMENT ON COLUMN public.therapists.whatsapp_business_url IS 'URL pública de WhatsApp Business.';
COMMENT ON COLUMN public.therapists.other_booking_url IS 'Otra URL pública de reserva o contacto.';
COMMENT ON COLUMN public.therapists.show_whatsapp_public IS 'Indica si el WhatsApp puede mostrarse públicamente.';
COMMENT ON COLUMN public.therapists.show_email_public IS 'Indica si el correo puede mostrarse públicamente.';
COMMENT ON COLUMN public.therapists.languages IS 'Idiomas públicos en los que atiende el profesional o centro.';
COMMENT ON COLUMN public.therapists.has_liability_insurance IS 'Indica si el profesional declara contar con seguro de responsabilidad civil.';
COMMENT ON COLUMN public.therapists.accepted_deontological_code IS 'Indica si el profesional acepta el código deontológico.';
COMMENT ON COLUMN public.therapists.accepted_truthfulness IS 'Indica si el profesional acepta la veracidad de la información publicada.';
COMMENT ON COLUMN public.therapists.organisation_type IS 'Tipo de organización para perfiles de centros.';
COMMENT ON COLUMN public.therapists.mission_text IS 'Texto público de misión para centros u organizaciones.';
COMMENT ON COLUMN public.therapists.facilities IS 'Listado de instalaciones o recursos disponibles en el centro.';

COMMIT;
