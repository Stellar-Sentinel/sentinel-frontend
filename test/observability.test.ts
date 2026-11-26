import assert from "node:assert/strict";
import test from "node:test";
import { getObservabilityMetadata } from "../app/observability.ts";

test("returns safe Vercel provenance and only the API origin", () => {
  assert.deepEqual(getObservabilityMetadata({
    VERCEL_ENV: "preview",
    VERCEL_DEPLOYMENT_ID: "dpl_123",
    VERCEL_GIT_COMMIT_SHA: "abc123",
    VERCEL_GIT_COMMIT_REF: "fix/177",
    NEXT_PUBLIC_API_BASE_URL: "https://api.example.test/v1?token=should-not-appear",
  }), {
    environment: "preview",
    deployment_id: "dpl_123",
    commit_sha: "abc123",
    commit_ref: "fix/177",
    api_origin: "https://api.example.test",
  });
});

test("strips credentials and paths from API configuration", () => {
  const metadata = getObservabilityMetadata({
    VERCEL_ENV: "production",
    NEXT_PUBLIC_API_BASE_URL: "https://user:password@example.test/private-token",
  });

  assert.deepEqual(metadata, { environment: "production", api_origin: "https://example.test" });
  assert.equal(JSON.stringify(metadata).includes("password"), false);
  assert.equal(JSON.stringify(metadata).includes("private-token"), false);
});

test("does not invent provenance when deployment variables are absent", () => {
  assert.deepEqual(getObservabilityMetadata({ NODE_ENV: "test" }), { environment: "unknown" });
});
