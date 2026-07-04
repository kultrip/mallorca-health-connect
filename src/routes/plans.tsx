import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles, Sun, Check } from "lucide-react";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Planes — Mallorca Holística" },
      {
        name: "description",
        content:
          "Planes de Mallorca Holística: Presencia gratuita, Profesional para terapeutas, y Centros & Organizadores.",
      },
    ],
  }),
  component: Page,
});

const plans = [
  {
    icon: Leaf,
    name: "Presencia",
    price: "Gratis",
    sub: "Forma parte del ecosistema",
    feeling: "Puedo empezar de forma natural.",
    features: [
      "Perfil básico verificado",
      "Aparición en búsquedas",
      "Foto, descripción y especialidades",
      "1 actividad grupal visible",
      "Acceso al panel profesional",
    ],
    cta: "Crear perfil gratuito",
    to: "/register" as const,
  },
  {
    icon: Sparkles,
    name: "Profesional",
    price: "25€/mes",
    sub: "Captación y visibilidad personal",
    feeling: "Esto puede ayudarme a crecer y a ser encontrado más fácilmente.",
    highlight: true,
    features: [
      "Aparición prioritaria en búsquedas",
      "Botón directo de contacto / reserva",
      "Perfil ampliado y visual",
      "Etiquetas destacadas",
      "Estadísticas básicas del perfil",
    ],
    cta: "Quiero ser visible",
    to: "/register" as const,
  },
  {
    icon: Sun,
    name: "Centros & Organizadores",
    price: "50€/mes",
    sub: "Difusión y movimiento colectivo",
    feeling: "Quiero dar más movimiento a mis actividades.",
    features: [
      "Todo lo del plan Profesional",
      "Publicación continua de actividades",
      "Mayor visibilidad en la agenda",
      "Perfil ampliado para centros",
      "Visibilidad para talleres, retiros y formaciones",
    ],
    cta: "Quiero difundir mis actividades",
    to: "/register" as const,
  },
];

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Planes"
        title="Planes de suscripción"
        intro="En Presencia formas parte del ecosistema. En Profesional facilitas nuevas conexiones. Y en Centros & Organizadores das visibilidad y movimiento a tus actividades."
      />
      <div className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                "flex flex-col rounded-3xl border bg-card p-8 " +
                (p.highlight
                  ? "border-primary/40 shadow-sm ring-1 ring-primary/10"
                  : "border-border")
              }
            >
              <p.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.sub}</p>
              <div className="mt-5 font-display text-3xl">{p.price}</div>
              <p className="mt-3 text-xs italic text-muted-foreground">“{p.feeling}”</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button asChild variant={p.highlight ? "default" : "outline"} className="w-full">
                  <Link
                    to={p.to}
                    search={{
                      plan:
                        p.name === "Presencia"
                          ? "presencia"
                          : p.name === "Profesional"
                            ? "profesional"
                            : "centros-organizadores",
                    }}
                  >
                    {p.cta}
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-secondary/30 p-8 md:p-12">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Founding Members
          </div>
          <h2 className="mt-3">Una invitación al nacimiento del ecosistema</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Reservado para los primeros perfiles seleccionados. Seis meses gratuitos desde el
            lanzamiento, luego una tarifa especial mantenida para siempre.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-display text-xl">Profesional</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Primeros 40 perfiles. 6 meses gratis, después 15€/mes para siempre.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="font-display text-xl">Centros & Organizadores</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Primeros 10 perfiles. 6 meses gratis, después 35€/mes para siempre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
