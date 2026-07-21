import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import {
  ProfessionalResultsWithMap,
  ProfessionalResultsSkeleton,
} from "@/components/therapists/ProfessionalResultsWithMap";
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
  const { data: therapy, isLoading: isTherapyLoading } = useQuery<Therapy | null>({
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
  const { data: relatedTherapists = [], isLoading: areTherapistsLoading } = useQuery<
    RankedTherapistCardData[]
  >({
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
          .filter((therapist): therapist is RankedTherapistCardData => Boolean(therapist)),
      );
    },
  });

  const isLoading = isTherapyLoading || areTherapistsLoading;

  return (
    <PageShell>
      <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <Link
          to="/therapies/$slug"
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
          <div className="mt-8 rounded-[2rem] border border-[#eadfce] bg-white/72 shadow-[0_14px_45px_rgba(96,68,31,0.06)] p-10 text-center max-w-2xl mx-auto">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fcf5ec] text-[#b48752] mb-5">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="font-display text-2xl text-[#1f3326] font-semibold">
              No encontramos profesionales en este momento.
            </h3>
            <p className="mt-3 text-sm text-[#5d5144] leading-relaxed">
              Estamos ampliando con mucho cuidado nuestra red de profesionales cualificados para esta especialidad. Te invitamos a explorar el directorio completo o volver en unos días.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/professionals"
                className="rounded-full bg-[#526046] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#435039] transition-all shadow-sm"
              >
                Ver todos los profesionales
              </Link>
              <Link
                to="/therapies"
                className="rounded-full border border-[#eadfce] bg-white text-[#5d5144] px-6 py-2.5 text-sm font-medium hover:bg-[#fcf9f5] transition-all"
              >
                Volver a terapias
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
