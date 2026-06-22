import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { ProfessionalResultsWithMap } from "@/components/therapists/ProfessionalResultsWithMap";
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Filter } from "lucide-react";
import type { ProfessionalsSearch } from "@/lib/route-schemas";
import { sortProfessionalsByPriority } from "@/lib/professional-ranking";

type RankedTherapistCardData = TherapistCardData & {
  subscription_status?: string | null;
  plans?: { slug?: string | null } | null;
};

export function ProfessionalsPage({ search }: { search: ProfessionalsSearch }) {
  const [modalidad, setModalidad] = useState<string>(search.modalidad ?? "");

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const { data } = await supabase.from("municipalities").select("name,slug").order("name");
      return data ?? [];
    },
  });

  const { data: therapists, isLoading } = useQuery<RankedTherapistCardData[]>({
    queryKey: ["therapists", search.q, search.municipio, modalidad],
    queryFn: async () => {
      let query = supabase
        .from("therapists")
        .select(
          "id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, city, address, lat, lng, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug)",
        )
        .eq("status", "published")
        .limit(200);

      if (search.municipio) {
        const { data: m } = await supabase
          .from("municipalities")
          .select("id")
          .eq("name", search.municipio)
          .maybeSingle();
        if (m) query = query.eq("municipality_id", m.id);
      }

      if (modalidad) {
        query = query.contains("modalities", [modalidad]);
      }

      const { data, error } = await query;
      if (error) throw error;

      let list = data ?? [];
      if (search.q) {
        const q = search.q.toLowerCase();
        list = list.filter(
          (t) =>
            t.full_name?.toLowerCase().includes(q) ||
            t.especialidad?.toLowerCase().includes(q) ||
            t.headline?.toLowerCase().includes(q) ||
            t.city?.toLowerCase().includes(q) ||
            t.address?.toLowerCase().includes(q) ||
            t.municipalities?.name?.toLowerCase().includes(q),
        );
      }
      return sortProfessionalsByPriority(list);
    },
  });

  const count = therapists?.length ?? 0;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Directorio"
        title="Profesionales verificados"
        intro="Encuentra a la persona adecuada para acompañarte. Filtra por terapia, ubicación y modalidad."
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Filtros
          </div>
          <select
            value={search.municipio ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              window.location.href = `/professionals${val ? `?municipio=${encodeURIComponent(val)}` : ""}`;
            }}
            className="rounded-full border border-border bg-background px-4 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Toda Mallorca</option>
            {municipalities?.map((m) => (
              <option key={m.slug} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Todas las modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="domicilio">A domicilio</option>
          </select>
          {search.q && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Búsqueda: "{search.q}"
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {isLoading ? "Cargando…" : `${count} profesional${count === 1 ? "" : "es"}`}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-3xl" />
            ))}
          </div>
        ) : count === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="font-display text-xl text-foreground/80">
              No encontramos profesionales con esos filtros.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prueba a ampliar la zona o quitar la modalidad.
            </p>
          </div>
        ) : (
          <ProfessionalResultsWithMap
            professionals={therapists as TherapistCardData[]}
            mapTitle="Profesionales en Mallorca"
          />
        )}
      </section>
    </PageShell>
  );
}
