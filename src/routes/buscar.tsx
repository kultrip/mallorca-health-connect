import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, ComingSoon } from "@/components/layout/PageShell";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Encuentra acompañamiento — Mallorca Holística" },
      {
        name: "description",
        content:
          "Cuéntanos cómo te sientes y te mostramos profesionales que pueden acompañarte.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Búsqueda inteligente"
        title="Gracias por compartirlo."
        intro="Aquí tienes personas y propuestas que pueden acompañarte."
      />
      <ComingSoon note="La búsqueda conversacional con IA llega en la siguiente fase." />
    </PageShell>
  );
}
