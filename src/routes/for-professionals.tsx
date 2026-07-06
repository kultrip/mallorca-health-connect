import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/for-professionals")({
  head: () => ({
    meta: [
      { title: "Soy profesional — Mallorca Holística" },
      {
        name: "description",
        content:
          "Forma parte del ecosistema Mallorca Holística. Visibilidad humana y respetuosa para profesionales del bienestar.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[1180px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
        
        {/* Main Header Title */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl md:text-4xl">🌿</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Forma parte de Mallorca Holística
          </h1>
        </div>

        {/* Intro Block: FORMA PARTE DE MALLORCA HOLÍSTICA */}
        <div className="rounded-3xl border border-dashed border-border bg-[#fffaf5]/40 p-8 md:p-10 mb-16 shadow-sm max-w-4xl">
          <span className="text-xs font-bold tracking-widest text-[#526046] uppercase block mb-4">
            Forma parte de Mallorca Holística
          </span>
          <div className="space-y-4 text-base text-foreground/90 leading-relaxed font-sans">
            <p>
              Mallorca Holística reúne a profesionales de la salud complementaria e integrativa, centros y organizaciones que comparten una visión más integradora, humana y consciente del bienestar y del acompañamiento a las personas.
            </p>
            <p>
              Cada profesional, cada centro y cada organización aportan una mirada única. Juntos formamos una comunidad basada en la confianza, la profesionalidad y el compromiso.
            </p>
            <p className="font-medium text-[#526046]">
              Descubre qué ofrece cada plan y elige el que mejor se adapte a tu actividad.
            </p>
          </div>
        </div>

        {/* Plans Section Title */}
        <div className="mb-10">
          <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase block mb-3 flex items-center gap-1.5">
            ⭐ Elige el plan que mejor se adapte a tu actividad
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          
          {/* Plan Presencia */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <h3 className="font-display text-xl font-bold text-foreground">Plan Presencia</h3>
              </div>
              
              <div className="mt-4">
                <span className="text-2xl font-bold text-foreground block">Gratuito</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full inline-block mt-2">
                  Acceso libre
                </span>
              </div>
              
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground font-sans">
                Para profesionales de la salud complementaria e integrativa que desean dar visibilidad a su actividad y empezar a formar parte de Mallorca Holística.
              </p>
            </div>

            <div className="mt-8 pt-4">
              <Button asChild className="w-full bg-transparent border border-[#526046]/40 hover:bg-[#526046]/5 text-[#526046] rounded-xl font-medium" variant="outline">
                <Link to="/plan-presencia">
                  👉 Descubrir el plan
                </Link>
              </Button>
            </div>
          </div>

          {/* Plan Profesional Verificado */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h3 className="font-display text-xl font-bold text-foreground">Plan Profesional Verificado</h3>
              </div>
              
              <div className="mt-4 space-y-2">
                <span className="text-2xl font-bold text-foreground block">25 €/mes <span className="text-sm font-normal text-muted-foreground">(IVA incluido)</span></span>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  ✨ 2 meses gratuitos por lanzamiento
                </div>
                <div className="text-[11px] font-medium text-[#526046] uppercase tracking-wider block pt-1">
                  Acceso mediante verificación profesional
                </div>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-sans">
                Para profesionales de la salud complementaria e integrativa que desean reforzar la confianza que transmiten, aumentar su visibilidad y acceder a funcionalidades avanzadas.
              </p>
            </div>

            <div className="mt-8 pt-4">
              <Button asChild className="w-full bg-[#526046] hover:bg-[#434f3a] text-white rounded-xl font-medium">
                <Link to="/profesional-fundador">
                  👉 Descubrir el plan
                </Link>
              </Button>
            </div>
          </div>

          {/* Plan Centros & Organizadores */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h3 className="font-display text-xl font-bold text-foreground">Plan Centros & Organizadores</h3>
              </div>
              
              <div className="mt-4 space-y-2">
                <span className="text-2xl font-bold text-foreground block">50 €/mes <span className="text-sm font-normal text-muted-foreground">(IVA incluido)</span></span>
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  ✨ 2 meses gratuitos por lanzamiento
                </div>
                <div className="text-[11px] font-medium text-[#526046] uppercase tracking-wider block pt-1">
                  Acceso mediante identificación de la entidad
                </div>
              </div>
              
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-sans">
                Para centros, escuelas, asociaciones y otras entidades relacionadas con la salud complementaria e integrativa que desean dar mayor visibilidad a su proyecto y a las actividades que organizan.
              </p>
            </div>

            <div className="mt-8 pt-4">
              <Button asChild className="w-full bg-transparent border border-[#526046]/40 hover:bg-[#526046]/5 text-[#526046] rounded-xl font-medium" variant="outline">
                <Link to="/comunidad-fundadora-organizaciones">
                  👉 Descubrir el plan
                </Link>
              </Button>
            </div>
          </div>

        </div>

        {/* Comunidad Fundadora Callout Banner */}
        <div className="rounded-3xl border border-primary/20 bg-[#fdf5eb] p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 opacity-5 pointer-events-none">
            <Award className="h-64 w-64 text-primary" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              🌿 Comunidad Fundadora
            </span>
            
            <h2 className="font-display mt-4 text-2xl md:text-3xl text-foreground font-bold">
              ¿Has recibido una invitación?
            </h2>
            
            <p className="mt-3.5 text-sm md:text-base leading-relaxed text-muted-foreground font-sans">
              Si has recibido una invitación personal para formar parte de la Comunidad Fundadora de Mallorca Holística, puedes acceder aquí para activar tus condiciones especiales.
            </p>

            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="bg-[#526046] hover:bg-[#434f3a] text-[#fffaf3] rounded-xl px-8 shadow-sm">
                <Link to="/comunidad-fundadora-acceso" className="flex items-center gap-2">
                  👉 Acceder con mi invitación <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
