import assert from "node:assert/strict";
import test from "node:test";
import { appendActivityPage, MAX_ACTIVITY_OPERATIONS, normalizeActivityOperation, parseActivityPage } from "../app/activity-data.ts";

const operation = {
  id: "op-1",
  type: "payment",
  created_at: "2026-11-20T12:34:56Z",
  counterparty: "G...counterparty",
  transaction_hash: "tx-1",
  amounts: [{ asset_type: "native", asset_code: "XLM", amount: "12.5" }],
};

test("preserves an opaque cursor while parsing a bounded page", () => {
  const page = parseActivityPage({ operations: [operation], next_cursor: "cursor-page-2" });
  assert.deepEqual(page.operations, [operation]);
  assert.equal(page.next_cursor, "cursor-page-2");
});

test("drops malformed rows and unsafe optional fields", () => {
  const normalized = normalizeActivityOperation({ ...operation, amounts: [{ amount: "12.5", asset_code: "XLM" }, { amount: { secret: "drop" } }], transaction_hash: "x".repeat(161) });
  const page = parseActivityPage({ operations: [normalized, { id: "missing-type" }, null] });
  assert.equal(page.operations.length, 1);
  assert.equal(page.operations[0].transaction_hash, undefined);
  assert.deepEqual(page.operations[0].amounts, [{ asset_code: "XLM", amount: "12.5" }]);
});

test("deduplicates overlapping pages and caps retained operations", () => {
  const first = parseActivityPage({ operations: Array.from({ length: 99 }, (_, index) => ({ ...operation, id: `op-${index}` })), next_cursor: "cursor" });
  const second = parseActivityPage({ operations: [{ ...operation, id: "op-98", type: "updated-payment" }, { ...operation, id: "op-99" }, { ...operation, id: "op-100" }] });
  const merged = appendActivityPage(first.operations, second);
  assert.equal(MAX_ACTIVITY_OPERATIONS, 100);
  assert.equal(merged.length, MAX_ACTIVITY_OPERATIONS);
  assert.equal(merged.find((item) => item.id === "op-98")?.type, "updated-payment");
  assert.equal(merged.at(-1)?.id, "op-99");
});

test("invalid page shapes and cursors fail closed", () => {
  assert.deepEqual(parseActivityPage(null), { operations: [], next_cursor: null });
  assert.deepEqual(parseActivityPage({ operations: [], next_cursor: "x".repeat(513) }), { operations: [], next_cursor: null });
});
