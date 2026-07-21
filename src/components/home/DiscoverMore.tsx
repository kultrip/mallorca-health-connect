import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, BookOpen, Compass } from "lucide-react";

export function DiscoverMore() {
  return (
    <section className="bg-[#fffdf9] py-16 md:py-24 border-t border-[#eadfce]/30">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        
        {/* Title */}
        <div className="mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6a42]">
            Explora más
          </span>
          <h2 className="mt-2 font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight text-[#1f3326] font-bold">
            Descubre también
          </h2>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Card 1: Agenda de Actividades */}
          <div className="rounded-[2.5rem] bg-[#f9f3e6] p-8 flex flex-col justify-between border border-[#eadfce]/40 hover:border-[#8b6a42]/30 shadow-[0_4px_20px_rgba(142,119,79,0.02)] hover:shadow-[0_10px_25px_rgba(142,119,79,0.05)] transition-all duration-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8b6a42] shadow-sm mb-6">
                <Calendar className="h-6 w-6" strokeWidth={1.4} />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1f3326]">
                Agenda de Actividades
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#5c5043]">
                Talleres, retiros, clases y encuentros que nutren cuerpo, mente y alma.
              </p>
            </div>
            <Link
              to="/activities"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase text-[#8b6a42] group-hover:text-[#526046] transition-colors"
            >
              Ver agenda
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 2: Guía de terapias */}
          <div className="rounded-[2.5rem] bg-[#eff2eb] p-8 flex flex-col justify-between border border-[#eadfce]/40 hover:border-[#526046]/30 shadow-[0_4px_20px_rgba(142,119,79,0.02)] hover:shadow-[0_10px_25px_rgba(142,119,79,0.05)] transition-all duration-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#526046] shadow-sm mb-6">
                <Compass className="h-6 w-6" strokeWidth={1.4} />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1f3326]">
                Guía de terapias
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#525a4c]">
                Descubre las terapias y prácticas que pueden acompañarte.
              </p>
            </div>
            <Link
              to="/therapies"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase text-[#526046] group-hover:text-[#435039] transition-colors"
            >
              Explorar guía
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Card 3: Artículos de Inspiración */}
          <div className="rounded-[2.5rem] bg-[#edf2f6] p-8 flex flex-col justify-between border border-[#eadfce]/40 hover:border-[#4a5f6e]/30 shadow-[0_4px_20px_rgba(142,119,79,0.02)] hover:shadow-[0_10px_25px_rgba(142,119,79,0.05)] transition-all duration-300 group">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4a5f6e] shadow-sm mb-6 relative">
                <BookOpen className="h-6 w-6" strokeWidth={1.4} />
                <span className="absolute -top-1.5 -right-1.5 bg-[#4a5f6e] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Blog
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1f3326]">
                Inspiración y Recursos
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[#4b5563]">
                Lecturas, entrevistas y recursos para tu bienestar y crecimiento continuo.
              </p>
            </div>
            <span
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase text-[#4a5f6e] group-hover:text-[#1f3326] cursor-not-allowed transition-colors"
            >
              Muy pronto
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
