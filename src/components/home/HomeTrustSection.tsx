import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Award, Scale, UserSearch } from "lucide-react";
import realStonesImg from "@/assets/real-stones.png";

export function HomeTrustSection() {
  return (
    <section id="trust-section" className="relative overflow-hidden bg-[#f7ede2] border-t border-[#eadfce]/40 px-6 py-16 md:px-10 md:py-24">
      {/* Background ambient lighting/glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.45)_0%,transparent_100%)] pointer-events-none opacity-80" />

      <div className="mx-auto max-w-[1140px] relative z-10">
        {/* Main upper content block: Split into Stones Illustration and Text Description */}
        <div className="grid gap-12 lg:grid-cols-[400px_1fr] lg:items-center">
          
          {/* Left Column: Real Balanced Stones with Olive Leaves */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[320px] md:max-w-[360px] overflow-hidden select-none pointer-events-none">
              <img
                src={realStonesImg}
                alt="Piedras equilibradas reales"
                className="w-full h-auto object-contain mix-blend-multiply opacity-[0.95]"
              />
            </div>
          </div>

          {/* Right Column: Title & Text Block */}
          <div className="flex flex-col items-start text-left lg:pl-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#eadfce] bg-white/60 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a7041] mb-5">
              Confianza y Calidez
            </span>
            
            <h2 className="font-display text-[clamp(2.1rem,4.5vw,3.2rem)] leading-[1.08] text-[#1f3326] font-bold">
              Aquí estás en buenas manos
            </h2>
            
            <p className="mt-5 text-[15px] leading-8 text-[#4d443b] max-w-[620px]">
              Cada detalle de Mallorca Holística ha sido pensado para que puedas explorar con calma, comprender mejor tus opciones y elegir con confianza.
            </p>

            <Link
              to="/trust"
              className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold tracking-wider uppercase text-[#8e774f] hover:text-[#526046] transition-all group"
            >
              Cómo verificamos los perfiles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
        </div>

        {/* 4-Column Grid of Pillars */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#eadfce]/50 pt-16">
          {/* Pillar 1 */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8e774f] shadow-[0_4px_12px_rgba(142,119,79,0.08)]">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <h3 className="mt-5 font-display text-[18px] font-bold text-[#1f3326]">
              Perfiles revisados
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6e5e50]">
              Para ofrecerte una experiencia más cuidada desde el primer momento.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:border-l sm:border-[#eadfce]/50 sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8e774f] shadow-[0_4px_12px_rgba(142,119,79,0.08)]">
              <Award className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <h3 className="mt-5 font-display text-[18px] font-bold text-[#1f3326]">
              Profesionales verificados
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6e5e50]">
              Quienes cuentan con el sello de verificación han acreditado su formación y trayectoria.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left lg:border-l lg:border-[#eadfce]/50 lg:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8e774f] shadow-[0_4px_12px_rgba(142,119,79,0.08)]">
              <Scale className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <h3 className="mt-5 font-display text-[18px] font-bold text-[#1f3326]">
              Código Deontológico
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6e5e50]">
              Un compromiso compartido con el respeto, la ética y el cuidado de las personas.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:border-l sm:border-[#eadfce]/50 sm:px-8 lg:px-8 lg:pl-8 lg:pr-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#8e774f] shadow-[0_4px_12px_rgba(142,119,79,0.08)]">
              <UserSearch className="h-6 w-6" strokeWidth={1.4} />
            </div>
            <h3 className="mt-5 font-display text-[18px] font-bold text-[#1f3326]">
              Transparencia
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-[#6e5e50]">
              Toda la información relevante está visible para que puedas elegir con confianza.
            </p>
          </div>
          
        </div>
      </div>
    </section>
  );
}
