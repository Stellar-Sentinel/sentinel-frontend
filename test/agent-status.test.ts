import assert from "node:assert/strict";
import test from "node:test";

import { normalizeAgentStatus, unknownAgentStatus } from "../app/agent-status.ts";

test("normalizes the public healthy status and optional metrics", () => {
  assert.deepEqual(normalizeAgentStatus({ status: "healthy", last_cycle_at: "2026-01-01T00:00:00Z", flags_filed: 2 }), {
    status: "healthy",
    label: "Healthy",
    detail: "The monitoring agent is reporting normally.",
    lastCycleAt: "2026-01-01T00:00:00Z",
    flagsFiled: 2,
  });
});

test("keeps disabled explicit and ignores sensitive or malformed fields", () => {
  const result = normalizeAgentStatus({ enabled: false, secret_key: "must not render", flags_filed: -1, last_cycle_at: 42 });
  assert.equal(result.status, "disabled");
  assert.equal(result.flagsFiled, null);
  assert.equal(result.lastCycleAt, null);
  assert.equal(JSON.stringify(result).includes("secret_key"), false);
});

test("uses unknown for unavailable, malformed, and unsupported responses", () => {
  assert.equal(normalizeAgentStatus(null).status, "unknown");
  assert.equal(normalizeAgentStatus({ status: "running" }).status, "unknown");
  assert.equal(unknownAgentStatus("Older backend does not expose agent status.").detail, "Older backend does not expose agent status.");
});
