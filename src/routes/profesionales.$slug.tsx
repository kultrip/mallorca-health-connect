import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ChevronDown,
  Globe,
  Info,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { planSupportsDirectContact } from "@/lib/plan-access";

type NamedSlug = {
  slug: string;
  name: string;
};

type TherapyLink = {
  therapies: NamedSlug | NamedSlug[] | null;
};

type HelpAreaLink = {
  help_areas: NamedSlug | NamedSlug[] | null;
};

type Session = {
  nombre?: string | null;
  duracion?: string | null;
  precio?: number | string | null;
};

type PlanData = {
  slug?: string | null;
  name?: string | null;
  price_monthly_cents?: number | null;
};

type TherapistExtras = {
  therapist_therapies?: TherapyLink[] | null;
  therapist_help_areas?: HelpAreaLink[] | null;
  sessions?: Session[] | null;
  plans?: PlanData | PlanData[] | null;
};

export const Route = createFileRoute("/profesionales/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Mallorca Holística` }],
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
          "*, municipalities(name,slug), plans(slug,name,price_monthly_cents), therapist_therapies(therapies(slug,name)), therapist_help_areas(help_areas(slug,name))",
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
          <Link
            to="/profesionales"
            className="mt-6 inline-flex rounded-full border border-border bg-background px-5 py-2 text-sm hover:bg-muted"
          >
            Ver directorio
          </Link>
        </div>
      </PageShell>
    );
  }

  const extra = data as typeof data & TherapistExtras;
  const therapies = (extra.therapist_therapies ?? [])
    .map((tt) => firstRelation(tt.therapies))
    .filter(Boolean);
  const helpAreas = (extra.therapist_help_areas ?? [])
    .map((th) => firstRelation(th.help_areas))
    .filter(Boolean);
  const sessions = Array.isArray(extra.sessions) ? extra.sessions : [];
  const name = data.full_name ?? "";
  const contactName = firstName(name);
  const canShowDirectContact = planSupportsDirectContact(firstRelation(extra.plans));
  const hasContactActions =
    canShowDirectContact && (data.whatsapp || data.link_reserva || data.website);
  const hasMap = data.lat != null && data.lng != null;

  return (
    <PageShell>
      <article className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        <Link
          to="/profesionales"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Profesionales
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[0.82fr,1.18fr] md:items-start md:gap-14">
          <aside>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
              {data.photo_url ? (
                <img
                  src={data.photo_url}
                  alt={data.full_name}
                  className="h-full w-full object-cover"
                />
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

            <div className="mt-5 rounded-3xl border border-border bg-card p-5 text-center">
              <div className="flex justify-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Opiniones verificadas próximamente
              </p>
            </div>
          </aside>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {data.especialidad}
            </div>
            <h1 className="font-display mt-2 text-4xl md:text-5xl">{data.full_name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {data.verified && (
                <details className="group relative">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                    <BadgeCheck className="h-4 w-4" />
                    Perfil verificado
                    <Info className="h-3.5 w-3.5" />
                  </summary>
                  <div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-border bg-popover p-4 text-left text-xs leading-relaxed text-popover-foreground shadow-lg">
                    <p className="font-medium">Perfil verificado por Mallorca Holística</p>
                    <p className="mt-2 text-muted-foreground">
                      Este profesional ha aportado formación, experiencia profesional, seguro de
                      responsabilidad civil y adhesión al código deontológico.
                    </p>
                  </div>
                </details>
              )}
              {data.municipalities?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {data.municipalities.name}
                </span>
              )}
              {data.modalities && data.modalities.length > 0 && (
                <span className="capitalize">{data.modalities.join(" · ")}</span>
              )}
              {data.years_experience && <span>{data.years_experience} años de experiencia</span>}
            </div>

            {data.frase_clave && (
              <p className="mt-8 font-display text-2xl italic leading-snug text-foreground/75">
                "{data.frase_clave}"
              </p>
            )}

            <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-7">
              <h2 className="font-display text-2xl">Da el primer paso hacia tu bienestar</h2>
              {hasContactActions ? (
                <>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {data.link_reserva && (
                      <Button asChild>
                        <a href={data.link_reserva} target="_blank" rel="noopener">
                          <Calendar className="h-4 w-4" /> Solicitar sesión
                        </a>
                      </Button>
                    )}
                    {data.whatsapp && (
                      <Button asChild variant="whatsapp">
                        <a
                          href={whatsappHref(data.whatsapp, contactName)}
                          target="_blank"
                          rel="noopener"
                        >
                          <MessageCircle className="h-4 w-4" /> Hablar con {contactName}
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
                  <p className="mt-4 text-sm text-muted-foreground">
                    Consulta disponibilidad directamente con {contactName}.
                  </p>
                </>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Este perfil forma parte del ecosistema Mallorca Holística. Pronto habrá más formas
                  de contacto visibles según el plan del profesional.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-[1.1fr,0.9fr]">
          {data.sobre_mi && <Section title="Sobre mí">{data.sobre_mi}</Section>}
          {helpAreas.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Te acompaño en
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {helpAreas.map((h) => (
                  <span
                    key={h.slug}
                    className="rounded-full bg-muted px-3.5 py-1.5 text-sm text-foreground/80"
                  >
                    {h.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          {therapies.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Terapias</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {therapies.map((t) => (
                  <span
                    key={t.slug}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Sesiones</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                {sessions.map((session, index) => (
                  <li key={session.nombre ?? index}>
                    {session.nombre}
                    {session.duracion ? ` (${session.duracion})` : ""}
                    {session.precio ? ` — ${session.precio}€` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(data.formacion || data.experiencia) && (
          <details className="mt-14 rounded-3xl border border-border bg-card p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <span className="font-display text-2xl">Formación y trayectoria</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </summary>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              {data.formacion && <Section title="Formación">{data.formacion}</Section>}
              {data.experiencia && <Section title="Experiencia">{data.experiencia}</Section>}
            </div>
          </details>
        )}

        {hasMap && (
          <div className="mt-14 rounded-3xl border border-border bg-secondary/30 p-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Mapa</h3>
            <div className="mt-4 flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-background text-sm text-muted-foreground">
              Ubicación aproximada en Mallorca
            </div>
          </div>
        )}
      </article>
    </PageShell>
  );
}

function firstName(fullName?: string | null) {
  return fullName?.split(" ")[0] ?? "este profesional";
}

function whatsappHref(phone: string, name: string) {
  const number = phone.replace(/[^0-9]/g, "");
  const message = `Hola ${name}, te he encontrado en Mallorca Holística. Me gustaría saber cómo puedes ayudarme y consultar tu disponibilidad. Gracias`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
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
