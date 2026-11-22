import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSignals } from "../app/signal-data.ts";

const placeholderSignal = {
  id: "placeholder-signal",
  label: "Placeholder activity",
  value: 3,
  severity: "HIGH",
  points: 12,
  explanation: "Placeholder explanation for a deterministic test.",
  source: "placeholder observation",
  observed_at: "2026-01-15T12:00:00Z",
  window: "placeholder window",
};

test("normalizes signal fields used by the explanation card", () => {
  assert.deepEqual(normalizeSignals([placeholderSignal]), [{
    ...placeholderSignal,
    severity: "high",
  }]);
});

test("keeps the card safe when optional fields are malformed or missing", () => {
  assert.deepEqual(normalizeSignals([
    { label: "Placeholder missing fields" },
    { label: "Placeholder malformed fields", value: {}, points: "unknown", severity: "future" },
    { value: "not a signal" },
  ]), [
    { label: "Placeholder missing fields", severity: "info" },
    { label: "Placeholder malformed fields", severity: "info" },
  ]);
});

test("renders no fabricated cards for an absent or invalid signal list", () => {
  assert.deepEqual(normalizeSignals(undefined), []);
  assert.deepEqual(normalizeSignals({ signals: [placeholderSignal] }), []);
});
