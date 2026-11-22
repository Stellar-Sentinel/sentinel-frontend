import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const contract = fs.readFileSync(new URL("../docs/account-assessment-history.md", import.meta.url), "utf8");

test("bounds session history and exposes an announced history region", () => {
  assert.match(page, /MAX_ASSESSMENT_HISTORY\s*=\s*5/);
  assert.match(page, /assessment-history[^>]*aria-live="polite"/);
  assert.match(page, /slice\(0, MAX_ASSESSMENT_HISTORY\)/);
});

test("documents the non-persistent privacy boundary and degraded states", () => {
  assert.match(contract, /session-only/);
  assert.match(contract, /local storage/);
  assert.match(contract, /Loading/);
  assert.match(contract, /Stale/);
  assert.match(contract, /Retry\/unavailable/);
});
