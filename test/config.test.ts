import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_API_BASE_URL, resolveApiBase } from "../app/config.ts";

test("uses a safe local default when the public API origin is absent", () => {
  assert.equal(resolveApiBase(undefined), DEFAULT_API_BASE_URL);
  assert.equal(resolveApiBase("   "), DEFAULT_API_BASE_URL);
});

test("normalizes build-time API origins without changing their path", () => {
  assert.equal(resolveApiBase("https://preview.example.test///"), "https://preview.example.test");
  assert.equal(resolveApiBase("https://api.example.test/v1/"), "https://api.example.test/v1");
});

test("does not log or transform the configured value into credentials", () => {
  const origin = "https://api.example.test";
  assert.equal(resolveApiBase(origin), origin);
  assert.ok(!resolveApiBase(origin).includes("Authorization"));
});
