import { createFileRoute } from "@tanstack/react-router";
import { TherapiesPage } from "@/features/therapies/TherapiesPage";

export const Route = createFileRoute("/therapies")({
  head: () => ({
    meta: [
      { title: "Guía de terapias — Mallorca Holística" },
      {
        name: "description",
        content:
          "Explora las terapias naturales y complementarias disponibles en Mallorca y descubre cómo cada una puede acompañarte.",
      },
    ],
  }),
  component: TherapiesPage,
});
