import heroImg from "@/assets/hero-branch.jpg";
import { SearchBar } from "@/components/search/SearchBar";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
      </div>

      <div className="mx-auto max-w-[1180px] px-6 pb-12 pt-44 md:px-10 md:pb-24 md:pt-56">
        <div className="max-w-3xl">
          <h1 className="font-display text-foreground">
            Encuentra tu bienestar<br />en Mallorca
          </h1>
          <p className="mt-5 max-w-xl text-base text-foreground/80 md:text-lg">
            Profesionales verificados en terapias naturales y complementarias.
          </p>
        </div>

        <div className="mt-10 max-w-3xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
