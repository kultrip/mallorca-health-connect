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
    { id: "1", title: "Identificación Legal de la Entidad", desc: "Nombre comercial, razón social, NIF/CIF o documento identificativo correspondiente de la entidad mercantil o asociación." },
    { id: "2", title: "Designación de Gestor Responsable", desc: "Identificación (nombre, cargo, correo y teléfono) de la persona física responsable de gestionar y representar la cuenta del centro." },
    { id: "3", title: "Declaración de Potestad de Representación", desc: "Declaración jurada digital de que la persona gestora tiene la autoridad legal o delegada para actuar en nombre de la entidad." },
    { id: "4", title: "Declaración de Veracidad de Datos", desc: "Garantía formal de que el equipo, terapias corporativas, espacios y certificaciones declaradas son totalmente verdaderas." },
    { id: "5", title: "Políticas de Privacidad y Términos de Uso", desc: "Aceptación de la cláusula de tratamiento de datos corporativos de la plataforma y normativas del servicio." },
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
          <span className="text-2xl md:text-3xl">⭐</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Plan Centros & Organizadores</h1>
        </div>

        <div className="space-y-6">
          {/* Section 1: Para quién es */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              ✨ ¿PARA QUIÉN ES?
            </span>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              Para centros, escuelas, asociaciones y otras entidades relacionadas con la salud complementaria e integrativa que desean dar mayor visibilidad a vuestro proyecto y a las actividades que organizáis.
            </p>
          </div>

          {/* Section 2: Qué es el plan */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              😊 ¿QUÉ ES EL PLAN CENTROS & ORGANIZADORES?
            </span>
            <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              <p>
                El Plan Centros & Organizadores está diseñado específicamente para coordinar y potenciar la visibilidad de tu espacio, escuela, colectivo o asociación de bienestar en Mallorca.
              </p>
              <p>
                Permite unificar a todo tu equipo bajo un perfil institucional, publicar de manera ilimitada todas las actividades de tu agenda pública y mostrar tu centro bajo un sólido sello institucional de confianza.
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                  🎁 Promoción de lanzamiento: ¡2 meses gratis en la modalidad anual! (50 €/mes, IVA incluido)
                </span>
              </div>
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
                  <span className="text-blue-500 text-xs">💙</span> Perfil Institucional Exclusivo
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Ficha con diseño corporativo avanzado, que incluye logotipo destacado, descripción de la misión de la organización y enlace directo a vuestra web.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 2 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Gestión de Miembros de Equipo
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Permite dar visibilidad a tus terapeutas, profesores o colaboradores asociándolos directamente al perfil de tu centro en el directorio.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 3 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Publicación Ilimitada de Actividades
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Publica todos tus talleres, retiros, cursos, charlas o clases regulares en la agenda pública de Mallorca Holística sin coste adicional.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 4 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Galería de Fotos Corporativa
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Sube hasta 15 imágenes en alta resolución para mostrar tus instalaciones, salas de alquiler, aulas de formación o terapias grupales.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 5 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Sello de Entidad Identificada
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Distintivo visual que certifica al centro como una organización registrada, legítima y comprometida con el bienestar riguroso.</span>
                  </li>
                </ul>
              </div>

              {/* Subsection 6 */}
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Visibilidad Destacada en la Isla
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Máximo posicionamiento en el directorio general de centros de la isla y recomendación preferente en la búsqueda conversacional IA inteligente.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Requisitos de registro */}
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-[#526046] uppercase block mb-4 font-mono">
              🛡️ REQUISITOS DE REGISTRO INSTITUCIONAL
            </span>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 font-sans">
              Para mantener el rigor de nuestro directorio institucional, se solicita aportar los siguientes datos corporativos durante el alta de la entidad:
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
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-sans">{r.desc}</p>
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
              <Button asChild size="lg" className="border-2 border-foreground bg-background hover:bg-foreground/5 text-foreground rounded-lg px-6 font-semibold flex-1 transition-all h-12 shadow-sm text-sm">
                <Link to="/register" search={{ plan: "centros-organizadores", track: "organizacion" }} className="flex items-center justify-center gap-2">
                  👉 Registrar nuestra entidad <span className="ml-1">→</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="border-2 border-dashed border-foreground/30 bg-transparent hover:bg-foreground/5 text-foreground rounded-lg px-6 font-semibold flex-1 transition-all h-12 text-sm">
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
