export type Signal = {
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

const MAX_SIGNALS = 100;
const MAX_TEXT_LENGTH = 240;
const severities = new Set(["high", "medium", "low", "info"]);

function boundedText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, MAX_TEXT_LENGTH) : undefined;
}

function boundedValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return boundedText(value);
}

export function normalizeSignals(input: unknown): Signal[] {
  if (!Array.isArray(input)) return [];

  return input.slice(0, MAX_SIGNALS).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    const label = boundedText(raw.label);
    if (!label) return [];

    const severity = boundedText(raw.severity)?.toLowerCase();
    const points = typeof raw.points === "number" && Number.isFinite(raw.points) ? raw.points : undefined;
    const signal: Signal = { label, severity: severity && severities.has(severity) ? severity : "info" };
    const id = boundedText(raw.id);
    const value = boundedValue(raw.value);
    const explanation = boundedText(raw.explanation);
    const source = boundedText(raw.source);
    const observedAt = boundedText(raw.observed_at);
    const window = boundedText(raw.window);
    if (id !== undefined) signal.id = id;
    if (value !== undefined) signal.value = value;
    if (points !== undefined) signal.points = points;
    if (explanation !== undefined) signal.explanation = explanation;
    if (source !== undefined) signal.source = source;
    if (observedAt !== undefined) signal.observed_at = observedAt;
    if (window !== undefined) signal.window = window;
    return [signal];
  });
}
