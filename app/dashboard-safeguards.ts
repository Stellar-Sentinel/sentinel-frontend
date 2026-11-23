import type { SentinelEvent } from "./event-data";

export const MAX_ASSESSMENT_HISTORY = 5;

export function safeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof DOMException && error.name === "AbortError") return "The request timed out. Try again.";
  if (error instanceof Error && error.message) return error.message
    .replace(/(?:gh[pousr]_|github_pat_|-----BEGIN [A-Z ]*PRIVATE KEY-----)[A-Za-z0-9_+/=:-]*/gi, "[redacted]")
    .replace(/\bG[A-Z2-7]{55}\b/g, "[account redacted]")
    .replace(/\b[0-9a-f]{64}\b/gi, "[hash redacted]")
    .slice(0, 180);
  return fallback;
}

export function mergeLoadedEvents(current: SentinelEvent[], next: SentinelEvent[], append: boolean, limit: number) {
  const merged = append ? [...current, ...next] : next;
  return Array.from(new Map(merged.map((event) => [event.id, event])).values()).slice(0, limit);
}

export function rememberAssessment<T extends { address: string }>(current: T[], result: T) {
  return [result, ...current.filter((item) => item.address !== result.address)].slice(0, MAX_ASSESSMENT_HISTORY);
}
