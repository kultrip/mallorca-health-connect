import { createFileRoute } from "@tanstack/react-router";
import { redirectProfileSlug, redirectTo } from "@/lib/redirects";
import { ROUTES } from "@/lib/routes";

export const Route = createFileRoute("/profesionales")({
  beforeLoad: ({ location }) => {
    const nestedSlug = getNestedSlug(location.pathname, "/profesionales/");
    if (nestedSlug) redirectProfileSlug(nestedSlug);
    redirectTo(ROUTES.professionals);
  },
});

function getNestedSlug(pathname: string, prefix: string) {
  if (!pathname.startsWith(prefix)) return null;
  return decodeURIComponent(pathname.slice(prefix.length).split("/")[0] ?? "");
}
