import { createFileRoute } from "@tanstack/react-router";
import { redirectTherapySlug, redirectTo } from "@/lib/redirects";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/terapias")({
  beforeLoad: ({ location }) => {
    const nestedSlug = getNestedSlug(location.pathname, "/terapias/");
    if (nestedSlug) redirectTherapySlug(nestedSlug);
    redirectTo(ROUTES.therapies);
  },
});

function getNestedSlug(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) return null;
  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "");
}
