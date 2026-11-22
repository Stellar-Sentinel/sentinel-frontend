export type ActivityAmount = {
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  amount?: string;
};

export type ActivityOperation = {
  id: string;
  type: string;
  created_at: string;
  source_account?: string;
  account?: string;
  counterparty?: string;
  transaction_hash?: string;
  amounts?: ActivityAmount[];
};

export type ActivityPage = { operations: ActivityOperation[]; next_cursor: string | null };
export const MAX_ACTIVITY_OPERATIONS = 100;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function bounded(value: unknown, max: number) {
  return typeof value === "string" && value.length <= max ? value : undefined;
}

function normalizeAmount(value: unknown): ActivityAmount | null {
  if (!record(value)) return null;
  const asset_type = bounded(value.asset_type, 40);
  const asset_code = bounded(value.asset_code, 40);
  const asset_issuer = bounded(value.asset_issuer, 100);
  const amount = bounded(value.amount, 80);
  if (!asset_type && !asset_code && !asset_issuer && !amount) return null;
  return { ...(asset_type ? { asset_type } : {}), ...(asset_code ? { asset_code } : {}), ...(asset_issuer ? { asset_issuer } : {}), ...(amount ? { amount } : {}) };
}

export function normalizeActivityOperation(value: unknown): ActivityOperation | null {
  if (!record(value)) return null;
  const id = bounded(value.id, 160);
  const type = bounded(value.type, 80);
  const created_at = bounded(value.created_at, 80);
  if (!id || !type || !created_at) return null;
  const amounts = Array.isArray(value.amounts)
    ? value.amounts.slice(0, 20).map(normalizeAmount).filter((item): item is ActivityAmount => item !== null)
    : undefined;
  const optional = (key: string, max: number) => bounded(value[key], max);
  return {
    id,
    type,
    created_at,
    ...(optional("source_account", 100) ? { source_account: optional("source_account", 100) } : {}),
    ...(optional("account", 100) ? { account: optional("account", 100) } : {}),
    ...(optional("counterparty", 100) ? { counterparty: optional("counterparty", 100) } : {}),
    ...(optional("transaction_hash", 160) ? { transaction_hash: optional("transaction_hash", 160) } : {}),
    ...(amounts?.length ? { amounts } : {}),
  };
}

export function parseActivityPage(value: unknown): ActivityPage {
  if (!record(value)) return { operations: [], next_cursor: null };
  const operations = Array.isArray(value.operations)
    ? value.operations.slice(0, MAX_ACTIVITY_OPERATIONS).map(normalizeActivityOperation).filter((item): item is ActivityOperation => item !== null)
    : [];
  return { operations, next_cursor: bounded(value.next_cursor, 512) ?? null };
}

export function appendActivityPage(current: ActivityOperation[], page: ActivityPage) {
  return Array.from(new Map([...current, ...page.operations].map((operation) => [operation.id, operation])).values()).slice(0, MAX_ACTIVITY_OPERATIONS);
}
