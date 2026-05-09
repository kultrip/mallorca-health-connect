import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [{ title: "Crear perfil — Mallorca Holística" }],
  }),
  component: Page,
});

function Page() {
  return (
    <PageShell>
      <PageHeader eyebrow="Profesionales" title="Crear perfil" />
      <div className="mx-auto max-w-md px-6 pb-24">
        <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground">
          <p>El registro de profesionales llega en la siguiente fase.</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
