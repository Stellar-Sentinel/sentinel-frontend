import assert from "node:assert/strict";
import test from "node:test";
import { rememberAssessment, removeAssessment } from "../app/assessment-history.ts";

const assessment = (address: string, score: number) => ({ address, score });

test("keeps the newest five unique assessments and refreshes an existing address", () => {
  const existing = [1, 2, 3, 4, 5].map((score) => assessment(`G${score}`, score));
  const updated = rememberAssessment(existing, assessment("G3", 30));

  assert.deepEqual(updated.map((item) => item.address), ["G3", "G1", "G2", "G4", "G5"]);
  assert.equal(updated.length, 5);
  assert.equal(updated[0].score, 30);
});

test("does not mutate the existing history when a new assessment is remembered", () => {
  const existing = [assessment("G1", 1)];
  const updated = rememberAssessment(existing, assessment("G2", 2));

  assert.deepEqual(existing.map((item) => item.address), ["G1"]);
  assert.deepEqual(updated.map((item) => item.address), ["G2", "G1"]);
});

test("removes only the selected assessment", () => {
  const existing = [assessment("G1", 1), assessment("G2", 2), assessment("G3", 3)];

  assert.deepEqual(removeAssessment(existing, "G2").map((item) => item.address), ["G1", "G3"]);
});
