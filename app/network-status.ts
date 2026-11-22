export type NetworkStatus = {
  network: string;
  status: string;
  latest_ledger: number | null;
  oldest_ledger: number | null;
  observed_at: string;
};

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim() ? value.slice(0, maxLength) : null;
}

function optionalLedger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

/** Normalize the public status response without exposing the backend RPC URL. */
export function parseNetworkStatus(value: unknown): NetworkStatus | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const network = boundedString(record.network, 80);
  const status = boundedString(record.status, 40);
  const observedAt = boundedString(record.observed_at, 80);
  if (!network || !status || !observedAt) return null;
  return {
    network,
    status,
    latest_ledger: optionalLedger(record.latest_ledger),
    oldest_ledger: optionalLedger(record.oldest_ledger),
    observed_at: observedAt,
  };
}
