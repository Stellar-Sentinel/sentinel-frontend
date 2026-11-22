import assert from "node:assert/strict";
import test from "node:test";
import { parseEventPage } from "../app/event-data.ts";
import { parseFixture, visualFixtures } from "./visual-fixtures.ts";

test("fixtures cover the dashboard loading, empty, degraded, unavailable, and recovery states", () => {
  assert.equal(visualFixtures.loading.pending, true);
  assert.equal(visualFixtures.empty.events.length, 0);
  assert.match(visualFixtures.degraded.error ?? "", /optional fields/);
  assert.match(visualFixtures.unavailable.error ?? "", /Unable to load/);
  assert.equal(parseFixture("recovery").events.length, 1);
});

test("success fixture preserves optional fields without requiring them", () => {
  const page = parseFixture("success");

  assert.equal(page.events[0]?.id, "evt-placeholder");
  assert.equal(page.events[0]?.report_digest, undefined);
  assert.equal(page.events[0]?.transaction_hash, undefined);
});

test("malformed rows are ignored and pagination cursors remain stable", () => {
  const page = parseEventPage({
    events: [...visualFixtures.success.events, { id: "bad", score: "not-a-number" }],
    next_cursor: "cursor-placeholder",
  });

  assert.equal(page.events.length, 1);
  assert.equal(page.next_cursor, "cursor-placeholder");
});

test("mocked fixture data contains no credentials or real account data", () => {
  const serialized = JSON.stringify(visualFixtures);

  assert.doesNotMatch(serialized, /PRIVATE KEY|token|api[_-]?key|secret/i);
  assert.doesNotMatch(serialized, /G[A-Z2-7]{55,}|C[A-Z2-7]{55,}/);
  assert.doesNotMatch(serialized, /[a-f0-9]{64}/i);
});
