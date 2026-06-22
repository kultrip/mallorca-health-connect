import { cn } from "@/lib/utils";

import { ProfessionalsMap } from "./ProfessionalsMap";
import { TherapistCard, type TherapistCardData } from "./TherapistCard";
import { hasProfessionalMapPins } from "./professional-map-utils";

type ProfessionalResultsWithMapProps = {
  professionals: TherapistCardData[];
  className?: string;
  mapTitle?: string;
};

export function ProfessionalResultsWithMap({
  professionals,
  className,
  mapTitle,
}: ProfessionalResultsWithMapProps) {
  const hasPins = hasProfessionalMapPins(professionals);

  if (!hasPins) {
    return (
      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]", className)}>
      <div className="grid gap-6 sm:grid-cols-2">
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
      <ProfessionalsMap professionals={professionals} title={mapTitle} />
    </div>
  );
}
