import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, ComingSoon } from "@/components/layout/PageShell";

export const Route = createFileRoute("/profesionales")({
  head: () => ({
    meta: [
      { title: "Profesionales verificados — Mallorca Holística" },
      {
        name: "description",
        content:
          "Encuentra terapeutas y profesionales del bienestar verificados en Mallorca. Filtra por terapia, ubicación y modalidad.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Directorio"
        title="Profesionales verificados"
        intro="Encuentra a la persona adecuada para acompañarte. Filtra por terapia, ubicación y modalidad."
      />
      <ComingSoon note="Listado, filtros y mapa llegan en la siguiente fase." />
    </PageShell>
  );
}
