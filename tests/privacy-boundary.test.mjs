import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { MAX_IN_MEMORY_ASSESSMENTS, retainRecentAssessments } from "../lib/privacy-boundary.mjs";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const boundarySource = await readFile(new URL("../lib/privacy-boundary.mjs", import.meta.url), "utf8");

test("recent assessments are bounded, newest-first, and deduplicated in memory", () => {
  const current = Array.from({ length: MAX_IN_MEMORY_ASSESSMENTS }, (_, index) => ({ address: `G${index}` }));
  const next = retainRecentAssessments(current, { address: "G-new" });

  assert.deepEqual(next.map(({ address }) => address), ["G-new", "G0", "G1", "G2", "G3"]);
  assert.deepEqual(current.map(({ address }) => address), ["G0", "G1", "G2", "G3", "G4"]);
});

test("a repeated assessment replaces its previous in-memory entry", () => {
  const current = [{ address: "G-old" }, { address: "G-repeat" }, { address: "G-other" }];

  assert.deepEqual(
    retainRecentAssessments(current, { address: "G-repeat" }).map(({ address }) => address),
    ["G-repeat", "G-old", "G-other"],
  );
});

test("the page and retention helper do not add persistence or analytics sinks", () => {
  const forbidden = /localStorage|sessionStorage|document\.cookie|sendBeacon|google-analytics|gtag\(|posthog|segment|amplitude|sentry/i;

  assert.doesNotMatch(pageSource, forbidden);
  assert.doesNotMatch(boundarySource, forbidden);
  assert.match(pageSource, /retainRecentAssessments/);
  assert.match(pageSource, /setAssessmentHistory\(\(current\) => retainRecentAssessments\(current, result\)\)/);
});
