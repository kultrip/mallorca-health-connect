import type { Database } from "@/integrations/supabase/types";

export type TherapistRow = Database["public"]["Tables"]["therapists"]["Row"];
export type TherapyRow = Database["public"]["Tables"]["therapies"]["Row"];
export type HelpAreaRow = Database["public"]["Tables"]["help_areas"]["Row"];
export type MunicipalityRow = Database["public"]["Tables"]["municipalities"]["Row"];
export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];
export type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
export type ProfessionalReviewRow = Database["public"]["Tables"]["professional_reviews"]["Row"];

export type Relation<T> = T | T[] | null;

export type AdminTherapist = TherapistRow & {
  plans?: Relation<Pick<PlanRow, "name" | "slug" | "price_monthly_cents">>;
  municipalities?: Relation<Pick<MunicipalityRow, "name" | "slug" | "lat" | "lng">>;
  therapist_therapies?: Array<{ therapy_id: string | null }> | null;
  therapist_help_areas?: Array<{ help_area_id: string | null }> | null;
};

export function firstRelation<T>(value: Relation<T> | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
