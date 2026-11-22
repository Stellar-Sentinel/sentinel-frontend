import assert from "node:assert/strict";
import test from "node:test";
import { getEventFeedState } from "../app/event-feed-state.ts";

const event = {
  id: "evt-1",
  ledger: 1,
  created_at: "2026-01-01T00:00:00Z",
  agent: "G...agent",
  subject: "G...subject",
  score: 70,
  contract_id: "C...contract",
};

test("models the initial loading state without requiring a browser", () => {
  assert.deepEqual(getEventFeedState({ events: [], loading: true, error: "" }), { kind: "loading" });
});

test("models unavailable and empty responses explicitly", () => {
  assert.deepEqual(getEventFeedState({ events: [], loading: false, error: "Backend unavailable" }), { kind: "unavailable", message: "Backend unavailable" });
  assert.deepEqual(getEventFeedState({ events: [], loading: false, error: "" }), { kind: "empty" });
});

test("preserves loaded events as a degraded, retryable state", () => {
  assert.deepEqual(getEventFeedState({ events: [event], loading: false, error: "Older page failed" }), { kind: "degraded", message: "Older page failed", retry: true });
});

test("models a successful event feed", () => {
  assert.deepEqual(getEventFeedState({ events: [event], loading: false, error: "" }), { kind: "ready" });
});
