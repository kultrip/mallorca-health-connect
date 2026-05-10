import { createFileRoute } from "@tanstack/react-router";
import { redirectProfileSlug } from "@/lib/redirects";

export const Route = createFileRoute("/profesionales/$slug")({
  beforeLoad: ({ params }) => redirectProfileSlug(params.slug),
});
