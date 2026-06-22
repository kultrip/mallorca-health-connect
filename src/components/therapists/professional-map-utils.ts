import type { TherapistCardData } from "./TherapistCard";

export type ProfessionalMapPin = {
  id: string;
  slug: string;
  name: string;
  locationLabel: string;
  x: number;
  y: number;
  source: "therapist" | "municipality";
};

const MALLORCA_BOUNDS = {
  minLat: 39.25,
  maxLat: 39.98,
  minLng: 2.25,
  maxLng: 3.55,
};

export function getProfessionalMapPins(professionals: TherapistCardData[]): ProfessionalMapPin[] {
  return professionals
    .map((professional) => toMapPin(professional))
    .filter((pin): pin is ProfessionalMapPin => Boolean(pin));
}

export function hasProfessionalMapPins(professionals: TherapistCardData[]) {
  return getProfessionalMapPins(professionals).length > 0;
}

function toMapPin(professional: TherapistCardData): ProfessionalMapPin | null {
  const coordinates = getCoordinates(professional);
  if (!coordinates || !isInMallorcaBounds(coordinates.lat, coordinates.lng)) return null;

  return {
    id: professional.id,
    slug: professional.slug,
    name: professional.full_name,
    locationLabel: getLocationLabel(professional),
    x: toPercent(coordinates.lng, MALLORCA_BOUNDS.minLng, MALLORCA_BOUNDS.maxLng),
    y: 100 - toPercent(coordinates.lat, MALLORCA_BOUNDS.minLat, MALLORCA_BOUNDS.maxLat),
    source: coordinates.source,
  };
}

function getCoordinates(professional: TherapistCardData) {
  if (isFiniteNumber(professional.lat) && isFiniteNumber(professional.lng)) {
    return { lat: professional.lat, lng: professional.lng, source: "therapist" as const };
  }

  if (
    isFiniteNumber(professional.municipalities?.lat) &&
    isFiniteNumber(professional.municipalities?.lng)
  ) {
    return {
      lat: professional.municipalities.lat,
      lng: professional.municipalities.lng,
      source: "municipality" as const,
    };
  }

  return null;
}

function getLocationLabel(professional: TherapistCardData) {
  if (professional.city) return professional.city;
  if (professional.municipalities?.name) return professional.municipalities.name;
  if (professional.address) return professional.address;
  return "Mallorca";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isInMallorcaBounds(lat: number, lng: number) {
  return (
    lat >= MALLORCA_BOUNDS.minLat &&
    lat <= MALLORCA_BOUNDS.maxLat &&
    lng >= MALLORCA_BOUNDS.minLng &&
    lng <= MALLORCA_BOUNDS.maxLng
  );
}

function toPercent(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}
