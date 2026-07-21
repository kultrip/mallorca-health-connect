import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import {
  ProfessionalResultsWithMap,
  ProfessionalResultsSkeleton,
} from "@/components/therapists/ProfessionalResultsWithMap";
import type { TherapistCardData } from "@/components/therapists/TherapistCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { ProfessionalsSearch } from "@/lib/route-schemas";
import { sortProfessionalsByPriority } from "@/lib/professional-ranking";

type RankedTherapistCardData = TherapistCardData & {
  subscription_status?: string | null;
  plans?: { slug?: string | null } | null;
  therapist_therapies?: Array<{
    therapies: {
      name: string;
      slug: string;
    } | null;
  }> | null;
};

export function ProfessionalsPage({ search }: { search: ProfessionalsSearch }) {
  const navigate = useNavigate();
  const modalidad = search.modalidad ?? "";

  const { data: municipalities } = useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const { data } = await supabase.from("municipalities").select("name,slug").order("name");
      return data ?? [];
    },
    retry: 1,
  });

  const { data: therapiesList } = useQuery({
    queryKey: ["therapies-catalog-select"],
    queryFn: async () => {
      const { data } = await supabase.from("therapies").select("name,slug").order("name");
      return data ?? [];
    },
    retry: 1,
  });

  const { data: therapists, isLoading, isError, error, refetch } = useQuery<RankedTherapistCardData[]>({
    queryKey: ["therapists", search.q, search.municipio, search.terapia, modalidad],
    retry: 1,
    queryFn: async () => {
      let query = supabase
        .from("therapists")
        .select(
          "id, slug, full_name, headline, frase_clave, photo_url, especialidad, modalities, verified, city, address, lat, lng, subscription_status, municipalities(name,slug,lat,lng), plans!therapists_plan_id_fkey(slug), therapist_therapies(therapies(name,slug))",
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

      let list = (data ?? []) as unknown as RankedTherapistCardData[];

      // Filter by selected therapy slug
      if (search.terapia) {
        const selectedTherapySlug = search.terapia.toLowerCase();
        list = list.filter((t) => {
          const assocSlugs = (t.therapist_therapies ?? [])
            .map((tt) => tt.therapies?.slug?.toLowerCase())
            .filter(Boolean);
          return assocSlugs.includes(selectedTherapySlug);
        });
      }

      // Filter by search query text
      if (search.q) {
        const q = search.q.toLowerCase();
        list = list.filter((t) => {
          const associatedTherapyNames = (t.therapist_therapies ?? [])
            .map((tt) => tt.therapies?.name?.toLowerCase())
            .filter(Boolean);

          return (
            t.full_name?.toLowerCase().includes(q) ||
            t.especialidad?.toLowerCase().includes(q) ||
            t.headline?.toLowerCase().includes(q) ||
            t.frase_clave?.toLowerCase().includes(q) ||
            t.city?.toLowerCase().includes(q) ||
            t.address?.toLowerCase().includes(q) ||
            t.municipalities?.name?.toLowerCase().includes(q) ||
            associatedTherapyNames.some((name) => name.includes(q))
          );
        });
      }
      return sortProfessionalsByPriority(list);
    },
  });

  const count = therapists?.length ?? 0;
  const isFiltered = Boolean(search.q || search.municipio || search.terapia || modalidad);

  const handleMunicipioChange = (name: string) => {
    navigate({
      to: "/professionals",
      search: (prev) => ({
        ...prev,
        municipio: name || undefined,
      }) as any,
    });
  };

  const handleTerapiaChange = (slug: string) => {
    navigate({
      to: "/professionals",
      search: (prev) => ({
        ...prev,
        terapia: slug || undefined,
      }) as any,
    });
  };

  const handleModalidadChange = (val: string) => {
    navigate({
      to: "/professionals",
      search: (prev) => ({
        ...prev,
        modalidad: (val as any) || undefined,
      }) as any,
    });
  };

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
          
          {/* Terapia selector dropdown */}
          <select
            value={search.terapia ?? ""}
            onChange={(e) => handleTerapiaChange(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-1.5 text-sm outline-none focus:border-primary max-w-[200px] text-ellipsis"
          >
            <option value="">Todas las terapias</option>
            {therapiesList?.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Municipio selector dropdown */}
          <select
            value={search.municipio ?? ""}
            onChange={(e) => handleMunicipioChange(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="">Toda Mallorca</option>
            {municipalities?.map((m) => (
              <option key={m.slug} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Modalidad selector dropdown */}
          <select
            value={modalidad}
            onChange={(e) => handleModalidadChange(e.target.value)}
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
            {isLoading ? "Cargando…" : isError ? "Error" : `${count} profesional${count === 1 ? "" : "es"}`}
          </span>
        </div>

        {isLoading ? (
          <ProfessionalResultsSkeleton />
        ) : isError ? (
          <div className="rounded-3xl border border-[#eadfce] bg-[#fffaf4]/60 p-12 text-center max-w-xl mx-auto shadow-sm">
            <h2 className="font-display text-2xl text-[#1f3326] font-semibold">
              Error de conexión
            </h2>
            <p className="mt-2 text-sm text-[#5d5144]/80 leading-relaxed">
              No pudimos conectar con el servidor para cargar los profesionales. Por favor, comprueba tu conexión o vuelve a intentarlo.
            </p>
            {error instanceof Error && (
              <pre className="mt-4 bg-white/50 border border-[#eadfce] p-3 rounded-xl text-left font-mono text-[10px] text-red-700 max-h-24 overflow-y-auto">
                {error.message}
              </pre>
            )}
            <button
              onClick={() => refetch()}
              className="mt-6 inline-flex rounded-full bg-[#526046] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#526046]/90 transition-all cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : count === 0 ? (
          isFiltered ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center">
              <p className="font-display text-xl text-foreground/80">
                No encontramos profesionales con esos filtros.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Prueba a ampliar la zona de búsqueda o cambiar los criterios seleccionados.
              </p>
              <Link
                to="/professionals"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm hover:bg-muted font-medium transition-all text-foreground"
              >
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                Limpiar filtros
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#eadfce] bg-[#fffaf4]/40 p-12 text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl text-[#1f3326] font-semibold">
                El directorio de profesionales está en preparación
              </h2>
              <p className="mt-3 text-sm text-[#5d5144]/80 leading-relaxed">
                Estamos construyendo un directorio de profesionales de la salud complementaria e integrativa en Mallorca bajo estrictos criterios de verificación para garantizar la máxima confianza.
              </p>
              <p className="mt-4 text-sm font-medium text-[#1f3326]">
                ¿Eres profesional del bienestar en Mallorca?
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/for-professionals"
                  className="inline-flex rounded-full bg-[#8a6550] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#8a6550]/90 transition-all shadow-sm"
                >
                  Ver planes y unirme
                </Link>
                <Link
                  to="/"
                  className="inline-flex rounded-full border border-[#eadfce] bg-white text-[#5d5144] px-6 py-2.5 text-sm font-medium hover:bg-[#fcf9f5] transition-all"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          )
        ) : (
          <>
            <ProfessionalResultsWithMap
              professionals={therapists as TherapistCardData[]}
              mapTitle="Profesionales en Mallorca"
            />
            {count > 0 && (
              <div className="mt-12 rounded-2xl border border-[#eadfce] bg-[#fffaf4]/60 p-5 text-xs text-[#6d5b43] leading-relaxed max-w-3xl">
                <p className="font-semibold text-[#1f3326] flex items-center gap-1.5 mb-1.5">
                  ⚠️ Nota informativa de salud:
                </p>
                Las terapias y acompañamientos descritos en esta plataforma tienen un carácter complementario e integrativo y en ningún caso sustituyen la consulta, diagnóstico o tratamiento de profesionales médicos o de la salud cualificados.
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
  );
}

