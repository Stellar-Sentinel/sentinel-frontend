import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEvent, parseEventPage } from "../app/event-data.ts";

const event = {
  id: "evt-recovery",
  ledger: 123,
  created_at: "2026-01-15T12:34:56Z",
  agent: "G...agent",
  subject: "G...subject",
  score: 70,
  contract_id: "C...contract",
};

test("keeps a usable page when optional event references are absent", () => {
  const page = parseEventPage({ events: [event], next_cursor: null });

  assert.equal(page.events.length, 1);
  assert.equal(page.events[0].transaction_hash, undefined);
  assert.equal(page.events[0].report_digest, undefined);
});

test("drops malformed optional fields without dropping the on-chain event", () => {
  const normalized = normalizeEvent({ ...event, transaction_hash: { unexpected: true }, report_digest: "x".repeat(161) });

  assert.equal(normalized?.id, event.id);
  assert.equal(normalized?.transaction_hash, undefined);
  assert.equal(normalized?.report_digest, undefined);
});

test("makes empty history explicit and preserves a valid cursor", () => {
  assert.deepEqual(parseEventPage({ events: [], next_cursor: "opaque-retry-cursor" }), { events: [], next_cursor: "opaque-retry-cursor", source: undefined });
});

test("bounds malformed pages instead of rendering untrusted rows", () => {
  const page = parseEventPage({ events: [event, null, { id: "missing-required-fields" }] });

  assert.equal(page.events.length, 1);
  assert.equal(page.events[0].id, event.id);
});
