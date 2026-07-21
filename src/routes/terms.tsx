import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { TERMS_OF_USE } from "@/lib/legal-texts";
import { renderLegalText } from "./privacy";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Condiciones de Uso — Mallorca Holística" },
      {
        name: "description",
        content: "Condiciones de Uso y acceso a la plataforma Mallorca Holística.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell>
      <div className="bg-[#fff9f1] py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ede6] text-[#526046]">
              <FileText className="h-5 w-5" />
            </div>
            {renderLegalText(TERMS_OF_USE)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
