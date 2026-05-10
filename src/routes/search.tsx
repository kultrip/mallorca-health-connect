import { createFileRoute } from "@tanstack/react-router";
import { ConversationalSearchPage } from "@/features/search/ConversationalSearchPage";
import { conversationalSearchSchema } from "@/lib/route-schemas";

export const Route = createFileRoute("/search")({
  validateSearch: conversationalSearchSchema,
  head: () => ({
    meta: [
      { title: "Encuentra acompañamiento — Mallorca Holística" },
      {
        name: "description",
        content: "Cuéntanos cómo te sientes y te mostramos profesionales que pueden acompañarte.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { q } = Route.useSearch();
  return <ConversationalSearchPage q={q} />;
}
