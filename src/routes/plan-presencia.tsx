import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/plan-presencia")({
  head: () => ({
    meta: [
      { title: "Plan Presencia — Mallorca Holística" },
      {
        name: "description",
        content:
          "Detalles del Plan Presencia. Tu ficha gratuita en el mayor ecosistema de bienestar de Mallorca.",
      },
    ],
  }),
  component: PlanPresenciaPage,
});

function PlanPresenciaPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[700px] px-4 pb-24 pt-8 md:pt-12">
        {/* Wireframe Screen Tag */}
        <div className="text-[10px] md:text-xs tracking-wider text-muted-foreground uppercase font-mono mb-4 text-left select-none">
          PANTALLA - 1b · DETALLE PLAN PRESENCIA
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl md:text-3xl">🌿</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Plan Presencia
          </h1>
        </div>

        <div className="space-y-6">
          {/* Section 1: Para quién es */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              ✨ ¿PARA QUIÉN ES?
            </span>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              Para profesionales de la salud complementaria e integrativa que desean dar visibilidad
              a su actividad y comenzar a formar parte de Mallorca Holística.
            </p>
          </div>

          {/* Section 2: Qué es el plan */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              🌞 ¿QUÉ ES EL PLAN PRESENCIA?
            </span>
            <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              <p>El Plan Presencia es la puerta de entrada a Mallorca Holística.</p>
              <p>
                Permite crear una cuenta, completar un perfil profesional público y comenzar a
                formar parte del ecosistema.
              </p>
              <p>
                Es la forma más sencilla de dar visibilidad a tu actividad profesional y facilitar
                que las personas descubran quién eres y cómo acompañas.
              </p>
            </div>
          </div>

          {/* Section 3: Qué incluye */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-blue-700/90 uppercase block mb-6 font-mono">
              💎 ¿QUÉ INCLUYE?
            </span>

            <div className="space-y-8">
              {/* Subsection 1 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Perfil profesional
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Perfil público dentro del directorio Mallorca Holística.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Fotografía principal.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Presentación profesional.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 2 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Actividad profesional
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Hasta 3 Especialidades y Terapias.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Hasta 5 Áreas de Especialización.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Una ubicación principal.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Modalidades de atención.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Idiomas.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 3 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Visibilidad
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Aparición en el directorio.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Aparición en los resultados de búsqueda.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 4 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Contacto
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Información básica de contacto visible.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 5 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Herramientas
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Acceso al panel profesional.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>
                      Posibilidad de solicitar la publicación ocasional de eventos grupales en la
                      Agenda de Actividades.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Tu perfil puede evolucionar */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-[#526046] uppercase block mb-3 font-mono">
              🌿 TU PERFIL PUEDE EVOLUCIONAR
            </span>
            <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              <p>
                El Plan Presencia puede acompañarte durante todo tu recorrido en Mallorca Holística.
              </p>
              <p>
                Si en el futuro deseas acceder a nuevas funcionalidades, reforzar la confianza que
                transmites o dar mayor visibilidad a tu actividad, podrás solicitar el acceso al
                Plan Profesional Verificado o al Plan Centros & Organizadores.
              </p>
            </div>
          </div>

          {/* Section 5: Acciones */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase block mb-4 font-mono">
              ACCIONES
            </span>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="border-2 border-foreground bg-background hover:bg-foreground/5 text-foreground rounded-lg px-6 font-semibold flex-1 transition-all h-12 shadow-sm text-sm"
              >
                <Link
                  to="/register"
                  search={{ plan: "presencia", track: "presencia" }}
                  className="flex items-center justify-center gap-2"
                >
                  👉 Crear mi cuenta gratuita <span className="ml-1">→</span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="border-2 border-dashed border-foreground/30 bg-transparent hover:bg-foreground/5 text-foreground rounded-lg px-6 font-semibold flex-1 transition-all h-12 text-sm"
              >
                <Link to="/for-professionals" className="flex items-center justify-center gap-2">
                  ← Volver a planes
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
