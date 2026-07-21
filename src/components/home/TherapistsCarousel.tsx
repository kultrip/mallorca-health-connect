import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TherapistItem {
  id: string;
  slug: string;
  full_name: string;
  especialidad: string;
  city: string;
  photo_url: string | null;
  verified: boolean;
  frase_clave?: string | null;
}

export function TherapistsCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: dbTherapists } = useQuery<TherapistItem[]>({
    queryKey: ["home-featured-therapists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("therapists")
        .select("id, slug, full_name, especialidad, city, photo_url, verified, frase_clave")
        .eq("status", "published")
        .limit(10);
      if (error) return [];
      return (data as any) ?? [];
    },
  });

  const therapists = dbTherapists ?? [];

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-[#fffdf9] py-16 md:py-24 border-t border-[#eadfce]/30 overflow-hidden">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6a42]">
              Comunidad de Cuidado
            </span>
            <h2 className="mt-2 font-display text-[clamp(2rem,4vw,2.8rem)] leading-tight text-[#1f3326] font-bold">
              Personas que acompañan a personas
            </h2>
            <p className="mt-2 text-[15px] text-[#5e5245]">
              Conoce a algunos de los profesionales de nuestra comunidad.
            </p>
          </div>
          
          <Link
            to="/professionals"
            className="inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase text-[#8e774f] hover:text-[#526046] transition-all group"
          >
            Ver todos los profesionales
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Carousel Container Wrapper with navigation arrows */}
        <div className="relative group">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            aria-label="Desplazar a la izquierda"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#5c4f41] shadow-md hover:bg-[#fbf5ec] hidden md:flex transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            aria-label="Desplazar a la derecha"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-white text-[#5c4f41] shadow-md hover:bg-[#fbf5ec] hidden md:flex transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Horizontal Scroller */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 pt-2 px-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                className="w-[280px] md:w-[310px] shrink-0 snap-start rounded-[2rem] border border-[#eadfce]/60 bg-white p-6 shadow-[0_4px_20px_rgba(142,119,79,0.03)] hover:shadow-[0_12px_30px_rgba(142,119,79,0.08)] hover:border-[#8b6a42]/40 transition-all duration-300 flex flex-col items-center text-center group/card"
              >
                {/* Photo frame */}
                <div className="relative h-28 w-28 rounded-full p-1 border-2 border-[#e8d9c6]/80 group-hover/card:border-[#8b6a42]/80 transition-all duration-300 overflow-hidden shrink-0">
                  <div className="h-full w-full rounded-full overflow-hidden bg-[#faf6ee] relative">
                    {therapist.photo_url ? (
                      <img
                        src={therapist.photo_url}
                        alt={therapist.full_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-[#8d6d43]">
                        {therapist.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {therapist.verified && (
                    <span className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-[#526046] fill-[#fffdfa]" strokeWidth={2} />
                    </span>
                  )}
                </div>

                {/* Info */}
                <h3 className="mt-5 font-display text-lg font-bold text-[#1f3326] line-clamp-1">
                  {therapist.full_name}
                </h3>
                
                <span className="mt-1 text-[13px] font-semibold text-[#8b6a42]">
                  {therapist.especialidad}
                </span>
                
                <span className="mt-0.5 text-xs text-[#776c5f]">
                  {therapist.city}
                </span>

                {therapist.frase_clave && (
                  <p className="mt-4 text-[13px] leading-relaxed text-[#5c5043] italic border-t border-[#eadfce]/30 pt-4 w-full">
                    "{therapist.frase_clave}"
                  </p>
                )}

                {/* Action CTA */}
                <Link
                  to={`/professionals/$slug` as any}
                  params={{ slug: therapist.slug }}
                  className="mt-6 inline-flex min-h-9 items-center justify-center rounded-full border border-[#eadfce] bg-transparent px-5 text-xs font-semibold tracking-wide uppercase text-[#5c4f41] group-hover/card:bg-[#526046] group-hover/card:text-white group-hover/card:border-[#526046] transition-all"
                >
                  Ver perfil
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
