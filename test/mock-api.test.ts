import assert from "node:assert/strict";
import test from "node:test";
import { mockJsonResponse, mockSequence } from "./mock-api.ts";

test("builds a safe JSON success response for mocked frontend data", async () => {
  const response = mockJsonResponse({ events: [], next_cursor: null });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { events: [], next_cursor: null });
});

test("models failure followed by recovery without contacting a real API", async () => {
  const request = mockSequence([
    { status: 503, body: { detail: "temporarily unavailable" } },
    { status: 200, body: { events: [{ id: "evt-placeholder" }] } },
  ]);

  assert.equal((await request()).status, 503);
  const recovered = await request();
  assert.equal(recovered.status, 200);
  assert.deepEqual(await recovered.json(), { events: [{ id: "evt-placeholder" }] });
});
