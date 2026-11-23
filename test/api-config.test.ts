import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_API_BASE_URL, resolveApiConfig } from "../lib/api-config.mjs";

test("uses the safe local default when no public API origin is configured", () => {
  assert.deepEqual(resolveApiConfig(""), {
    baseUrl: DEFAULT_API_BASE_URL,
    source: "default",
    valid: true,
    error: "",
  });
});

test("normalizes an explicit HTTPS origin without retaining a trailing slash", () => {
  assert.deepEqual(resolveApiConfig("https://preview.example.test/"), {
    baseUrl: "https://preview.example.test",
    source: "explicit",
    valid: true,
    error: "",
  });
});

test("rejects secrets, paths, and insecure non-local origins", () => {
  for (const value of [
    "https://user:secret@example.test",
    "https://example.test/api",
    "https://example.test/?token=secret",
    "http://preview.example.test",
    "not a URL",
  ]) {
    const config = resolveApiConfig(value);
    assert.equal(config.valid, false, value);
    assert.equal(config.baseUrl, "", value);
    assert.match(config.error, /configuration is invalid/i);
  }
});
