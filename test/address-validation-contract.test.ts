import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const contract = fs.readFileSync(new URL("../docs/stellar-address-validation.md", import.meta.url), "utf8");

test("keeps client validation format-only and prevents malformed requests", () => {
  assert.match(page, /function isStellarPublicKeyFormat/);
  assert.match(page, /!isStellarPublicKeyFormat\(account\)/);
  assert.match(page, /setRiskError\("Enter a 56-character G-prefixed Stellar public account address\."\)/);
});

test("documents accessible, network-agnostic validation boundaries", () => {
  assert.match(contract, /network-agnostic/);
  assert.match(contract, /aria-invalid/);
  assert.match(contract, /backend remains authoritative/);
  assert.match(contract, /wrong prefix/);
});
