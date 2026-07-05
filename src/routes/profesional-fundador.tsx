import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";

export const Route = createFileRoute("/profesional-fundador")({
  head: () => ({
    meta: [
      { title: "Plan Profesional Verificado — Mallorca Holística" },
      {
        name: "description",
        content:
          "Descubre el Plan Profesional Verificado. Sello de confianza, posicionamiento prioritario y visibilidad rigurosa en Mallorca.",
      },
    ],
  }),
  component: ProfesionalFundadorPage,
});

function ProfesionalFundadorPage() {
  const requirements = [
    { id: "1", title: "Código Deontológico", desc: "Lectura, firma y compromiso de cumplimiento del Código Ético y Deontológico de Mallorca Holística." },
    { id: "2", title: "Seguro de Responsabilidad Civil (RC)", desc: "Disponer de seguro de RC profesional en vigor que cubra la actividad desarrollada (obligatorio en el onboarding)." },
    { id: "3", title: "Titulaciones y Acreditaciones", desc: "Subir copia digital legible de diplomas, títulos o certificados que acrediten la formación para cada terapia ofrecida." },
    { id: "4", title: "Declaración de Veracidad", desc: "Declarar formalmente que toda la información aportada en el perfil, trayectoria y formaciones es verídica." },
    { id: "5", title: "Política de Privacidad", desc: "Aceptación de las normativas de protección de datos personales de terapeutas y usuarios." },
    { id: "6", title: "Condiciones de Uso de la Plataforma", desc: "Conformidad con las normas de publicación y comportamiento ético dentro del ecosistema digital." },
    { id: "7", title: "Autorización de Publicación", desc: "Autorizar la difusión de la ficha profesional en el directorio público y canales de divulgación de Mallorca Holística." },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-[700px] px-4 pb-24 pt-8 md:pt-12">
        <div className="text-[10px] md:text-xs tracking-wider text-muted-foreground uppercase font-mono mb-4 text-left select-none">
          PANTALLA - 1c · DETALLE PLAN PROFESIONAL VERIFICADO
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl md:text-3xl">⭐</span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Plan Profesional Verificado</h1>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              ✨ ¿PARA QUIÉN ES?
            </span>
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              Para profesionales de la salud complementaria e integrativa que desean reforzar la confianza que transmiten, aumentar su visibilidad y acceder a funcionalidades avanzadas.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-amber-700/90 uppercase block mb-3 font-mono">
              😊 ¿QUÉ ES EL PLAN PROFESIONAL VERIFICADO?
            </span>
            <div className="space-y-4 text-sm md:text-base text-foreground/90 leading-relaxed font-sans">
              <p>
                El Plan Profesional Verificado es el estándar de confianza para profesionales del bienestar en Mallorca.
              </p>
              <p>
                Permite aportar rigurosidad a tu presencia digital, destacar tu perfil con una insignia distintiva de verificación y facilitar que los usuarios conecten contigo directamente, sin comisiones intermedias.
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                  🎁 Promoción de lanzamiento: ¡2 meses gratis en la modalidad anual! (25 €/mes, IVA incluido)
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-blue-700/90 uppercase block mb-6 font-mono">
              💎 ¿QUÉ INCLUYE?
            </span>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Sello de Confianza
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Insignia distintiva de "Profesional Verificado" en tu ficha y en todas tus apariciones en el directorio, generando máxima confianza ante los pacientes.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Contacto Directo Sin Comisiones
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Botones para contacto directo vía WhatsApp, llamada telefónica, enlaces a tu sitio web, redes sociales y plataformas de reserva externa (Calendly, Fresha, etc.).</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Terapias e Idiomas Ilimitados
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Sin restricciones en el número de especialidades, terapias, síntomas tratados u áreas de ayuda que puedes añadir a tu perfil para posicionarte en más búsquedas.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Galería de Fotos Profesional
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Sube hasta 5 fotografías (tu espacio de consulta, salas, etc.) para crear una ficha visualmente atractiva y cercana que transmita profesionalidad.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Posicionamiento Prioritario
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Aparición destacada en el buscador y prioridad en los resultados de nuestra búsqueda conversacional inteligente basada en Inteligencia Artificial.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-sm md:text-base font-bold text-foreground flex items-center gap-2 mb-3">
                  <span className="text-blue-500 text-xs">💙</span> Múltiples Ubicaciones
                </h3>
                <ul className="space-y-2.5 pl-5">
                  <li className="text-xs md:text-sm text-foreground/80 leading-relaxed flex items-start gap-2">
                    <span className="text-[#526046] font-bold">✓</span>
                    <span>Registra hasta 5 consultas, centros colaboradores o ubicaciones de atención diferentes en Mallorca.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-[#526046] uppercase block mb-4 font-mono">
              🛡️ LOS 7 REQUISITOS DE VERIFICACIÓN
            </span>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 font-sans">
              Para asegurar la máxima rigurosidad y protección de los usuarios, todos los profesionales con Sello de Confianza deben aportar o aceptar las siguientes condiciones durante su onboarding:
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

          <div className="rounded-xl border border-dashed border-foreground/20 bg-background/40 p-6 md:p-8 shadow-sm">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase block mb-4 font-mono">
              ACCIONES
            </span>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="border-2 border-foreground bg-background hover:bg-foreground/5 text-foreground rounded-lg px-6 font-semibold flex-1 transition-all h-12 shadow-sm text-sm">
                <Link to="/register" search={{ plan: "profesional", track: "verificado" }} className="flex items-center justify-center gap-2">
                  👉 Crear mi cuenta verificado <span className="ml-1">→</span>
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
