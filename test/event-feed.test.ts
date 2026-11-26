import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEvent, parseEventPage } from "../app/event-data.ts";

const legacy = {
  id: "evt-legacy",
  ledger: 123,
  created_at: "2026-01-15T12:34:56Z",
  agent: "G...agent",
  subject: "G...subject",
  score: 70,
  contract_id: "C...contract",
};

test("normalizes a legacy event without inventing digest or transaction data", () => {
  const event = normalizeEvent(legacy);

  assert.equal(event?.id, "evt-legacy");
  assert.equal(event?.report_digest, undefined);
  assert.equal(event?.transaction_hash, undefined);
});

test("keeps a digest-bearing event's optional references bounded", () => {
  const page = parseEventPage({ events: [{ ...legacy, report_digest: "sha256/example", tx_hash: "tx/example" }], next_cursor: "opaque" });

  assert.equal(page.events[0].report_digest, "sha256/example");
  assert.equal(page.events[0].tx_hash, undefined);
  assert.equal(page.events[0].transaction_hash, "tx/example");
  assert.equal(page.next_cursor, "opaque");
});

test("drops malformed rows while retaining a valid page for recovery", () => {
  const page = parseEventPage({ events: [legacy, { id: "malformed", score: "unknown" }], next_cursor: null });

  assert.deepEqual(page.events.map((event) => event.id), ["evt-legacy"]);
  assert.equal(page.next_cursor, null);
});

test("bounds an oversized page before rendering or retrying", () => {
  const page = parseEventPage({ events: Array.from({ length: 101 }, (_, index) => ({ ...legacy, id: `evt-${index}` })) });

  assert.equal(page.events.length, 100);
});
