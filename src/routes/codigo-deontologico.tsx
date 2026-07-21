import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { DEONTOLOGICAL_CODE } from "@/lib/legal-texts";
import { renderLegalText } from "./privacy";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/codigo-deontologico")({
  head: () => ({
    meta: [
      { title: "Código Deontológico — Mallorca Holística" },
      {
        name: "description",
        content:
          "Código Deontológico y principios éticos del acompañamiento de Mallorca Holística.",
      },
    ],
  }),
  component: DeontologicalPage,
});

function DeontologicalPage() {
  return (
    <PageShell>
      <div className="bg-[#fff9f1] py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ede6] text-[#526046]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            {renderLegalText(DEONTOLOGICAL_CODE)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
