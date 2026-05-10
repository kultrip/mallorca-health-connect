import { redirect } from "@tanstack/react-router";

export function redirectTo(to: string) {
  throw redirect({ to, search: true });
}

export function redirectProfileSlug(slug: string) {
  throw redirect({ to: "/professionals/$slug", params: { slug }, search: true });
}

export function redirectTherapySlug(slug: string) {
  throw redirect({ to: "/therapies/$slug", params: { slug }, search: true });
}
