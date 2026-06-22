import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Euro,
  Heart,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect } from "react";

import heroImg from "@/assets/hero-branch.jpg";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDateLong,
  formatPrice,
  formatTimeRange,
  inferCategory,
} from "@/features/activities/activity-utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { trackAnalyticsEventSoon } from "@/lib/analytics";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export const Route = createFileRoute("/activities_/$slug")({
  component: ActivityDetailPage,
});

function ActivityDetailPage() {
  const { slug } = Route.useParams();
  const { data: activity, isLoading } = useQuery<ActivityRow | null>({
    queryKey: ["activity", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data as ActivityRow | null;
    },
  });

  useEffect(() => {
    if (activity?.id) {
      trackAnalyticsEventSoon({ eventType: "activity_view", activityId: activity.id });
    }
  }, [activity?.id]);

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-10">
          <Skeleton className="h-96 rounded-[1.6rem]" />
        </div>
      </PageShell>
    );
  }

  if (!activity) {
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center md:px-10">
          <h1 className="font-display text-3xl">No encontramos esta actividad.</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/activities">Ver actividades</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const category = inferCategory(activity);

  return (
    <PageShell>
      <main className="bg-[#fff9f1]">
        <section className="mx-auto max-w-[1180px] px-6 pb-24 pt-10 md:px-10">
          <div className="mb-7 flex items-center gap-2 text-sm text-[#6d5b43]">
            <Link to="/" className="hover:text-[#1f3326]">
              Inicio
            </Link>
            <span>›</span>
            <Link to="/activities" className="hover:text-[#1f3326]">
              Actividades
            </Link>
            <span>›</span>
            <span className="font-medium text-[#1f3326]">{activity.title}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <div className="relative min-h-[420px] overflow-hidden rounded-[1.6rem]">
                <img
                  src={activity.image_url || heroImg}
                  alt={activity.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62),rgba(0,0,0,0.18))]" />
                <div className="relative flex min-h-[420px] flex-col justify-end p-8 text-white md:p-12">
                  <span className="mb-5 w-fit rounded-full bg-[#526046] px-3 py-1 text-xs font-bold uppercase">
                    {category}
                  </span>
                  <h1 className="font-display text-[clamp(3rem,6vw,5.8rem)] leading-none text-white">
                    {activity.title}
                  </h1>
                  {activity.description && (
                    <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
                      {firstParagraph(activity.description)}
                    </p>
                  )}
                </div>
              </div>

              <InfoPanel title="Sobre la actividad">
                <p className="whitespace-pre-line text-sm leading-8 text-[#342b22]">
                  {activity.description ??
                    "Pronto añadiremos más información sobre esta actividad."}
                </p>
              </InfoPanel>

              <InfoPanel title="¿Qué beneficios aporta?">
                <ul className="grid gap-3 text-sm text-[#342b22] md:grid-cols-2">
                  {[
                    "Reduce el estrés y la ansiedad",
                    "Mejora la calidad del descanso",
                    "Libera bloqueos emocionales",
                    "Armoniza cuerpo, mente y espíritu",
                    "Aumenta la energía y vitalidad",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Leaf className="mt-0.5 h-4 w-4 text-[#9a7041]" /> {item}
                    </li>
                  ))}
                </ul>
              </InfoPanel>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[1.4rem] bg-[#f4ede6] p-7">
                <Meta
                  icon={CalendarDays}
                  label="Fecha"
                  value={formatDateLong(activity.starts_at)}
                />
                <Meta icon={Clock} label="Horario" value={formatTimeRange(activity)} />
                {activity.location && (
                  <Meta icon={MapPin} label="Lugar" value={activity.location} />
                )}
                <Meta icon={Euro} label="Precio" value={formatPrice(activity.price_cents)} />

                {activity.link_reserva && (
                  <Button
                    asChild
                    className="mt-7 w-full rounded-full bg-[#526046] text-white hover:bg-[#435039]"
                  >
                    <a
                      href={activity.link_reserva}
                      target="_blank"
                      rel="noopener"
                      onClick={() =>
                        trackAnalyticsEventSoon({
                          eventType: "activity_contact_click",
                          activityId: activity.id,
                          metadata: { channel: "reservation" },
                        })
                      }
                    >
                      Reservar mi plaza
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="mt-3 w-full rounded-full bg-white/40">
                  <Heart className="h-4 w-4" /> Añadir a favoritos
                </Button>
              </section>

              <InfoPanel title="Incluye">
                <ul className="space-y-3 text-sm text-[#342b22]">
                  {["Acompañamiento personalizado", category, "Espacio cuidado"].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Leaf className="h-4 w-4 text-[#9a7041]" /> {item}
                    </li>
                  ))}
                </ul>
              </InfoPanel>

              <InfoPanel title="Facilitador">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1f1c18]">
                      {activity.facilitator_name || "Mallorca Holística"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5d5144]">
                      Acompaña procesos de bienestar a través de experiencias conscientes.
                    </p>
                  </div>
                </div>
              </InfoPanel>
            </aside>
          </div>

          <section className="mt-8 rounded-[1.6rem] border border-[#eadfce] bg-[#fffaf4] p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-[#9a7041]" />
            <h2 className="mt-4 font-display text-3xl text-[#1f3326]">
              ¿Tienes dudas o quieres reservar tu plaza?
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#342b22]">
              {activity.whatsapp && (
                <a
                  className="inline-flex items-center gap-2"
                  href={`https://wa.me/${activity.whatsapp.replace(/[^0-9]/g, "")}`}
                >
                  <MessageCircle className="h-4 w-4" /> {activity.whatsapp}
                </a>
              )}
              {activity.email && (
                <a className="inline-flex items-center gap-2" href={`mailto:${activity.email}`}>
                  <Mail className="h-4 w-4" /> {activity.email}
                </a>
              )}
            </div>
          </section>
        </section>
      </main>
    </PageShell>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.4rem] border border-[#eadfce] bg-white/72 p-7">
      <h2 className="font-display text-2xl text-[#1f3326]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="mb-5 flex gap-4 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-[#9a7041]" />
      <div>
        <p className="text-xs text-[#6d5b43]">{label}</p>
        <p className="mt-1 font-medium text-[#342b22]">{value}</p>
      </div>
    </div>
  );
}

function firstParagraph(value: string) {
  return value.split(/\n+/)[0] ?? value;
}
