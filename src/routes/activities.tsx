import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, ComingSoon } from "@/components/layout/PageShell";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "Actividades en Mallorca — Mallorca Holística" },
      {
        name: "description",
        content: "Talleres, retiros, formaciones y encuentros vinculados al bienestar en Mallorca.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Agenda"
        title="Actividades en Mallorca"
        intro="Talleres, retiros, formaciones y encuentros vinculados al bienestar."
      />
      <ComingSoon note="Agenda completa próximamente." />
    </PageShell>
  );
}
