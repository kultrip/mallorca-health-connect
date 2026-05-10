import { Link } from "@tanstack/react-router";
import { MapPin, BadgeCheck } from "lucide-react";

export type TherapistCardData = {
  id: string;
  slug: string;
  full_name: string;
  headline?: string | null;
  frase_clave?: string | null;
  photo_url?: string | null;
  especialidad?: string | null;
  modalities?: string[] | null;
  verified?: boolean | null;
  municipalities?: { name: string; slug: string } | null;
};

export function TherapistCard({ t }: { t: TherapistCardData }) {
  return (
    <Link
      to="/profesionales/$slug"
      params={{ slug: t.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {t.photo_url ? (
          <img
            src={t.photo_url}
            alt={t.full_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-3xl text-muted-foreground/40">
            {t.full_name?.[0] ?? "·"}
          </div>
        )}
        {t.verified && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" />
            Verificado
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {t.especialidad}
        </div>
        <h3 className="font-display mt-1 text-2xl leading-tight">{t.full_name}</h3>
        {t.frase_clave && (
          <p className="mt-2 line-clamp-2 text-sm italic text-foreground/70">
            "{t.frase_clave}"
          </p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
          {t.municipalities?.name && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {t.municipalities.name}
            </span>
          )}
          {t.modalities && t.modalities.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              {t.modalities.slice(0, 3).map((m) => (
                <span key={m} className="capitalize">{m}</span>
              )).reduce((prev: any, curr, i) => i === 0 ? [curr] : [...prev, " · ", curr], [])}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
