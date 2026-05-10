import type { TherapistCardData } from "@/components/therapists/TherapistCard";

export type Therapy = {
  id: string;
  slug: string;
  name: string;
  category?: string | null;
  short_description?: string | null;
  description?: string | null;
};

export type TherapyGroup = {
  letter: string;
  therapies: Therapy[];
};

export type RelatedTherapistRow = {
  therapists: TherapistCardData | TherapistCardData[] | null;
};
