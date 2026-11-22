import assert from "node:assert/strict";
import test from "node:test";
import { parseEventPage } from "../app/event-data.ts";

const event = {
  id: "evt-freshness-1",
  ledger: 123,
  created_at: "2026-11-21T00:00:00Z",
  agent: "<monitoring-agent>",
  subject: "<subject-account>",
  score: 72,
  contract_id: "<contract-id>",
};

function page(source?: Record<string, unknown>) {
  return { events: [event], next_cursor: "cursor-next", source: { rpc_url: "https://rpc.example.test", network: "Testnet", ...source } };
}

test("preserves current and stale ingestion observations from a successful response", () => {
  assert.equal(parseEventPage(page({ ingestion_status: "current" })).source?.ingestion_status, "current");
  assert.equal(parseEventPage(page({ ingestion_status: "stale" })).source?.ingestion_status, "stale");
});

test("treats missing and malformed optional freshness fields as unknown", () => {
  assert.equal(parseEventPage(page()).source?.ingestion_status, undefined);
  assert.equal(parseEventPage(page({ ingestion_status: "delayed" })).source?.ingestion_status, "unknown");
  assert.equal(parseEventPage(page({ ingestion_status: 90 })).source?.ingestion_status, undefined);
});

test("keeps empty successful feeds distinct from unavailable responses", () => {
  const parsed = parseEventPage({ events: [], next_cursor: null, source: { rpc_url: "https://rpc.example.test", network: "Testnet", ingestion_status: "stale" } });

  assert.deepEqual(parsed.events, []);
  assert.equal(parsed.source?.ingestion_status, "stale");
});

test("preserves pagination metadata while limiting the mocked event page", () => {
  const parsed = parseEventPage({ ...page({ ingestion_status: "current" }), events: Array.from({ length: 101 }, (_, index) => ({ ...event, id: `evt-${index}` })) });

  assert.equal(parsed.events.length, 100);
  assert.equal(parsed.next_cursor, "cursor-next");
  assert.equal(parsed.source?.ingestion_status, "current");
});

test("rejects malformed backend pages so the UI can enter its retry state", () => {
  assert.throws(() => parseEventPage({ events: "not-an-array" }), /invalid response/i);
});
