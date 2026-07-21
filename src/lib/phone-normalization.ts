export function normalizeFounderWhatsApp(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  let normalized = trimmed.replace(/[^\d+]/g, "");
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }

  const hasExplicitCountryCode = normalized.startsWith("+");
  const digits = normalized.replace(/\D/g, "");

  if (!digits) return "";
  if (!hasExplicitCountryCode && digits.length === 9) {
    return `34${digits}`;
  }

  return digits;
}
