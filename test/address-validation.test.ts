import assert from "node:assert/strict";
import test from "node:test";
import { validateStellarAddress } from "../app/address-validation.ts";

const classicPlaceholder = "G" + "A".repeat(55);
const muxedPlaceholder = "M" + "A".repeat(68);

test("accepts trimmed classic and muxed address shapes without claiming checksum validity", () => {
  assert.deepEqual(validateStellarAddress(`  ${classicPlaceholder} `), {
    valid: true,
    address: classicPlaceholder,
    kind: "classic",
  });
  const muxed = validateStellarAddress(muxedPlaceholder);
  assert.equal(muxed.valid, true);
  if (muxed.valid) assert.equal(muxed.kind, "muxed");
});

test("rejects empty, wrong-length, and invalid-alphabet values before a request", () => {
  assert.equal(validateStellarAddress(" ").valid, false);
  assert.equal(validateStellarAddress("G" + "A".repeat(54)).valid, false);
  assert.equal(validateStellarAddress("G" + "0".repeat(55)).valid, false);
  assert.equal(validateStellarAddress("M" + "A".repeat(67)).valid, false);
});
