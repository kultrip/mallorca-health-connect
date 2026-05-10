import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Therapy } from "./types";
import { filterTherapies, groupTherapiesByLetter } from "./therapy-utils";

export function TherapiesPage() {
  const [query, setQuery] = useState("");

  const {
    data: therapies = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Therapy[]>({
    queryKey: ["therapies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapies")
        .select("id, slug, name, category, short_description, description")
        .order("name");

      if (error) throw error;
      return data ?? [];
    },
  });

  const visibleTherapies = useMemo(() => filterTherapies(therapies, query), [therapies, query]);
  const groups = useMemo(() => groupTherapiesByLetter(visibleTherapies), [visibleTherapies]);
  const letters = groups.map((group) => group.letter);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Guía"
        title="Guía de terapias"
        intro="Explora las terapias disponibles en Mallorca Holística y descubre en qué consiste cada una y cómo puede acompañarte."
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <div className="mb-8 rounded-2xl border border-border bg-card p-4">
          <label className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2 text-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar terapia..."
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
        </div>

        {isLoading ? (
          <TherapiesSkeleton />
        ) : isError ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="font-display text-xl text-foreground/85">
              No pudimos cargar la guía de terapias.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
            >
              Reintentar
            </button>
          </div>
        ) : therapies.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground/80">
              Estamos preparando la guía de terapias.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pronto podrás explorar aquí las terapias disponibles en Mallorca Holística.
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground/80">
              No encontramos terapias con esa búsqueda.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <>
            <nav aria-label="Índice de terapias" className="mb-10 flex flex-wrap gap-2">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#therapy-${letter}`}
                  className="flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-background px-3 text-sm hover:border-primary/40 hover:bg-muted"
                >
                  {letter}
                </a>
              ))}
            </nav>

            <div className="space-y-12">
              {groups.map((group) => (
                <section key={group.letter} id={`therapy-${group.letter}`}>
                  <h2 className="font-display text-3xl">{group.letter}</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {group.therapies.map((therapy) => (
                      <Link
                        key={therapy.id}
                        to="/therapies/$slug"
                        params={{ slug: therapy.slug }}
                        className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/40"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-xl">{therapy.name}</h3>
                          {therapy.category && (
                            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                              {therapy.category}
                            </span>
                          )}
                        </div>
                        {therapy.short_description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {therapy.short_description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

function TherapiesSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex}>
          <Skeleton className="h-8 w-12" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((__, itemIndex) => (
              <Skeleton key={itemIndex} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
