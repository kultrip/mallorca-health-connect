import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Clock, Heart, Leaf, MapPin, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import heroImg from "@/assets/hero-branch.jpg";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatTimeRange, inferCategory } from "@/features/activities/activity-utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

const activitiesSearchSchema = z.object({
  includePast: z.boolean().optional().catch(false),
});

export const Route = createFileRoute("/activities")({
  validateSearch: (search) => activitiesSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Actividades en Mallorca — Mallorca Holística" },
      {
        name: "description",
        content: "Talleres, retiros, formaciones y encuentros vinculados al bienestar en Mallorca.",
      },
    ],
  }),
  component: Page,
});

const categories = [
  "Todas",
  "Yoga",
  "Retiros",
  "Sonido",
  "Reiki",
  "Formación",
  "Talleres",
  "Online",
];

function Page() {
  const [category, setCategory] = useState("Todas");
  const { includePast } = Route.useSearch();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("therapists")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: activities = [], isLoading } = useQuery<ActivityRow[]>({
    queryKey: ["public-activities", therapist?.id, includePast],
    queryFn: async () => {
      let query = supabase
        .from("activities")
        .select("*");

      if (!includePast) {
        query = query.gte("starts_at", new Date().toISOString());
      }

      const { data, error } = await query.order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ActivityRow[];
    },
  });

  const filtered = useMemo(() => {
    const base = activities.filter(
      (activity) =>
        activity.status === "published" ||
        (therapist?.id && activity.therapist_id === therapist.id),
    );
    if (category === "Todas") return base;
    return base.filter(
      (activity) => inferCategory(activity).toLowerCase() === category.toLowerCase(),
    );
  }, [activities, therapist?.id, category]);

  return (
    <PageShell>
      <main className="bg-[#fff9f1]">
        <section className="mx-auto max-w-[1180px] px-6 pb-10 pt-14 text-center md:px-10 md:pt-20">
          <h1 className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none text-[#1f3326]">
            Actividades en Mallorca
          </h1>
          <div className="mx-auto my-6 flex w-28 items-center justify-center gap-2 text-[#b48752]">
            <span className="h-px flex-1 bg-current" />
            <Leaf className="h-4 w-4" />
            <span className="h-px flex-1 bg-current" />
          </div>
          <p className="text-lg text-[#342b22]">
            Encuentra experiencias que nutren cuerpo, mente y espíritu.
          </p>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 pb-8 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                  category === item
                    ? "border-[#526046] bg-[#526046] text-white"
                    : "border-[#d9c5aa] bg-white/60 text-[#342b22] hover:bg-[#f4ede6]"
                }`}
              >
                {item}
              </button>
            ))}
            <Link
              to="/activities/new"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#d9c5aa] bg-white/70 px-5 py-2 text-sm text-[#342b22] hover:bg-[#f4ede6]"
            >
              <Plus className="h-4 w-4" /> Publicar mi evento
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
          {isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-[1.4rem]" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-5">
              {filtered.map((activity) => (
                <ActivityListCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[#d9c5aa] bg-white/58 p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-[#9a7041]" />
              {category !== "Todas" && activities.length > 0 ? (
                <>
                  <h2 className="mt-4 font-display text-3xl text-[#1f3326]">
                    No hay actividades de {category} actualmente.
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5d5144]">
                    Explora otras categorías o vuelve a ver el programa completo para descubrir todas las experiencias de bienestar disponibles.
                  </p>
                  <Button
                    onClick={() => setCategory("Todas")}
                    className="mt-6 rounded-full bg-[#526046] text-white hover:bg-[#435039] cursor-pointer"
                  >
                    Ver todas las actividades
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="mt-4 font-display text-3xl text-[#1f3326]">
                    Estamos preparando nuevas actividades.
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#5d5144]">
                    Muy pronto encontrarás talleres, retiros, formaciones y encuentros publicados por la
                    comunidad.
                  </p>
                  <Button
                    asChild
                    className="mt-6 rounded-full bg-[#526046] text-white hover:bg-[#435039] cursor-pointer"
                  >
                    <Link to="/activities/new">Publicar una actividad</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="mt-8 rounded-[1.4rem] border border-[#eadfce] bg-[#fffaf4] p-6 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ede6] text-[#9a7041]">
                <Leaf className="h-7 w-7" />
              </span>
              <div>
                <h2 className="font-display text-2xl text-[#1f3326]">
                  ¿Tienes un evento que quieres compartir?
                </h2>
                <p className="mt-1 text-sm text-[#5d5144]">
                  Completa el formulario y lo revisaremos con cariño.
                </p>
              </div>
            </div>
            <Link
              to="/activities/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#d9c5aa] px-5 py-2 text-sm text-[#342b22] hover:bg-[#f4ede6] md:mt-0"
            >
              Publicar mi evento <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function ActivityListCard({ activity }: { activity: ActivityRow }) {
  const start = activity.starts_at ? new Date(activity.starts_at) : null;
  const category = inferCategory(activity);
  const isUnpublished = activity.status !== "published";

  let statusLabel = "";
  let statusStyles = "";
  if (isUnpublished) {
    if (activity.status === "pending") {
      statusLabel = "Pendiente de moderación";
      statusStyles = "bg-[#9a7041]/15 text-[#9a7041] border-[#9a7041]/20";
    } else if (activity.status === "draft") {
      statusLabel = "Borrador";
      statusStyles = "bg-gray-100 text-gray-600 border-gray-200";
    } else {
      statusLabel = "No publicado";
      statusStyles = "bg-amber-100 text-amber-800 border-amber-200";
    }
  }

  return (
    <article className="grid overflow-hidden rounded-[1.4rem] border border-[#eadfce] bg-white/72 shadow-[0_14px_45px_rgba(96,68,31,0.08)] md:grid-cols-[280px_90px_1fr]">
      <div className="relative h-56 md:h-full">
        <img
          src={activity.image_url || heroImg}
          alt={activity.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <span className="rounded-full bg-[#526046] px-3 py-1 text-[11px] font-bold uppercase text-white shadow-sm w-fit">
            {category}
          </span>
          {isUnpublished && (
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold shadow-sm w-fit ${statusStyles}`}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center border-b border-[#eadfce] p-5 text-center md:border-b-0 md:border-r">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6d5b43]">
            {start ? weekday(start) : "Próx."}
          </p>
          <p className="font-display text-4xl text-[#1f3326]">{start ? day(start) : "--"}</p>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6d5b43]">
            {start ? month(start) : ""}
          </p>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl text-[#1f3326]">{activity.title}</h2>
          <Heart className="h-5 w-5 shrink-0 text-[#9a7041]" />
        </div>
        <div className="mt-4 space-y-2 text-sm text-[#5d5144]">
          <p className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> {formatTimeRange(activity)}
          </p>
          {activity.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {activity.location}
            </p>
          )}
        </div>
        {activity.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-[#342b22]">
            {activity.description}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">{formatPrice(activity.price_cents)}</span>
          <Link
            to="/activities/$slug"
            params={{ slug: activity.slug }}
            className="rounded-full border border-[#9d8d76] px-5 py-2 text-sm text-[#342b22] hover:bg-[#f4ede6]"
          >
            Más información
          </Link>
        </div>
      </div>
    </article>
  );
}

function weekday(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(date).replace(".", "");
}

function day(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date);
}

function month(date: Date) {
  return new Intl.DateTimeFormat("es-ES", { month: "short" }).format(date).replace(".", "");
}
