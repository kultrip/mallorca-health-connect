import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { TherapistCard, type TherapistCardData } from "@/components/therapists/TherapistCard";
import { Skeleton } from "@/components/ui/skeleton";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/buscar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Encuentra acompañamiento — Mallorca Holística" },
      {
        name: "description",
        content:
          "Cuéntanos cómo te sientes y te mostramos profesionales que pueden acompañarte.",
      },
    ],
  }),
  component: Page,
});

type SearchResult = {
  intro: string;
  matched_help_areas: string[];
  suggested_therapies: string[];
  therapists: TherapistCardData[];
};

function Page() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");

  useEffect(() => setQuery(q ?? ""), [q]);

  const { data, isLoading, isError, refetch } = useQuery<SearchResult>({
    queryKey: ["symptom-search", q],
    enabled: !!q,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("symptom-search", {
        body: { query: q },
      });
      if (error) throw error;
      return data as SearchResult;
    },
  });

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
          <p className="font-display text-2xl leading-snug text-foreground/90 md:text-3xl">
            "{q}"
          </p>
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
              <button onClick={() => refetch()} className="underline">Reintentar</button>
            </div>
          )}
          {data?.intro && (
            <p className="font-display text-xl leading-relaxed text-foreground/85 md:text-2xl">
              {data.intro}
            </p>
          )}
        </div>

        {/* New search input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`;
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-3xl" />
            ))}
          </div>
        ) : data && data.therapists.length > 0 ? (
          <>
            <h2 className="font-display mb-6 text-2xl">
              Profesionales que pueden acompañarte
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.therapists.map((t) => (
                <TherapistCard key={t.id} t={t} />
              ))}
            </div>
          </>
        ) : data ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground/80">
              Aún no tenemos profesionales que encajen con esto.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba a explorar el directorio completo de profesionales.
            </p>
            <Link
              to="/profesionales"
              className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
            >
              Ver todos los profesionales
            </Link>
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
