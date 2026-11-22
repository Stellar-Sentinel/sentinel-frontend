import assert from "node:assert/strict";
import test from "node:test";
import { evidenceRequestPath, normalizeEvent, parseEventPage } from "../app/event-data.ts";

const event = {
  id: "evt-108",
  ledger: 123,
  created_at: "2026-11-21T00:00:00Z",
  agent: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  subject: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  score: 70,
  contract_id: "CBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  report_digest: "sha256/report 108",
};

test("keeps a bounded report digest so the evidence panel can load it", () => {
  assert.equal(normalizeEvent(event)?.report_digest, "sha256/report 108");
  assert.equal(evidenceRequestPath(event.report_digest), "/evidence/sha256%2Freport%20108");
});

test("ignores malformed optional digests without dropping the on-chain event", () => {
  const normalized = normalizeEvent({ ...event, report_digest: "x".repeat(161) });

  assert.equal(normalized?.id, "evt-108");
  assert.equal(normalized?.report_digest, undefined);
});

test("preserves a valid pagination cursor while bounding the event page", () => {
  const page = parseEventPage({ events: Array.from({ length: 101 }, (_, index) => ({ ...event, id: `evt-${index}` })), next_cursor: "cursor-2" });

  assert.equal(page.events.length, 100);
  assert.equal(page.next_cursor, "cursor-2");
});
