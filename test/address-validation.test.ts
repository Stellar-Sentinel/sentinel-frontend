import assert from "node:assert/strict";
import test from "node:test";
import { isStellarAddressFormat } from "../app/address-validation.ts";

const classicAddress = `G${"A".repeat(55)}`;
const muxedAddress = `M${"A".repeat(68)}`;

test("accepts bounded classic and muxed Stellar address shapes", () => {
  assert.equal(isStellarAddressFormat(classicAddress), true);
  assert.equal(isStellarAddressFormat(muxedAddress), true);
});

test("rejects malformed addresses before an upstream request", () => {
  assert.equal(isStellarAddressFormat(""), false);
  assert.equal(isStellarAddressFormat(`G${"A".repeat(54)}`), false);
  assert.equal(isStellarAddressFormat(`M${"A".repeat(67)}`), false);
  assert.equal(isStellarAddressFormat(`G${"0".repeat(55)}`), false);
  assert.equal(isStellarAddressFormat(`g${"A".repeat(55)}`), false);
});

test("does not claim checksum validation", () => {
  assert.equal(isStellarAddressFormat(`G${"B".repeat(55)}`), true);
});
