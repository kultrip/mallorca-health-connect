import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { COOKIES_POLICY } from "@/lib/legal-texts";
import { renderLegalText } from "./privacy";
import { Info } from "lucide-react";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Política de Cookies — Mallorca Holística" },
      {
        name: "description",
        content: "Política de Cookies y configuración del consentimiento de Mallorca Holística.",
      },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <PageShell>
      <div className="bg-[#fff9f1] py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ede6] text-[#526046]">
              <Info className="h-5 w-5" />
            </div>
            {renderLegalText(COOKIES_POLICY)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
