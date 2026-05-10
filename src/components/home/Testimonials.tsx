const testimonials = [
  {
    quote:
      "No conocía mucho este tipo de terapias y me daba un poco de respeto. La web me ayudó a entender mejor y elegir sin sentirme perdida.",
    name: "Elena",
    place: "Inca",
  },
  {
    quote:
      "Miré varias opciones antes de decidirme, y agradecí poder hacerlo con calma. Al final contacté con una terapeuta que encajaba mucho conmigo.",
    name: "Ana",
    place: "Binissalem",
  },
  {
    quote:
      "Me gustó poder ver quién estaba detrás de cada perfil. Eso me dio confianza para decidirme.",
    name: "Joana",
    place: "Palma",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 py-20 md:px-10 md:py-28">
      <div className="mb-12 max-w-2xl">
        <h2>Testimonios</h2>
        <p className="mt-3 text-muted-foreground">Lo que dicen quienes ya han pasado por aquí.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name + t.place} className="rounded-3xl border border-border bg-card p-8">
            <blockquote className="text-sm leading-relaxed text-foreground/80">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground/70">
                {initials(t.name)}
              </span>
              <span className="text-sm text-foreground">
                {t.name} <span className="text-muted-foreground">· {t.place}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
