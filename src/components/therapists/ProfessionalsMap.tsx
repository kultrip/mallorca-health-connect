import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import type { TherapistCardData } from "./TherapistCard";
import { getProfessionalMapPins } from "./professional-map-utils";

type ProfessionalsMapProps = {
  professionals: TherapistCardData[];
  title?: string;
};

export function ProfessionalsMap({
  professionals,
  title = "Mapa de profesionales",
}: ProfessionalsMapProps) {
  const pins = useMemo(() => getProfessionalMapPins(professionals), [professionals]);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const selectedPin = pins.find((pin) => pin.id === selectedPinId) ?? pins[0];

  if (pins.length === 0) return null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {pins.length} ubicación{pins.length === 1 ? "" : "es"} en Mallorca
          </p>
        </div>
        <MapPin className="h-5 w-5 text-primary" />
      </div>

      <div className="relative aspect-[1.2/1] overflow-hidden rounded-2xl border border-border bg-muted/30">
        <div
          aria-hidden="true"
          className="absolute inset-[10%] rounded-[52%_48%_55%_45%/44%_50%_50%_56%] border border-primary/20 bg-background shadow-inner"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 74"
          className="absolute inset-[12%] h-[76%] w-[76%] text-primary/10"
        >
          <path
            d="M8 34c7-17 27-26 48-25 17 1 31 7 36 18 5 10-2 22-14 29-15 9-36 10-52 3C13 53 3 45 8 34Z"
            fill="currentColor"
          />
        </svg>
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            aria-label={`${pin.name}, ${pin.locationLabel}`}
            onClick={() => setSelectedPinId(pin.id)}
            className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </button>
        ))}
      </div>

      {selectedPin && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {selectedPin.source === "municipality" ? "Zona aproximada" : "Ubicación"}
          </p>
          <Link
            to="/professionals/$slug"
            params={{ slug: selectedPin.slug }}
            className="mt-1 block font-display text-lg leading-tight hover:text-primary"
          >
            {selectedPin.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">{selectedPin.locationLabel}</p>
        </div>
      )}
    </aside>
  );
}
