import { Link } from "@tanstack/react-router";
import { Users, Calendar, Compass, ArrowUpRight } from "lucide-react";

const items = [
  {
    to: "/professionals",
    title: "Profesionales",
    desc: "Encuentra terapeutas verificados cerca de ti.",
    icon: Users,
  },
  {
    to: "/activities",
    title: "Actividades",
    desc: "Talleres, retiros y encuentros en la isla.",
    icon: Calendar,
  },
  {
    to: "/therapies",
    title: "Descubrir",
    desc: "Una guía clara de terapias y en qué pueden ayudarte.",
    icon: Compass,
  },
] as const;

export function StartHere() {
  return (
    <section className="mx-auto max-w-[1040px] px-6 py-16 md:px-10 md:py-22">
      <div className="mb-9 max-w-xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6a42]">
          Explorar con calma
        </p>
        <h2>Empieza por donde te resulte natural</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group relative flex h-full flex-col justify-between border-t border-[#e1d2bf] py-7 transition-colors hover:border-[#b99a6e]"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3eadf] text-[#526046]">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 font-display text-2xl text-[#1f3326]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
            <div className="mt-8 inline-flex items-center gap-1.5 text-sm text-[#6f5433] transition-colors group-hover:text-[#1f3326]">
              Explorar
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
