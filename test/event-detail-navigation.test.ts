import assert from "node:assert/strict";
import test from "node:test";
import { closeEventDetailUrl, eventDetailUrl, eventIdFromSearch, selectedEvent } from "../app/event-detail-navigation.ts";

test("opens an event detail route without dropping unrelated query state", () => {
  const url = eventDetailUrl("https://sentinel.test/?network=testnet#events", "evt-103");

  assert.equal(url, "https://sentinel.test/?network=testnet&event=evt-103#events");
  assert.equal(eventIdFromSearch(new URL(url).search), "evt-103");
});

test("closes the detail route while preserving unrelated query state", () => {
  assert.equal(
    closeEventDetailUrl("https://sentinel.test/?network=testnet&event=evt-103#events"),
    "https://sentinel.test/?network=testnet#events",
  );
});

test("keeps unknown deep links explicit instead of selecting a different event", () => {
  const events = [{ id: "evt-1" }, { id: "evt-2", report_digest: null }];

  assert.deepEqual(selectedEvent(events, "missing"), null);
  assert.deepEqual(selectedEvent(events, "evt-2"), events[1]);
  assert.equal(eventIdFromSearch("?event=%E0%A4%A"), "�%A");
});
