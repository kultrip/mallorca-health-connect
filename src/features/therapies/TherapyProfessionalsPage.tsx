import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ProfessionalResultsWithMap, ProfessionalResultsSkeleton } from "@/components/therapists/ProfessionalResultsWithMap";
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { supabase } from "@/integrations/supabase/client";
import { sortProfessionalsByPriority } from "@/lib/professional-ranking";
import { fallbackTherapiesBySlug } from "./therapy-guide-content";
import type { RelatedTherapistRow, Therapy } from "./types";

type RankedTherapistCardData = TherapistCardData & {
  subscription_status?: string | null;
  plans?: { slug?: string | null } | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function TherapyProfessionalsPage({ slug }: { slug: string }) {
  const {
    data: therapy,
    isLoading: isTherapyLoading,
  } = useQuery<Therapy | null>({
    queryKey: ["therapy", slug],
    initialData: fallbackTherapiesBySlug.get(slug) ?? null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapies")
        .select("id, slug, name")
        .eq("slug", slug)
        .maybeSingle();

      if (error) return fallbackTherapiesBySlug.get(slug) ?? null;
      return data ?? fallbackTherapiesBySlug.get(slug) ?? null;
    },
  });

  const therapyId = therapy?.id;
  const {
    data: relatedTherapists = [],
    isLoading: areTherapistsLoading,
  } = useQuery<RankedTherapistCardData[]>({
    queryKey: ["therapy-related-therapists-list", therapyId],
    enabled: !!therapyId && !therapyId.startsWith("local-"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapist_therapies")
        .select(
          "therapists(id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, city, address, lat, lng, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug))",
        )
        .eq("therapy_id", therapyId!)
        .eq("therapists.status", "published")
        .limit(100);

      if (error) throw error;

      return sortProfessionalsByPriority(
        (data as RelatedTherapistRow[])
          .map((row) => firstRelation(row.therapists))
          .filter((therapist): therapist is RankedTherapistCardData => Boolean(therapist))
      );
    },
  });

  const isLoading = isTherapyLoading || areTherapistsLoading;

  return (
    <PageShell>
      <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <Link
          to="/therapies_/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a {therapy?.name ?? "la terapia"}
        </Link>

        <h1 className="font-display text-4xl mb-8">
          Profesionales de {therapy?.name ?? "la terapia"}
        </h1>

        {isLoading ? (
          <ProfessionalResultsSkeleton />
        ) : relatedTherapists.length > 0 ? (
          <ProfessionalResultsWithMap
            professionals={relatedTherapists as TherapistCardData[]}
            mapTitle={`Profesionales de ${therapy?.name}`}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground/80">
              No encontramos profesionales en este momento.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Puedes volver a la terapia o explorar el directorio completo.
            </p>
            <Link
              to="/professionals"
              className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
            >
              Ver todos los profesionales
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}
