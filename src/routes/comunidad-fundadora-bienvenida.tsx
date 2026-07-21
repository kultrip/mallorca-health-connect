import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Award, ShieldAlert, ArrowRight, Users } from "lucide-react";
import { onboardingSearchSchema } from "@/lib/route-schemas";

export const Route = createFileRoute("/comunidad-fundadora-bienvenida")({
  validateSearch: onboardingSearchSchema,
  head: () => ({
    meta: [
      { title: "¡Bienvenido/a Comunidad Fundadora! — Mallorca Holística" },
      {
        name: "description",
        content:
          "Condiciones exclusivas y bienvenida para los Miembros Fundadores de Mallorca Holística.",
      },
    ],
  }),
  component: ComunidadFundadoraBienvenidaPage,
});

function ComunidadFundadoraBienvenidaPage() {
  const search = Route.useSearch();
  const founderInvite = search.founderInvite;

  return (
    <PageShell>
      <div className="mx-auto max-w-[1000px] px-6 py-16 md:py-24">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-primary mb-4 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" /> ¡Invitación Confirmada!
          </span>
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight">
            Te damos la bienvenida a la Comunidad Fundadora
          </h1>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">
            Has sido seleccionado/a por nuestro equipo o recomendado/a por otro miembro para formar
            parte del núcleo originario de Mallorca Holística. Disfruta de ventajas exclusivas de
            por vida como muestra de nuestro agradecimiento por tu confianza inicial.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-primary/10 bg-[#fdf5eb]/30 p-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#526046]/10 text-[#526046] mx-auto mb-4">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg text-foreground font-semibold">
              180 días sin cargo
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Prueba la plataforma con todas las funciones premium activas durante 180 días a coste
              cero.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-[#fdf5eb]/30 p-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#526046]/10 text-[#526046] mx-auto mb-4">
              <Award className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg text-foreground font-semibold">
              Tarifa Especial de por Vida
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Tu precio reducido de fundador se congela para siempre; nunca se verá afectado por
              futuras subidas.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/10 bg-[#fdf5eb]/30 p-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#526046]/10 text-[#526046] mx-auto mb-4">
              <Users className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg text-foreground font-semibold">
              Sello de Co-Creador
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Forma parte activa del desarrollo, proponiendo mejoras y participando en encuentros de
              la comunidad.
            </p>
          </div>
        </div>

        {/* Exclusive Plans Cards */}
        <h2 className="font-display text-2xl text-foreground text-center mb-10">
          Elige tu plan con condiciones de Fundador
        </h2>

        <div className="grid gap-8 md:grid-cols-2 max-w-[800px] mx-auto">
          {/* Profesional Fundador */}
          <div className="flex flex-col justify-between rounded-3xl border-2 border-primary bg-card p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-primary px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-primary-foreground shadow-sm">
              180 días sin cargo
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Especial Profesional
              </span>
              <h3 className="font-display mt-4 text-2xl text-foreground">Profesional Fundador</h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-muted-foreground line-through text-lg">25 €</span>
                <span className="text-4xl font-bold font-display text-foreground">15 €</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block">
                ¡Ahorra 120 € al año para siempre!
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Para terapeutas y facilitadores individuales que desean activar su Sello de
                Verificación y visibilidad prioritaria.
              </p>

              <ul className="mt-6 space-y-3 border-t border-border/60 pt-6">
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80 font-medium">
                    Sello Profesional Verificado
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">
                    180 días sin cargo con ventajas premium activas
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">
                    Tarifa reducida de 15 €/mes para siempre
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">Botones de contacto y reserva directa</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">Galería de fotos (hasta 5 imágenes)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-6 rounded-xl"
              >
                <Link
                  to={founderInvite ? "/register" : "/comunidad-fundadora-acceso"}
                  search={
                    founderInvite
                      ? {
                          plan: "profesional",
                          track: "verificadoFundador",
                          founderInvite,
                        }
                      : undefined
                  }
                  className="flex items-center justify-center gap-1"
                >
                  👉 Elegir este plan <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Centro Fundador */}
          <div className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-muted px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
              180 días sin cargo
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Especial Entidades
              </span>
              <h3 className="font-display mt-4 text-2xl text-foreground">Centro Fundador</h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-muted-foreground line-through text-lg">50 €</span>
                <span className="text-4xl font-bold font-display text-foreground">35 €</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <p className="mt-1 text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded inline-block">
                ¡Ahorra 180 € al año para siempre!
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Para centros físicos, escuelas de formación, asociaciones y colectivos de terapias
                integrativas.
              </p>

              <ul className="mt-6 space-y-3 border-t border-border/60 pt-6">
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80 font-medium">
                    Sello de Entidad Identificada
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">
                    180 días sin cargo con ventajas premium activas
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">
                    Tarifa reducida de 35 €/mes para siempre
                  </span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">Fichas de miembros de equipo</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                  <span className="text-foreground/80">
                    Publicación ilimitada de eventos y talleres
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Button asChild className="w-full" variant="outline">
                <Link
                  to={founderInvite ? "/register" : "/comunidad-fundadora-acceso"}
                  search={
                    founderInvite
                      ? {
                          plan: "centros-organizadores",
                          track: "organizacionFundadora",
                          founderInvite,
                        }
                      : undefined
                  }
                  className="flex items-center justify-center gap-1"
                >
                  👉 Elegir este plan <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Safety Note */}
        <div className="mt-16 text-center text-xs text-muted-foreground leading-relaxed max-w-md mx-auto flex items-center justify-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Nota: no se te cobrará nada durante los primeros 180 días. Podrás cancelar en cualquier
            momento desde tu panel de control.
          </span>
        </div>
      </div>
    </PageShell>
  );
}
