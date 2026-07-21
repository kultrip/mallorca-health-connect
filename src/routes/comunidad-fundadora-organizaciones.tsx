import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";

export const Route = createFileRoute("/comunidad-fundadora-organizaciones")({
  head: () => ({
    meta: [
      { title: "Plan Centros y Organizaciones — Mallorca Holística" },
      {
        name: "description",
        content:
          "Descubre el Plan Centros y Organizadores. Visibilidad corporativa, publicaciones de actividades ilimitadas y fichas de equipo en Mallorca.",
      },
    ],
  }),
  component: ComunidadFundadoraOrganizacionesPage,
});

function ComunidadFundadoraOrganizacionesPage() {
  const requirements = [
    {
      id: "1",
      title: "Aceptación del Código Deontológico",
      desc: "Aceptación del Código Deontológico Mallorca Holística.",
    },
    {
      id: "2",
      title: "Identificación documental",
      desc: "Identificación documental de la entidad.",
    },
    {
      id: "3",
      title: "Responsable de la cuenta",
      desc: "Designación de una persona responsable de la cuenta.",
    },
    {
      id: "4",
      title: "Declaración de veracidad",
      desc: "Declaración de veracidad de la información aportada.",
    },
    { id: "5", title: "Política de Privacidad", desc: "Aceptación de la Política de Privacidad." },
    { id: "6", title: "Condiciones de Uso", desc: "Aceptación de las Condiciones de Uso." },
    {
      id: "7",
      title: "Autorización de publicación",
      desc: "Autorización para la publicación del perfil.",
    },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-[700px] px-4 pb-24 pt-8 md:pt-12">
        {/* Wireframe Screen Tag */}
        <div className="text-[10px] md:text-xs tracking-wider text-muted-foreground uppercase font-mono mb-4 text-left select-none">
          PANTALLA - 1d · DETALLE PLAN CENTROS & ORGANIZADORES
        </div>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl md:text-3xl">🌞</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Plan Centros & Organizadores
          </h1>
        </div>

        <div className="space-y-6">
          {/* Section 1: Para quién es */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              ✨ ¿PARA QUIÉN ES?
            </span>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              Para centros, escuelas, asociaciones y otras entidades relacionadas con la salud
              complementaria e integrativa que desean dar mayor visibilidad a su proyecto y a las
              actividades que organizan.
            </p>
          </div>

          {/* Section 2: Qué es el plan */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              🌞 ¿QUÉ ES EL PLAN CENTROS & ORGANIZADORES?
            </span>
            <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              <p>
                El Plan Centros & Organizadores está pensado para entidades que desean dar
                visibilidad a su proyecto, presentar su actividad y compartir su programación dentro
                de Mallorca Holística.
              </p>
              <p>
                Además de disponer de un perfil institucional completo, incorpora herramientas
                específicas para facilitar la gestión de la organización y aumentar su alcance
                dentro del ecosistema.
              </p>
              <div className="pt-2 border-t border-foreground/5 mt-4">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Precio
                </span>
                <span className="text-base font-bold text-foreground">50 €/mes (IVA incluido)</span>
              </div>
              <div className="pt-4 mt-2 border-t border-dashed border-foreground/10 bg-[#526046]/5 rounded-lg p-4">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  Condiciones de fundador
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  Los miembros fundadores pagan 0 EUR hoy y, tras la aprobación, disfrutan 180 días
                  sin cargo con las ventajas premium activas.
                </p>
                <p className="text-xs text-foreground/90 leading-relaxed mt-2">
                  Al finalizar este período, Stripe cargará automáticamente la tarifa fundadora
                  especial, salvo cancelación previa.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 italic">
                  Queremos que dispongas del tiempo suficiente para presentar tu proyecto y dar a
                  conocer tus actividades desde el lanzamiento de Mallorca Holística.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Qué incluye */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-blue-700/90 uppercase block mb-6 font-mono">
              💎 LO QUE INCLUYE
            </span>

            <div className="space-y-8">
              {/* Subsection 1 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Perfil institucional
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Perfil institucional dentro del directorio Mallorca Holística.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Organización Identificada.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Sello de Organización Identificada.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Logotipo o imagen principal.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Presentación ampliada.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Galería de hasta 15 imágenes.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 2 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  Proyecto
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Especialidades y Terapias ilimitadas.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Áreas de Especialización ilimitadas.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Una ubicación principal.</span>
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
                    <span>Aparición prioritaria en el directorio.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Aparición prioritaria en los resultados de búsqueda.</span>
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
                    <span>Teléfono clicable.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>WhatsApp clicable.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Página web clicable.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Redes sociales clicables.</span>
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
                    <span>Acceso al panel de organización.</span>
                  </li>
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>
                      Publicación ilimitada de eventos grupales en la Agenda de Actividades.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Requisitos de registro */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-[#526046] uppercase block mb-4 font-mono">
              🛡️ REQUISITOS
            </span>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 font-sans">
              Para asegurar la máxima rigurosidad y protección de los usuarios, todos los centros
              con Sello de Confianza deben aportar o aceptar las siguientes condiciones durante su
              onboarding:
            </p>

            <div className="space-y-5">
              {requirements.map((r) => (
                <div key={r.id} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold text-foreground">
                    {r.id}
                  </span>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm leading-none">
                      {r.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
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
                  search={{ plan: "centros-organizadores", track: "organizacion" }}
                  className="flex items-center justify-center gap-2"
                >
                  👉 Registrar nuestra entidad <span className="ml-1">→</span>
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
