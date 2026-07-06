import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Therapy, TherapyDetailSection } from "./types";
import { fallbackTherapiesBySlug } from "./therapy-guide-content";


export function TherapyDetailPage({ slug }: { slug: string }) {
  const {
    data: therapy,
    isLoading: isTherapyLoading,
    isError: isTherapyError,
    refetch: refetchTherapy,
  } = useQuery<Therapy | null>({
    queryKey: ["therapy", slug],
    initialData: fallbackTherapiesBySlug.get(slug) ?? null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapies")
        .select(
          "id, slug, name, category, short_description, description, detail_sections, benefits, session_description, medical_disclaimer, empty_professionals_message",
        )
        .eq("slug", slug)
        .maybeSingle();

      if (error) return fallbackTherapiesBySlug.get(slug) ?? null;
      return data ?? fallbackTherapiesBySlug.get(slug) ?? null;
    },
  });

  const therapyId = therapy?.id;
  const {
    data: therapistsCount = 0,
    isLoading: isCountLoading,
  } = useQuery<number>({
    queryKey: ["therapy-related-therapists-count", therapyId],
    enabled: !!therapyId && !therapyId.startsWith("local-"),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("therapist_therapies")
        .select("therapist_id, therapists!inner(status)", { count: "exact", head: true })
        .eq("therapy_id", therapyId!)
        .eq("therapists.status", "published");

      if (error) throw error;
      return count ?? 0;
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

  const detailSections = getDetailSections(therapy.detail_sections);
  const benefits = therapy.benefits ?? [];
  const hasStructuredContent =
    detailSections.length > 0 ||
    benefits.length > 0 ||
    Boolean(therapy.session_description || therapy.medical_disclaimer);

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

        {hasStructuredContent ? (
          <div className="mt-10 space-y-10">
            {detailSections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl">{section.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80 md:text-base">
                  {section.body}
                </p>
              </section>
            ))}

            {benefits.length > 0 && (
              <section>
                <h2 className="font-display text-2xl">En qué puede ayudar</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80 md:text-base">
                  Muchas personas recurren a la {therapy.name.toLowerCase()} para acompañar procesos
                  como:
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground/80"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {therapy.session_description && (
              <section>
                <h2 className="font-display text-2xl">Cómo es una sesión</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80 md:text-base">
                  {therapy.session_description}
                </p>
              </section>
            )}

            {therapy.medical_disclaimer && (
              <aside className="rounded-2xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
                <strong className="block text-foreground/80">Nota importante</strong>
                <span className="mt-2 block">{therapy.medical_disclaimer}</span>
              </aside>
            )}
          </div>
        ) : therapy.description ? (
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

      <section className="mx-auto max-w-[900px] px-6 pb-24 md:px-10">
        <h2 className="font-display text-3xl">Profesionales relacionados</h2>
        {isCountLoading ? (
          <Skeleton className="mt-6 h-32 w-full rounded-3xl" />
        ) : therapistsCount > 0 ? (
          <div className="mt-6 rounded-3xl border border-[#eadfce]/60 bg-gradient-to-br from-[#fcf9f5] to-white p-8 text-center shadow-[0_4px_20px_rgba(96,68,31,0.02)]">
            <p className="font-display text-2xl text-[#1f3326]">
              Tenemos {therapistsCount} profesional{therapistsCount === 1 ? "" : "es"} de {therapy.name.toLowerCase()} disponible{therapistsCount === 1 ? "" : "s"} en Mallorca.
            </p>
            <p className="mt-2 text-sm text-[#5d5144]/80">
              Encuentra a la persona adecuada para acompañarte en tu proceso.
            </p>
            <Link
              to="/therapies/$slug/professionals"
              params={{ slug: therapy.slug }}
              className="mt-6 inline-flex rounded-full bg-[#8a6550] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#8a6550]/90 transition-all shadow-sm"
            >
              Ver profesionales de {therapy.name.toLowerCase()}
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="font-display text-xl text-foreground/80">
              Todavía no tenemos profesionales vinculados a esta terapia.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {therapy.empty_professionals_message ?? "Puedes explorar el directorio completo."}
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

function getDetailSections(value: Therapy["detail_sections"]): TherapyDetailSection[] {
  if (!Array.isArray(value)) return [];

  return value.filter((section): section is TherapyDetailSection => {
    if (!section || typeof section !== "object" || Array.isArray(section)) return false;
    return typeof section.title === "string" && typeof section.body === "string";
  });
}
