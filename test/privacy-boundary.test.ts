import assert from "node:assert/strict";
import test from "node:test";
import { MAX_SESSION_ASSESSMENTS, retainRecentAssessments, sanitizeTelemetry } from "../app/privacy.ts";

test("retains only the bounded in-session assessment history", () => {
  assert.equal(MAX_SESSION_ASSESSMENTS, 5);
  assert.deepEqual(retainRecentAssessments([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 5]);
  assert.deepEqual(retainRecentAssessments([1, 2], 0), []);
});

test("telemetry allowlist excludes account and response data", () => {
  assert.deepEqual(sanitizeTelemetry({
    route: "/events",
    status_class: "5xx",
    latency_bucket: "slow",
    deployment_id: "preview-123",
    address: "G...account",
    score: 91,
    response: "private backend response",
  }), {
    route: "/events",
    status_class: "5xx",
    latency_bucket: "slow",
    deployment_id: "preview-123",
  });
});

test("telemetry values are bounded even when callers provide oversized fields", () => {
  assert.deepEqual(sanitizeTelemetry({ route: "x".repeat(161), status_class: "timeout" }), { status_class: "timeout" });
});
