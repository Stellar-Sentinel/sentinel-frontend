import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const contract = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "docs", "activity-asset-rendering-contract.md"),
  "utf8",
);

test("documents every asset identity and request state", () => {
  for (const requiredText of [
    "Native",
    "Issued",
    "Unknown asset",
    "Loading asset details",
    "No asset activity to display.",
    "Previously loaded asset details",
    "Asset details are temporarily unavailable.",
    "Retry asset details",
    "Asset identity unavailable",
    "keyboard",
    "prefers-reduced-motion",
  ]) {
    assert.ok(contract.includes(requiredText), `missing contract requirement: ${requiredText}`);
  }
});

test("documented examples contain placeholders rather than credentials", () => {
  assert.match(contract, /<issuer-account>/);
  assert.match(contract, /op-placeholder-issued/);
  assert.doesNotMatch(contract, /-----BEGIN [A-Z ]*PRIVATE KEY-----/i);
  assert.doesNotMatch(contract, /\b(?:password|secret|token|api[_-]?key)\s*[:=]\s*[^\s]+/i);
});
