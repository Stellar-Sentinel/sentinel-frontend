import assert from "node:assert/strict";
import test from "node:test";
import {
  SCREENING_ADDRESS_ERROR,
  isStellarPublicKeyFormat,
  normalizeScreeningSignals,
  rememberAssessment,
  screeningRequestBody,
  validateScreeningAddress,
} from "../app/screening-data.ts";

const account = "GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234".slice(0, 56);

test("accepts a public key format and trims the request payload", () => {
  assert.equal(isStellarPublicKeyFormat(account), true);
  assert.deepEqual(screeningRequestBody(`  ${account}  `), { address: account });
  assert.equal(validateScreeningAddress(`  ${account}  `), null);
});

test("reports invalid screening input without making a request", () => {
  assert.equal(validateScreeningAddress("not-an-account"), SCREENING_ADDRESS_ERROR);
  assert.equal(validateScreeningAddress(""), SCREENING_ADDRESS_ERROR);
});

test("deduplicates and bounds successful assessment history for retry-safe recovery", () => {
  const history = Array.from({ length: 5 }, (_, index) => ({ address: `G${index}` }));
  const result = { address: "G2" };

  assert.deepEqual(rememberAssessment(history, result), [result, { address: "G0" }, { address: "G1" }, { address: "G3" }, { address: "G4" }]);
});

test("keeps valid signals while dropping malformed optional fields and rows", () => {
  const signals = normalizeScreeningSignals([
    { id: "velocity", label: "Transfer velocity", value: 4, points: 8, severity: "high" },
    { label: "Optional fields may be absent" },
    { label: 42 },
    null,
  ]);

  assert.deepEqual(signals, [
    { id: "velocity", label: "Transfer velocity", value: 4, severity: "high", points: 8, explanation: undefined, source: undefined, observed_at: undefined, window: undefined },
    { id: undefined, label: "Optional fields may be absent", value: undefined, severity: undefined, points: undefined, explanation: undefined, source: undefined, observed_at: undefined, window: undefined },
  ]);
});
