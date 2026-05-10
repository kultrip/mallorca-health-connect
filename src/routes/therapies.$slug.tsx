import { createFileRoute } from "@tanstack/react-router";
import { TherapyDetailPage } from "@/features/therapies/TherapyDetailPage";

export const Route = createFileRoute("/therapies/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Terapias — Mallorca Holística` }],
  }),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  return <TherapyDetailPage slug={slug} />;
}
