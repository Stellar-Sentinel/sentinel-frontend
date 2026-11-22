export type SentinelEvent = {
  id: string;
  ledger: number;
  created_at: string;
  agent: string;
  subject: string;
  score: number;
  contract_id: string;
  transaction_hash?: string;
  tx_hash?: string;
  report_digest?: string;
};

export type EventFreshness = {
  status: "fresh" | "stale" | "unavailable";
  observed_at?: string;
  latest_ledger?: number;
  oldest_ledger?: number;
};

export type EventPage = {
  events: SentinelEvent[];
  next_cursor: string | null;
  source?: { rpc_url: string; network: string };
  freshness?: EventFreshness;
};

export const MAX_LOADED_EVENTS = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length <= maxLength ? value : null;
}

function boundedLedger(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
}

export function normalizeEvent(value: unknown): SentinelEvent | null {
  if (!isRecord(value)) return null;
  const id = boundedString(value.id, 160);
  const createdAt = boundedString(value.created_at, 80);
  const agent = boundedString(value.agent, 100);
  const subject = boundedString(value.subject, 100);
  const contractId = boundedString(value.contract_id, 100);
  const ledger = typeof value.ledger === "number" && Number.isSafeInteger(value.ledger) && value.ledger >= 0 ? value.ledger : null;
  const score = typeof value.score === "number" && Number.isFinite(value.score) ? Math.max(0, Math.min(100, value.score)) : null;
  if (!id || !createdAt || !agent || !subject || !contractId || ledger === null || score === null) return null;
  const transactionHash = boundedString(value.transaction_hash, 160) ?? boundedString(value.tx_hash, 160) ?? undefined;
  const reportDigest = boundedString(value.report_digest, 160) ?? undefined;
  return { id, ledger, created_at: createdAt, agent, subject, score, contract_id: contractId, transaction_hash: transactionHash, report_digest: reportDigest };
}

export function parseEventPage(value: unknown): EventPage {
  if (!isRecord(value) || !Array.isArray(value.events)) throw new Error("The event feed returned an invalid response.");
  const events = value.events.slice(0, MAX_LOADED_EVENTS).map(normalizeEvent).filter((event): event is SentinelEvent => event !== null)
    .sort((left, right) => right.ledger - left.ledger || (Date.parse(right.created_at) || 0) - (Date.parse(left.created_at) || 0) || left.id.localeCompare(right.id));
  const nextCursor = typeof value.next_cursor === "string" && value.next_cursor.length <= 512 ? value.next_cursor : null;
  const source = isRecord(value.source) && typeof value.source.network === "string" && typeof value.source.rpc_url === "string"
    ? { network: value.source.network.slice(0, 80), rpc_url: value.source.rpc_url.slice(0, 512) }
    : undefined;
  const freshnessValue = isRecord(value.freshness) ? value.freshness : isRecord(value.source) && isRecord(value.source.freshness) ? value.source.freshness : null;
  const status = freshnessValue && typeof freshnessValue.status === "string" && ["fresh", "stale", "unavailable"].includes(freshnessValue.status)
    ? freshnessValue.status as EventFreshness["status"]
    : freshnessValue && freshnessValue.stale === true ? "stale" : undefined;
  const freshness = status ? {
    status,
    observed_at: boundedString(freshnessValue?.observed_at, 80) ?? undefined,
    latest_ledger: boundedLedger(freshnessValue?.latest_ledger),
    oldest_ledger: boundedLedger(freshnessValue?.oldest_ledger),
  } : undefined;
  return { events, next_cursor: nextCursor, source, freshness };
}

export function evidenceRequestPath(reportDigest: string) {
  return `/evidence/${encodeURIComponent(reportDigest)}`;
}
