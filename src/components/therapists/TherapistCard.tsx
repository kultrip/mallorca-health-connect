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
  city?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  municipalities?: {
    name: string;
    slug: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
};

export function TherapistCard({ t }: { t: TherapistCardData }) {
  const locationLabel = t.city || t.municipalities?.name || t.address;

  return (
    <Link
      to="/professionals/$slug"
      params={{ slug: t.slug }}
      className="group flex flex-col sm:flex-row items-start sm:items-center overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-5 sm:p-6 gap-4 sm:gap-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(96,68,31,0.06)]"
    >
      {/* Discrete Circular Avatar */}
      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-[#fbf8f3] flex-shrink-0 border border-[#dfcfbd] shadow-sm flex items-center justify-center">
        {t.photo_url ? (
          <img
            src={t.photo_url}
            alt={t.full_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-[#8a6550] bg-[#f4eadb]/40">
            {t.full_name?.[0] ?? "·"}
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {t.especialidad && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a6550]">
              {t.especialidad}
            </span>
          )}
          {t.verified && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#f4eadb]/50 border border-[#dfcfbd]/40 px-2 py-0.5 text-[9px] font-medium text-[#1f3326]">
              <BadgeCheck className="h-3 w-3 text-[#8a6550]" />
              Verificado
            </span>
          )}
        </div>

        <h3 className="font-display mt-0.5 text-xl sm:text-2xl text-[#1f3326] leading-tight group-hover:text-[#8a6550] transition-colors">
          {t.full_name}
        </h3>

        {(t.frase_clave || t.headline) && (
          <p className="mt-1 line-clamp-2 text-xs sm:text-sm italic text-[#342b22]/80">
            "{t.frase_clave || t.headline}"
          </p>
        )}

        {/* Footer info pills */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#5d5144]">
          {locationLabel && (
            <span className="inline-flex items-center gap-1 bg-[#f4eadb]/30 border border-[#dfcfbd]/30 px-2 py-0.5 rounded-full">
              <MapPin className="h-3.5 w-3.5 text-[#8a6550]" />
              {locationLabel}
            </span>
          )}
          {t.modalities && t.modalities.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[#5d5144]/85">
              • {t.modalities.slice(0, 3).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
