import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_API_BASE_URL, resolveApiBase } from "../app/config.ts";

test("uses the safe local default when the public API base is absent", () => {
  assert.equal(resolveApiBase(undefined), DEFAULT_API_BASE_URL);
  assert.equal(resolveApiBase("   "), DEFAULT_API_BASE_URL);
});

test("trims trailing slashes without changing an API path", () => {
  assert.equal(resolveApiBase(" https://preview.example.test/// "), "https://preview.example.test");
  assert.equal(resolveApiBase("https://api.example.test/v1/"), "https://api.example.test/v1");
});

test("keeps the configured value public and unchanged apart from normalization", () => {
  const publicBase = "https://api.example.test";
  assert.equal(resolveApiBase(publicBase), publicBase);
  assert.ok(!resolveApiBase(publicBase).includes("Authorization"));
});
