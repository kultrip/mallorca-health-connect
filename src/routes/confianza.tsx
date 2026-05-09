import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/confianza")({
  head: () => ({
    meta: [
      { title: "Verificación — Mallorca Holística" },
      {
        name: "description",
        content:
          "Cómo verificamos a los profesionales de Mallorca Holística para que elijas con tranquilidad.",
      },
    ],
  }),
  component: Page,
});

const items = [
  "Identidad verificada",
  "Formación o certificación revisada",
  "Seguro de responsabilidad civil",
  "Adhesión al código deontológico",
];

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Confianza"
        title="Profesionales en los que puedes confiar"
        intro="En Mallorca Holística, cada profesional pasa por un proceso de verificación antes de formar parte de la plataforma."
      />
      <div className="mx-auto max-w-[1180px] px-6 pb-24 md:px-10">
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <span className="text-foreground/90">{i}</span>
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-2xl text-sm text-muted-foreground">
          Las terapias complementarias acompañan procesos de salud, pero no sustituyen
          la atención médica cuando es necesaria.
        </p>
      </div>
    </PageShell>
  );
}
