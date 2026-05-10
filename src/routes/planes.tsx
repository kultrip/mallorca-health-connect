import { createFileRoute } from "@tanstack/react-router";
import { redirectTo } from "@/lib/redirects";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/planes")({
  beforeLoad: () => redirectTo(ROUTES.plans),
});
