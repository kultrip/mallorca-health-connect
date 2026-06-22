import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import type { Json } from "@/integrations/supabase/types";

export type TherapyDetailSection = {
  title: string;
  body: string;
};

export type Therapy = {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  short_description?: string | null;
  description?: string | null;
  detail_sections?: Json | null;
  benefits?: string[] | null;
  session_description?: string | null;
  medical_disclaimer?: string | null;
  empty_professionals_message?: string | null;
};

export type TherapyGroup = {
  letter: string;
  therapies: Therapy[];
};

export type RelatedTherapistRow = {
  therapists: TherapistCardData | TherapistCardData[] | null;
};
