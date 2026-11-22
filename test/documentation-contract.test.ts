import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const docs = {
  observability: readFileSync("docs/deployment-observability-contract.md", "utf8"),
  privacy: readFileSync("docs/privacy-analytics-ui-contract.md", "utf8"),
};

test("deployment documentation defines states, safe diagnostics, and rollback", () => {
  for (const required of [
    "## User-visible states",
    "## Safe diagnostics",
    "## Preview, release, and rollback",
    "NEXT_PUBLIC_API_BASE_URL",
    "Response fields remain optional",
  ]) {
    assert.ok(docs.observability.replace(/\s+/g, " ").toLowerCase().includes(required.toLowerCase()), `missing: ${required}`);
  }
});

test("privacy documentation protects session data and accessible states", () => {
  for (const required of [
    "## Data boundary",
    "## Interaction states",
    "## Review and verification checklist",
    "localStorage",
    "There is no implicit analytics collection",
    "keyboard",
  ]) {
    assert.ok(docs.privacy.replace(/\s+/g, " ").toLowerCase().includes(required.toLowerCase()), `missing: ${required}`);
  }
});
