import heroImg from "@/assets/hero-branch-transparent.png";
import { SearchBar } from "@/components/search/SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbf5ec]">
      <div className="absolute inset-y-0 right-0 hidden w-[55%] overflow-hidden bg-[#7f6855] md:block">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover object-[65%_center] opacity-100"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fbf5ec_0%,rgba(251,245,236,0.85)_15%,rgba(251,245,236,0)_40%)]" />
        <div className="absolute inset-y-0 left-0 w-28 bg-[linear-gradient(90deg,#fbf5ec,rgba(251,245,236,0))]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,rgba(251,245,236,0),#fffaf3)] pointer-events-none" />

      <div className="relative mx-auto flex min-h-[520px] max-w-[1320px] flex-col justify-between gap-10 px-6 py-12 md:px-10 md:py-16 lg:min-h-[580px]">
        <div className="max-w-[620px] z-10">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a42]">
            Bienestar verificado en Mallorca
          </p>
          <h1 className="font-display text-[clamp(2.7rem,4.8vw,4.4rem)] leading-[1.05] text-[#1f3326]">
            Encuentra un cuidado que se sienta humano.
          </h1>

          <div className="my-6 h-px w-16 bg-[#b99a6e]" />

          <p className="max-w-[480px] text-[15px] leading-8 text-[#3b332b]">
            Profesionales, terapias y espacios de bienestar elegidos con calma, criterio y
            sensibilidad. Un lugar para orientarte sin prisa.
          </p>
        </div>

        <div className="relative z-10 w-full overflow-hidden rounded-[1.4rem] border border-[#eadfce] bg-[#7f6855] md:hidden">
          <img src={heroImg} alt="" className="aspect-[1.5/1] w-full object-cover object-center opacity-100" />
        </div>

        <div className="relative z-10 w-full max-w-[1320px] mt-2 md:mt-4">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}


