import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/home/Hero";
import { SymptomPrompt } from "@/components/search/SymptomPrompt";
import { HomeTrustSection } from "@/components/home/HomeTrustSection";
import { TherapistsCarousel } from "@/components/home/TherapistsCarousel";
import { DiscoverMore } from "@/components/home/DiscoverMore";
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
        content: "Profesionales verificados en terapias naturales y complementarias en Mallorca.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mallorca Holística",
    "url": "https://mallorcaholistica.com",
    "logo": "https://mallorcaholistica.com/favicon.png",
    "description": "Profesionales verificados de bienestar en Mallorca. Terapias naturales, complementarias y actividades integrativas.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mallorca",
      "addressRegion": "Islas Baleares",
      "addressCountry": "ES"
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <section className="px-6 pb-12 pt-12 md:px-10 md:pb-20 md:pt-16">
          <SymptomPrompt />
        </section>
        <HomeTrustSection />
        <TherapistsCarousel />
        <DiscoverMore />
      </main>
      <SiteFooter />
    </div>
  );
}
