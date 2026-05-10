import { createFileRoute } from "@tanstack/react-router";
import { ProfessionalsPage } from "@/features/professionals/ProfessionalsPage";
import { professionalsSearchSchema } from "@/lib/route-schemas";

export const Route = createFileRoute("/professionals")({
  validateSearch: professionalsSearchSchema,
  head: () => ({
    meta: [
      { title: "Profesionales verificados — Mallorca Holística" },
      {
        name: "description",
        content:
          "Encuentra terapeutas y profesionales del bienestar verificados en Mallorca. Filtra por terapia, ubicación y modalidad.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return <ProfessionalsPage search={Route.useSearch()} />;
}
