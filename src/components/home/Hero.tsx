import heroImg from "@/assets/hero-branch.jpg";
import { SearchBar } from "@/components/search/SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbf5ec]">
      <div className="absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden md:block">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover object-center opacity-90"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fbf5ec_0%,rgba(251,245,236,0.82)_18%,rgba(251,245,236,0.26)_58%,rgba(251,245,236,0.10)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-28 bg-[linear-gradient(90deg,#fbf5ec,rgba(251,245,236,0))]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_bottom,rgba(251,245,236,0),#fffaf3)]" />

      <div className="relative mx-auto grid min-h-[520px] max-w-[1320px] items-center gap-10 px-6 py-12 md:grid-cols-[0.92fr_1.08fr] md:px-10 md:py-16 lg:min-h-[560px]">
        <div className="max-w-[560px]">
          <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b6a42]">
            Bienestar verificado en Mallorca
          </p>
          <h1 className="font-display text-[clamp(2.7rem,5vw,4.8rem)] leading-[1.02] text-[#1f3326]">
            Encuentra un cuidado que se sienta humano.
          </h1>

          <div className="my-7 h-px w-16 bg-[#b99a6e]" />

          <p className="max-w-[440px] text-[15px] leading-8 text-[#3b332b]">
            Profesionales, terapias y espacios de bienestar elegidos con calma, criterio y
            sensibilidad. Un lugar para orientarte sin prisa.
          </p>
        </div>

        <div className="relative md:pl-4">
          <div className="mb-5 overflow-hidden rounded-[1.4rem] border border-[#eadfce] md:hidden">
            <img src={heroImg} alt="" className="aspect-[1.65/1] w-full object-cover" />
          </div>
          <div className="max-w-[720px] md:ml-auto">
            <p className="mb-3 text-[12px] text-[#766853]">Busca por terapia, necesidad o zona</p>
            <SearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}
