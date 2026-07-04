import { createFileRoute } from "@tanstack/react-router";
import { TherapyProfessionalsPage } from "@/features/therapies/TherapyProfessionalsPage";

export const Route = createFileRoute("/therapies_/$slug/professionals")({
  head: ({ params }) => ({
    meta: [{ title: `Profesionales de ${params.slug} — Mallorca Holística` }],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TherapyProfessionalsPage slug={slug} />;
}
