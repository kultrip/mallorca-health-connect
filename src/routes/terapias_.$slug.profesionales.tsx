import { createFileRoute } from "@tanstack/react-router";
import { redirectTherapyProfessionalsSlug } from "@/lib/redirects";

export const Route = createFileRoute("/terapias_/$slug/profesionales")({
  beforeLoad: ({ params }) => redirectTherapyProfessionalsSlug(params.slug),
});
