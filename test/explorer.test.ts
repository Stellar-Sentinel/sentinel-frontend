import assert from "node:assert/strict";
import test from "node:test";
import { explorerUrl } from "../app/explorer.ts";

const account = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

test("maps supported Stellar networks to the matching explorer path", () => {
  assert.equal(explorerUrl("Test SDF Network ; September 2015", "account", account), `https://stellar.expert/explorer/testnet/account/${account}`);
  assert.equal(explorerUrl("public", "contract", "C/example"), "https://stellar.expert/explorer/public/contract/C%2Fexample");
  assert.equal(explorerUrl("testnet", "ledger", "123"), "https://stellar.expert/explorer/testnet/ledger/123");
  assert.equal(explorerUrl(" Public Global Stellar Network ; September 2015 ", "tx", "hash"), "https://stellar.expert/explorer/public/tx/hash");
});

test("encodes explorer identifiers as a single URL path segment", () => {
  assert.equal(explorerUrl("Public Global Stellar Network ; September 2015", "tx", "tx hash?1"), "https://stellar.expert/explorer/public/tx/tx%20hash%3F1");
});

test("does not link unknown networks or missing identifiers", () => {
  assert.equal(explorerUrl("private public-like network", "account", account), null);
  assert.equal(explorerUrl("testnet", "tx", "   "), null);
  assert.equal(explorerUrl(undefined, "tx", "hash"), null);
  assert.equal(explorerUrl("testnetnet", "tx", "hash"), null);
});
