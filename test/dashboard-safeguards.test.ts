import assert from "node:assert/strict";
import test from "node:test";
import { MAX_ASSESSMENT_HISTORY, mergeLoadedEvents, rememberAssessment, safeErrorMessage } from "../app/dashboard-safeguards.ts";
import type { SentinelEvent } from "../app/event-data.ts";

const event = (id: string): SentinelEvent => ({
  id,
  ledger: 42,
  created_at: "2026-01-15T12:34:56Z",
  agent: "G...placeholder",
  subject: "G...placeholder",
  score: 70,
  contract_id: "C...placeholder",
});

test("event retention deduplicates refreshes and caps appended rows", () => {
  const retained = mergeLoadedEvents([event("one"), event("two")], [event("two"), event("three")], true, 2);

  assert.deepEqual(retained.map(({ id }) => id), ["one", "two"]);
  assert.deepEqual(mergeLoadedEvents([], [event("fresh")], false, 2).map(({ id }) => id), ["fresh"]);
});

test("assessment history keeps the newest result once and stays bounded", () => {
  const history = Array.from({ length: MAX_ASSESSMENT_HISTORY }, (_, index) => ({ address: `G...${index}`, score: index }));
  const next = rememberAssessment(history, { address: "G...new", score: 99 });

  assert.equal(next.length, MAX_ASSESSMENT_HISTORY);
  assert.equal(next[0]?.address, "G...new");
  assert.equal(rememberAssessment(next, { address: "G...new", score: 100 })[0]?.score, 100);
});

test("error copy redacts credentials, account identifiers, and hashes", () => {
  const account = `G${"A".repeat(55)}`;
  const hash = "a".repeat(64);
  const message = safeErrorMessage(new Error(`token ghp_${"x".repeat(30)} ${account} ${hash}`), "fallback");

  assert.doesNotMatch(message, /ghp_|G[A-Z2-7]{55}|[a-f0-9]{64}/i);
  assert.match(message, /redacted/);
  assert.ok(message.length <= 180);
});
