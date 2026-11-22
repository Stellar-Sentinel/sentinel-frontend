export const MAX_SESSION_ASSESSMENTS = 5;

const TELEMETRY_FIELDS = ["route", "status_class", "latency_bucket", "deployment_id"] as const;
type TelemetryField = (typeof TELEMETRY_FIELDS)[number];

export type SafeTelemetry = Partial<Record<TelemetryField, string>>;

/** Keep approved operational dimensions separate from account or response data. */
export function sanitizeTelemetry(value: Record<string, unknown>): SafeTelemetry {
  const result: SafeTelemetry = {};
  for (const field of TELEMETRY_FIELDS) {
    const candidate = value[field];
    if (typeof candidate === "string" && candidate.length <= 160) result[field] = candidate;
  }
  return result;
}

export function retainRecentAssessments<T>(items: readonly T[], limit = MAX_SESSION_ASSESSMENTS): T[] {
  return limit > 0 ? items.slice(0, limit) : [];
}
