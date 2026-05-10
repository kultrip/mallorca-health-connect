import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalProfilePage } from "@/features/professionals/ProfessionalProfilePage";

export const Route = createFileRoute("/professionals_/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Mallorca Holística` }],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <ProfessionalProfilePage slug={slug} />;
}
