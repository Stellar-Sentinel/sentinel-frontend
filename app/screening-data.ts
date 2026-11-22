export type ScreeningSignal = {
  id?: string;
  label: string;
  value?: string | number;
  severity?: string;
  points?: number;
  explanation?: string;
  source?: string;
  observed_at?: string;
  window?: string;
};

export const SCREENING_HISTORY_LIMIT = 5;
export const SCREENING_ADDRESS_ERROR = "Enter a 56-character G-prefixed Stellar public account address.";

export function isStellarPublicKeyFormat(address: string) {
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function validateScreeningAddress(value: string) {
  const address = value.trim();
  return address && isStellarPublicKeyFormat(address) ? null : SCREENING_ADDRESS_ERROR;
}

export function screeningRequestBody(value: string) {
  return { address: value.trim() };
}

export function rememberAssessment<T extends { address: string }>(history: T[], result: T) {
  return [result, ...history.filter((item) => item.address !== result.address)].slice(0, SCREENING_HISTORY_LIMIT);
}

export function normalizeScreeningSignals(value: unknown): ScreeningSignal[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || typeof (item as { label?: unknown }).label !== "string") return [];
    const signal = item as Record<string, unknown>;
    return [{
      id: typeof signal.id === "string" ? signal.id : undefined,
      label: signal.label as string,
      value: typeof signal.value === "string" || typeof signal.value === "number" ? signal.value : undefined,
      severity: typeof signal.severity === "string" ? signal.severity : undefined,
      points: typeof signal.points === "number" && Number.isFinite(signal.points) ? signal.points : undefined,
      explanation: typeof signal.explanation === "string" ? signal.explanation : undefined,
      source: typeof signal.source === "string" ? signal.source : undefined,
      observed_at: typeof signal.observed_at === "string" ? signal.observed_at : undefined,
      window: typeof signal.window === "string" ? signal.window : undefined,
    }];
  }).slice(0, 100);
}
