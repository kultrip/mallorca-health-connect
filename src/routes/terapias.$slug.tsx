import { createFileRoute } from "@tanstack/react-router";
import { redirectTherapySlug } from "@/lib/redirects";

export const Route = createFileRoute("/terapias/$slug")({
  beforeLoad: ({ params }) => redirectTherapySlug(params.slug),
});
