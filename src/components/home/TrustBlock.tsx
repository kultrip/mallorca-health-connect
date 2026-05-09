import { ShieldCheck, Sparkles, MapPin } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "100% verificados",
    text: "Ningún perfil sin documentación revisada.",
  },
  {
    icon: Sparkles,
    title: "Selección cuidada",
    text: "Elegimos profesionales con atención y criterio.",
  },
  {
    icon: MapPin,
    title: "En Mallorca, por ahora",
    text: "Profesionales en Mallorca, cerca de ti.",
  },
];

export function TrustBlock() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
        <div className="max-w-2xl">
          <h2>Profesionales en los que puedes confiar</h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            En Mallorca Holística, cada profesional pasa por un proceso de verificación
            antes de formar parte de la plataforma. Revisamos su identidad y su
            trayectoria para que puedas elegir con tranquilidad y confianza.
          </p>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 max-w-3xl text-xs text-muted-foreground">
          Las terapias complementarias acompañan procesos de salud, pero no sustituyen
          la atención médica cuando es necesaria.
        </p>
      </div>
    </section>
  );
}
