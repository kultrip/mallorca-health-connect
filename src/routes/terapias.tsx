import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, ComingSoon } from "@/components/layout/PageShell";

export const Route = createFileRoute("/terapias")({
  head: () => ({
    meta: [
      { title: "Guía de terapias — Mallorca Holística" },
      {
        name: "description",
        content:
          "Explora las terapias naturales y complementarias disponibles en Mallorca y descubre cómo cada una puede acompañarte.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Guía"
        title="Guía de terapias"
        intro="Explora las terapias disponibles en Mallorca Holística y descubre en qué consiste cada una y cómo puede ayudarte. Poco a poco vamos incorporando nuevas disciplinas."
      />
      <ComingSoon note="Listado A–Z y fichas de cada terapia en construcción." />
    </PageShell>
  );
}
