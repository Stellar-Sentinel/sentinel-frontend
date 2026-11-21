export type AgentStatus = "disabled" | "healthy" | "degraded" | "unknown";

export type AgentStatusView = {
  status: AgentStatus;
  label: string;
  detail: string;
  lastCycleAt: string | null;
  flagsFiled: number | null;
};

const statusCopy: Record<AgentStatus, Pick<AgentStatusView, "label" | "detail">> = {
  disabled: { label: "Disabled", detail: "Automatic monitoring is not enabled." },
  healthy: { label: "Healthy", detail: "The monitoring agent is reporting normally." },
  degraded: { label: "Degraded", detail: "The monitoring agent needs attention." },
  unknown: { label: "Unknown", detail: "The monitoring agent status is unavailable." },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function optionalNonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

export function unknownAgentStatus(detail = statusCopy.unknown.detail): AgentStatusView {
  return { status: "unknown", ...statusCopy.unknown, detail, lastCycleAt: null, flagsFiled: null };
}

export function normalizeAgentStatus(payload: unknown): AgentStatusView {
  if (!isRecord(payload)) return unknownAgentStatus();

  const rawStatus = typeof payload.status === "string" ? payload.status.toLowerCase() : "";
  const status: AgentStatus = rawStatus === "disabled" || rawStatus === "healthy" || rawStatus === "degraded"
    ? rawStatus
    : payload.enabled === false
      ? "disabled"
      : "unknown";
  const copy = statusCopy[status];

  return {
    status,
    ...copy,
    lastCycleAt: optionalString(payload.last_cycle_at ?? payload.lastCycleAt),
    flagsFiled: optionalNonNegativeInteger(payload.flags_filed ?? payload.flagsFiled),
  };
}
