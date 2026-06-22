import { Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake } from "lucide-react";

export function HomeTrustStrip() {
  return (
    <section className="mx-auto max-w-[1040px] px-6 pb-12 md:px-10 md:pb-16">
      <div className="grid gap-6 border-b border-[#e8d9c6] pb-12 md:grid-cols-[auto_1fr_auto] md:items-center md:pb-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#eadfce] bg-[#fbf3e9] text-[#9a7041]">
          <HeartHandshake className="h-8 w-8" strokeWidth={1.25} />
        </div>
        <div>
          <h2 className="font-display text-2xl text-[#1f3326] md:text-3xl">
            Aquí estás en buenas manos
          </h2>
          <p className="mt-3 max-w-[580px] text-[15px] leading-7 text-[#342b22]">
            Profesionales verificados, terapias integrativas y un enfoque humano, para acompañarte
            en tu camino de bienestar.
          </p>
        </div>
        <Link
          to="/trust"
          className="inline-flex items-center gap-3 text-sm font-medium text-[#7a5730] underline-offset-4 hover:underline"
        >
          Saber más sobre nosotros
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
