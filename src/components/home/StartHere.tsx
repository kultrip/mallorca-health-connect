import { Link } from "@tanstack/react-router";
import { Users, Calendar, Compass, ArrowUpRight } from "lucide-react";

const items = [
  {
    to: "/profesionales",
    title: "Profesionales",
    desc: "Encuentra terapeutas verificados cerca de ti.",
    icon: Users,
  },
  {
    to: "/actividades",
    title: "Actividades",
    desc: "Talleres, retiros y encuentros en la isla.",
    icon: Calendar,
  },
  {
    to: "/terapias",
    title: "Descubrir",
    desc: "Una guía clara de terapias y en qué pueden ayudarte.",
    icon: Compass,
  },
] as const;

export function StartHere() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
      <div className="mb-10 flex items-end justify-between gap-6">
        <h2>Empieza por aquí</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-8 transition-colors hover:bg-muted/40"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
            <div className="mt-8 inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors group-hover:text-foreground">
              Explorar
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
