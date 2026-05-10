import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, MapPin, MessageCircle, Calendar, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profesionales/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Mallorca Holística` },
    ],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["therapist", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapists")
        .select(
          "*, municipalities(name,slug), therapist_therapies(therapies(slug,name)), therapist_help_areas(help_areas(slug,name))"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10">
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center md:px-10">
          <p className="font-display text-2xl text-foreground/80">
            No encontramos este profesional.
          </p>
          <Link to="/profesionales" className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted">
            Ver directorio
          </Link>
        </div>
      </PageShell>
    );
  }

  const therapies = (data.therapist_therapies ?? []).map((tt: any) => tt.therapies).filter(Boolean);
  const helpAreas = (data.therapist_help_areas ?? []).map((th: any) => th.help_areas).filter(Boolean);

  return (
    <PageShell>
      <article className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <Link
          to="/profesionales"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Profesionales
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr,1.4fr] md:gap-14">
          {/* Photo */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
            {data.photo_url ? (
              <img src={data.photo_url} alt={data.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-6xl text-muted-foreground/40">
                {data.full_name?.[0]}
              </div>
            )}
            {data.verified && (
              <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-primary" /> Verificado
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {data.especialidad}
            </div>
            <h1 className="font-display mt-2 text-4xl md:text-5xl">{data.full_name}</h1>
            {data.frase_clave && (
              <p className="mt-4 font-display text-2xl italic text-foreground/75">
                "{data.frase_clave}"
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {data.municipalities?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {data.municipalities.name}
                </span>
              )}
              {data.modalities && data.modalities.length > 0 && (
                <span className="capitalize">{data.modalities.join(" · ")}</span>
              )}
              {data.years_experience && (
                <span>{data.years_experience} años de experiencia</span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {data.whatsapp && (
                <Button asChild variant="whatsapp">
                  <a href={`https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              )}
              {data.link_reserva && (
                <Button asChild>
                  <a href={data.link_reserva} target="_blank" rel="noopener">
                    <Calendar className="h-4 w-4" /> Reservar cita
                  </a>
                </Button>
              )}
              {data.website && (
                <Button asChild variant="outline">
                  <a href={data.website} target="_blank" rel="noopener">
                    <Globe className="h-4 w-4" /> Web
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* About / formation / experience */}
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {data.sobre_mi && (
            <Section title="Sobre mí">{data.sobre_mi}</Section>
          )}
          {data.formacion && (
            <Section title="Formación">{data.formacion}</Section>
          )}
          {data.experiencia && (
            <Section title="Experiencia">{data.experiencia}</Section>
          )}
        </div>

        {/* Therapies + help areas */}
        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {therapies.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Terapias</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {therapies.map((t: any) => (
                  <span key={t.slug} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {helpAreas.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Te puedo acompañar en</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {helpAreas.map((h: any) => (
                  <span key={h.slug} className="rounded-full bg-muted px-3.5 py-1.5 text-sm text-foreground/80">
                    {h.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
        {children}
      </p>
    </div>
  );
}
