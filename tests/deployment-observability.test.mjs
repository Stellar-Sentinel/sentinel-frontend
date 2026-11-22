import assert from "node:assert/strict";
import { test } from "node:test";

import { apiOrigin, getDeploymentMetadata, runtimeDiagnostic } from "../lib/deployment-observability.mjs";

test("deployment metadata is public, bounded, and build-provenance aware", () => {
  assert.deepEqual(getDeploymentMetadata({
    NEXT_PUBLIC_VERCEL_ENV: "production",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: "1234567890abcdef",
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: "main\nforged-header",
    NEXT_PUBLIC_VERCEL_URL: "sentinel.example",
  }), {
    environment: "production",
    commit: "1234567890ab",
    ref: "mainforged-header",
    url: "sentinel.example",
  });
});

test("API diagnostics expose only an origin and safe deployment context", () => {
  assert.equal(apiOrigin("https://api.example.test/v1/"), "https://api.example.test");
  assert.equal(apiOrigin("not a URL"), "unknown API origin");

  const diagnostic = runtimeDiagnostic("https://api.example.test", {
    environment: "preview",
    commit: "abc123",
  });
  assert.equal(diagnostic, "API origin: https://api.example.test · deployment: preview · commit: abc123");
  assert.doesNotMatch(diagnostic, /password|secret|token|private.?key/i);
});
