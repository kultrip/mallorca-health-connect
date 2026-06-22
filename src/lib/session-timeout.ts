export const REMEMBER_SESSION_STORAGE_KEY = "mallorca-holistica-remember-session";

export function getRememberSessionPreference(raw: string | null | undefined): boolean {
  if (!raw) return false;
  return raw === "true" || raw === "1";
}

export function shouldAutoSignOutOnVisibilityHidden(rememberSession: boolean): boolean {
  return !rememberSession;
}
