export function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinLines(values: string[] | null | undefined) {
  return (values ?? []).join("\n");
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAccessTokenFromSupabase(supabase: {
  auth: { getSession: () => Promise<{ data: { session: { access_token: string } | null } }> };
}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Tu sesion ha caducado. Vuelve a iniciar sesion.");
  return token;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "No se pudo completar la accion.";
}
