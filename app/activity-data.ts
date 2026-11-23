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

export const MAX_ACTIVITY_OPERATIONS = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length <= maxLength ? value : undefined;
}

function normalizeAmount(value: unknown): ActivityAmount | null {
  if (!isRecord(value)) return null;
  const assetType = boundedString(value.asset_type, 40);
  const assetCode = boundedString(value.asset_code, 40);
  const assetIssuer = boundedString(value.asset_issuer, 100);
  const amount = boundedString(value.amount, 80);
  if (!assetType && !assetCode && !assetIssuer && !amount) return null;
  return {
    ...(assetType ? { asset_type: assetType } : {}),
    ...(assetCode ? { asset_code: assetCode } : {}),
    ...(assetIssuer ? { asset_issuer: assetIssuer } : {}),
    ...(amount ? { amount } : {}),
  };
}

export function normalizeActivityOperation(value: unknown): ActivityOperation | null {
  if (!isRecord(value)) return null;
  const id = boundedString(value.id, 160);
  const type = boundedString(value.type, 80);
  const createdAt = boundedString(value.created_at, 80);
  if (!id || !type || !createdAt) return null;
  const amounts = Array.isArray(value.amounts)
    ? value.amounts.slice(0, 20).map(normalizeAmount).filter((amount): amount is ActivityAmount => amount !== null)
    : undefined;
  return {
    id,
    type,
    created_at: createdAt,
    ...(boundedString(value.source_account, 100) ? { source_account: boundedString(value.source_account, 100) } : {}),
    ...(boundedString(value.account, 100) ? { account: boundedString(value.account, 100) } : {}),
    ...(boundedString(value.counterparty, 100) ? { counterparty: boundedString(value.counterparty, 100) } : {}),
    ...(boundedString(value.transaction_hash, 160) ? { transaction_hash: boundedString(value.transaction_hash, 160) } : {}),
    ...(amounts?.length ? { amounts } : {}),
  };
}

export function parseActivityPage(value: unknown) {
  if (!isRecord(value)) return { operations: [], next_cursor: null };
  const operations = Array.isArray(value.operations)
    ? value.operations.slice(0, MAX_ACTIVITY_OPERATIONS).map(normalizeActivityOperation).filter((operation): operation is ActivityOperation => operation !== null)
    : [];
  return { operations, next_cursor: boundedString(value.next_cursor, 512) ?? null };
}
