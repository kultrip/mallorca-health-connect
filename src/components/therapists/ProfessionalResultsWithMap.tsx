import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

import { ProfessionalsMap } from "./ProfessionalsMap";
import { TherapistCard, type TherapistCardData } from "./TherapistCard";
import { hasProfessionalMapPins } from "./professional-map-utils";

type ProfessionalResultsWithMapProps = {
  professionals: TherapistCardData[];
  className?: string;
  mapTitle?: string;
};

export function TherapistCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center overflow-hidden rounded-3xl border border-[#eadfce]/60 bg-white p-5 sm:p-6 gap-4 sm:gap-6">
      {/* Avatar skeleton */}
      <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex-shrink-0" />
      {/* Details skeleton */}
      <div className="flex-1 min-w-0 flex flex-col gap-2.5 w-full">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-1/3 sm:w-1/4" />
        <Skeleton className="h-4 w-3/4 sm:w-1/2" />
        <div className="mt-1 flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProfessionalResultsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div className="flex flex-col gap-5 w-full">
        {Array.from({ length: 3 }).map((_, i) => (
          <TherapistCardSkeleton key={i} />
        ))}
      </div>
      <div className="hidden lg:block lg:sticky lg:top-24 h-[calc(100vh-140px)] min-h-[400px] w-full">
        <Skeleton className="h-full w-full rounded-3xl" />
      </div>
    </div>
  );
}

export function ProfessionalResultsWithMap({
  professionals,
  className,
  mapTitle,
}: ProfessionalResultsWithMapProps) {
  const hasPins = hasProfessionalMapPins(professionals);

  if (!hasPins) {
    return (
      <div className={cn("flex flex-col gap-5 max-w-4xl mx-auto w-full", className)}>
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start", className)}>
      <div className="flex flex-col gap-5 w-full">
        {professionals.map((professional) => (
          <TherapistCard key={professional.id} t={professional} />
        ))}
      </div>
      <div className="lg:sticky lg:top-24 h-[calc(100vh-140px)] min-h-[400px] w-full">
        <ProfessionalsMap professionals={professionals} title={mapTitle} />
      </div>
    </div>
  );
}
