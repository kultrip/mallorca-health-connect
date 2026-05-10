import type { Therapy, TherapyGroup } from "./types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function getTherapyLetter(name: string) {
  const first = normalize(name).trim().charAt(0).toUpperCase();
  return first && /[A-Z]/.test(first) ? first : "#";
}

export function filterTherapies(therapies: Therapy[], query: string) {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return therapies;

  return therapies.filter((therapy) => {
    const haystack = [therapy.name, therapy.category ?? "", therapy.short_description ?? ""]
      .map(normalize)
      .join(" ");
    return haystack.includes(normalizedQuery);
  });
}

export function groupTherapiesByLetter(therapies: Therapy[]): TherapyGroup[] {
  const sorted = [...therapies].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const groups = new Map<string, Therapy[]>();

  for (const therapy of sorted) {
    const letter = getTherapyLetter(therapy.name);
    groups.set(letter, [...(groups.get(letter) ?? []), therapy]);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([letter, group]) => ({ letter, therapies: group }));
}
