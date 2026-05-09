import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { SymptomPrompt } from "@/components/search/SymptomPrompt";
import { StartHere } from "@/components/home/StartHere";
import { TrustBlock } from "@/components/home/TrustBlock";
import { Testimonials } from "@/components/home/Testimonials";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mallorca Holística — Profesionales verificados de bienestar" },
      {
        name: "description",
        content:
          "Encuentra terapeutas y profesionales verificados en Mallorca. Busca por terapia, ubicación o cuéntanos cómo te sientes.",
      },
      { property: "og:title", content: "Mallorca Holística" },
      {
        property: "og:description",
        content:
          "Profesionales verificados en terapias naturales y complementarias en Mallorca.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader transparent />
      <main className="flex-1">
        <Hero />
        <section className="mx-auto max-w-[1180px] px-6 pb-16 pt-4 md:px-10 md:pt-2">
          <SymptomPrompt />
        </section>
        <StartHere />
        <TrustBlock />
        <Testimonials />
      </main>
      <SiteFooter />
    </div>
  );
}
