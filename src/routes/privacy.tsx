import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/layout/PageShell";
import { PRIVACY_POLICY } from "@/lib/legal-texts";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Mallorca Holística" },
      {
        name: "description",
        content: "Política de Privacidad y tratamiento de datos personales de Mallorca Holística.",
      },
    ],
  }),
  component: PrivacyPage,
});

export function renderLegalText(text: string) {
  const lines = text.split("\n");
  return (
    <div className="space-y-4 text-muted-foreground text-sm leading-relaxed max-w-3xl">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;

        // Main Document Title
        if (index === 0) {
          return (
            <h1
              key={index}
              className="font-display text-3xl md:text-4xl text-foreground mb-8 text-[#1f1c18] font-bold"
            >
              {trimmed}
            </h1>
          );
        }

        // Subtitles or numbered headers
        const isHeader =
          /^[0-9]+\.\s+/.test(trimmed) ||
          trimmed === "Datos identificativos" ||
          trimmed === "Datos profesionales" ||
          trimmed === "Datos de verificación" ||
          trimmed === "Datos técnicos" ||
          trimmed === "Gestión de tu cuenta" ||
          trimmed === "Publicación de perfiles" ||
          trimmed === "Proceso de verificación" ||
          trimmed === "Comunicación" ||
          trimmed === "Mejora de la plataforma" ||
          trimmed === "Comunicaciones informativas" ||
          trimmed === "Preámbulo" ||
          trimmed === "Finalidad del Código" ||
          trimmed === "Principio fundacional" ||
          trimmed === "Compromiso del Profesional" ||
          trimmed === "Adhesión al Código Deontológico" ||
          trimmed === "Aceptación de las Condiciones de Uso" ||
          trimmed === "Confirmación de lectura de la Política de Privacidad" ||
          trimmed === "Nuestra manera de entender el acompañamiento";

        if (isHeader) {
          return (
            <h2
              key={index}
              className="font-display text-xl md:text-2xl text-foreground mt-8 mb-4 text-[#342b22] font-semibold"
            >
              {trimmed}
            </h2>
          );
        }

        // Bullet points
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("✓")) {
          return (
            <li key={index} className="ml-4 pl-2 list-none flex items-start gap-2">
              <span className="text-[#526046] mt-1">•</span>
              <span>{trimmed.substring(1).trim()}</span>
            </li>
          );
        }

        // Standard Paragraph
        return (
          <p key={index} className="text-[#5d5144] text-base leading-relaxed">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function PrivacyPage() {
  return (
    <PageShell>
      <div className="bg-[#fff9f1] py-16 md:py-24">
        <div className="mx-auto max-w-[1180px] px-6 md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4ede6] text-[#526046]">
              <Shield className="h-5 w-5" />
            </div>
            {renderLegalText(PRIVACY_POLICY)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
