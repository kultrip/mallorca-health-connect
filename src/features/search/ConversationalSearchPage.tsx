import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import {
  ProfessionalResultsWithMap,
  ProfessionalResultsSkeleton,
} from "@/components/therapists/ProfessionalResultsWithMap";
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getVisitorId } from "@/lib/analytics";

type SearchResult = {
  intro: string;
  matched_help_areas: string[];
  suggested_therapies: string[];
  search_query_id?: string | null;
  therapists: TherapistCardData[];
};

export function ConversationalSearchPage({ q }: { q?: string }) {
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => setQuery(q ?? ""), [q]);

  const { data, isLoading, isError, refetch } = useQuery<SearchResult>({
    queryKey: ["symptom-search", q],
    enabled: !!q,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("symptom-search", {
        body: { query: q, visitorId: getVisitorId() },
      });
      if (error) throw error;
      return data as SearchResult;
    },
  });
  const warmIntro =
    "Gracias por compartirlo. Aquí tienes personas y propuestas que pueden acompañarte.";

  return (
    <PageShell>
      <section className="mx-auto max-w-[1180px] px-6 pt-12 md:px-10 md:pt-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Búsqueda por como te sientes
          </div>
          <p className="font-display text-2xl leading-snug text-foreground/90 md:text-3xl">"{q}"</p>
        </div>

        {/* AI intro */}
        <div className="mt-10 max-w-3xl">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {isError && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive-foreground">
              No pudimos completar la búsqueda. Por favor, inténtalo de nuevo en un momento.{" "}
              <button onClick={() => refetch()} className="underline">
                Reintentar
              </button>
            </div>
          )}
          {data && (
            <p className="font-display text-xl leading-relaxed text-foreground/85 md:text-2xl">
              {warmIntro}
            </p>
          )}
        </div>

        {/* New search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
            }
          }}
          className="mt-8 max-w-3xl rounded-3xl border border-border bg-card p-4"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cuéntanos otra cosa…"
            className="w-full bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-[1180px] px-6 pb-24 pt-16 md:px-10">
        {isLoading ? (
          <ProfessionalResultsSkeleton />
        ) : data && data.therapists.length > 0 ? (
          <>
            <h2 className="font-display mb-6 text-2xl">Profesionales que pueden acompañarte</h2>
            <ProfessionalResultsWithMap
              professionals={data.therapists}
              mapTitle="Recomendaciones en Mallorca"
            />
          </>
        ) : data ? (
          <div className="mt-8 rounded-[2rem] border border-[#eadfce] bg-white/72 shadow-[0_14px_45px_rgba(96,68,31,0.06)] p-10 text-center max-w-2xl mx-auto">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fcf5ec] text-[#b48752] mb-5">
              <Sparkles className="h-6 w-6" />
            </span>
            <h3 className="font-display text-2xl text-[#1f3326] font-semibold">
              Aún no tenemos profesionales que encajen con esto.
            </h3>
            <p className="mt-3 text-sm text-[#5d5144] leading-relaxed">
              Estamos expandiendo con mucho cuidado nuestra red de terapeutas de confianza en Mallorca. Te sugerimos probar con otros términos o explorar el directorio completo.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/professionals"
                className="rounded-full bg-[#526046] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#435039] transition-all shadow-sm"
              >
                Ver todos los profesionales
              </Link>
              <Link
                to="/"
                className="rounded-full border border-[#eadfce] bg-white text-[#5d5144] px-6 py-2.5 text-sm font-medium hover:bg-[#fcf9f5] transition-all"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        ) : null}

        {data && (
          <div className="mt-12 rounded-2xl border border-[#eadfce] bg-[#fffaf4]/60 p-5 text-xs text-[#6d5b43] leading-relaxed max-w-3xl">
            <p className="font-semibold text-[#1f3326] flex items-center gap-1.5 mb-1.5">
              ⚠️ Nota informativa de salud:
            </p>
            Las terapias, acompañamientos y actividades descritos o recomendados en esta plataforma tienen un carácter complementario e integrativo y en ningún caso sustituyen la consulta, diagnóstico o tratamiento de profesionales médicos o de la salud cualificados.
          </div>
        )}
      </section>
    </PageShell>
  );
}
