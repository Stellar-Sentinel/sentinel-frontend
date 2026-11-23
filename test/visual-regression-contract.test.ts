import assert from "node:assert/strict";
import test from "node:test";
import {
  fixtureText,
  visualRegressionFixtures,
  visualRegressionStates,
} from "./visual-regression-fixtures.ts";

test("visual regression fixtures cover every documented dashboard state", () => {
  assert.deepEqual(visualRegressionStates, [
    "loading",
    "empty",
    "success",
    "stale",
    "error",
    "recovery",
  ]);

  for (const state of visualRegressionStates) {
    const fixture = visualRegressionFixtures[state];
    assert.ok(fixture.heading);
    assert.ok(fixture.status);
    assert.match(fixture.account, /^G\.\.\.placeholder$/);
  }
});

test("fixtures contain no real account, transaction, or credential data", () => {
  for (const state of visualRegressionStates) {
    const text = fixtureText(state);

    assert.doesNotMatch(text, /-----BEGIN|PRIVATE KEY|secret|token|api[_-]?key/i);
    assert.doesNotMatch(text, /G[A-Z2-7]{55,}/);
    assert.doesNotMatch(text, /C[A-Z2-7]{55,}/);
    assert.doesNotMatch(text, /[a-f0-9]{64}/i);
    assert.doesNotMatch(text, /https?:\/\/[^\s]+/i);
  }
});

test("recovery fixture represents a successful retry without a second event id", () => {
  assert.equal(visualRegressionFixtures.recovery.transaction, "evt-placeholder");
  assert.notEqual(visualRegressionFixtures.recovery.status, "Unable to load data");
});
