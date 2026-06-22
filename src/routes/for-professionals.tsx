import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

const benefits = [
  "Perfil verificado dentro del ecosistema",
  "Aparición en búsquedas por terapia y ubicación",
  "Búsqueda conversacional que conecta personas con tu trabajo",
  "Panel profesional para gestionar tu presencia",
];

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Para profesionales"
        title="Forma parte del ecosistema"
        intro="Mallorca Holística conecta personas con profesionales verificados del bienestar. Una presencia humana, clara y respetuosa."
      />
      <div className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-3xl border border-border bg-card p-8">
            <h3 className="font-display text-2xl">Empieza de forma natural</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Crea tu perfil gratuito y forma parte del ecosistema. Cuando estés listo, activa más
              visibilidad para facilitar nuevas conexiones.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/register" search={{ plan: "presencia" }}>
                  Crear perfil gratuito
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/plans">Ver planes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
