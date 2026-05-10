import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { TherapistCard, type TherapistCardData } from "@/components/therapists/TherapistCard";
import { supabase } from "@/integrations/supabase/client";
import type { RelatedTherapistRow, Therapy } from "./types";

export function TherapyDetailPage({ slug }: { slug: string }) {
  const {
    data: therapy,
    isLoading: isTherapyLoading,
    isError: isTherapyError,
    refetch: refetchTherapy,
  } = useQuery<Therapy | null>({
    queryKey: ["therapy", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapies")
        .select("id, slug, name, category, short_description, description")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const therapyId = therapy?.id;
  const {
    data: relatedTherapists = [],
    isLoading: areTherapistsLoading,
    isError: areTherapistsError,
  } = useQuery<TherapistCardData[]>({
    queryKey: ["therapy-related-therapists", therapyId],
    enabled: !!therapyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapist_therapies")
        .select(
          "therapists(id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, municipalities(name,slug))",
        )
        .eq("therapy_id", therapyId!)
        .eq("therapists.status", "published")
        .limit(12);

      if (error) throw error;

      return (data as RelatedTherapistRow[])
        .map((row) => firstRelation(row.therapists))
        .filter((therapist): therapist is TherapistCardData => Boolean(therapist));
    },
  });

  if (isTherapyLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[900px] px-6 py-16 md:px-10">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-8 h-14 w-3/4" />
          <Skeleton className="mt-6 h-32 w-full rounded-3xl" />
        </div>
      </PageShell>
    );
  }

  if (isTherapyError) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[900px] px-6 py-24 text-center md:px-10">
          <p className="font-display text-2xl text-foreground/80">
            No pudimos cargar esta terapia.
          </p>
          <button
            type="button"
            onClick={() => refetchTherapy()}
            className="mt-6 rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
          >
            Reintentar
          </button>
        </div>
      </PageShell>
    );
  }

  if (!therapy) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[900px] px-6 py-24 text-center md:px-10">
          <p className="font-display text-2xl text-foreground/80">No encontramos esta terapia.</p>
          <Link
            to="/therapies"
            className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
          >
            Ver guía de terapias
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <article className="mx-auto max-w-[900px] px-6 pb-16 pt-12 md:px-10 md:pt-16">
        <Link
          to="/therapies"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Terapias
        </Link>

        {therapy.category && (
          <div className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">
            {therapy.category}
          </div>
        )}
        <h1 className="font-display mt-3 text-4xl md:text-5xl">{therapy.name}</h1>

        {therapy.short_description && (
          <p className="mt-6 font-display text-2xl leading-relaxed text-foreground/80">
            {therapy.short_description}
          </p>
        )}

        {therapy.description ? (
          <div className="mt-10 rounded-3xl border border-border bg-card p-6 md:p-8">
            <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/80 md:text-base">
              {therapy.description}
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card/50 p-6 text-sm leading-relaxed text-muted-foreground">
            Estamos preparando más información sobre esta terapia.
          </div>
        )}
      </article>

      <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <h2 className="font-display text-3xl">Profesionales relacionados</h2>
        {areTherapistsLoading ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-3xl" />
            ))}
          </div>
        ) : areTherapistsError ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No pudimos cargar los profesionales relacionados en este momento.
          </div>
        ) : relatedTherapists.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTherapists.map((therapist) => (
              <TherapistCard key={therapist.id} t={therapist} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="font-display text-xl text-foreground/80">
              Todavía no tenemos profesionales vinculados a esta terapia.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Puedes explorar el directorio completo.
            </p>
            <Link
              to="/professionals"
              className="mt-5 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
            >
              Ver profesionales
            </Link>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
