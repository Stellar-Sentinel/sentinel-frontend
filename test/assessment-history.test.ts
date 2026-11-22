import assert from "node:assert/strict";
import test from "node:test";
import { addAssessment, MAX_ASSESSMENT_HISTORY, removeAssessment } from "../app/assessment-history.ts";

const assessment = (address: string, score = 10) => ({ address, score });

test("prepends successful assessments, replaces duplicate addresses, and caps history", () => {
  const history = Array.from({ length: MAX_ASSESSMENT_HISTORY }, (_, index) => assessment(`G${index}`));

  assert.deepEqual(addAssessment(history, assessment("G-new")), [
    assessment("G-new"), assessment("G0"), assessment("G1"), assessment("G2"), assessment("G3"),
  ]);
  assert.deepEqual(addAssessment(history, assessment("G2", 99)), [
    assessment("G2", 99), assessment("G0"), assessment("G1"), assessment("G3"), assessment("G4"),
  ]);
});

test("removes only the requested address and leaves the displayed result independent", () => {
  const history = [assessment("G1"), assessment("G2"), assessment("G1", 99)];

  assert.deepEqual(removeAssessment(history, "G1"), [assessment("G2")]);
  assert.deepEqual(history[0], assessment("G1"));
});
