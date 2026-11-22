import assert from "node:assert/strict";
import test from "node:test";

const networks = new Map([
  ["testnet", "testnet"],
  ["test sdf network ; september 2015", "testnet"],
  ["public", "public"],
  ["public global stellar network ; september 2015", "public"],
]);
const resources = new Set(["account", "contract", "tx", "ledger"]);

function contractUrl(network: string | undefined, resource: string, identifier: string): string | null {
  const segment = networks.get(network?.trim().toLowerCase() ?? "");
  if (!segment || !resources.has(resource) || !identifier.trim()) return null;
  return `https://stellar.expert/explorer/${segment}/${resource}/${encodeURIComponent(identifier)}`;
}

test("covers every supported explorer resource and canonical network alias", () => {
  for (const resource of resources) {
    assert.match(contractUrl("Test SDF Network ; September 2015", resource, "<placeholder>" ) ?? "", new RegExp(`/testnet/${resource}/`));
  }
  assert.match(contractUrl("Public Global Stellar Network ; September 2015", "account", "<placeholder>") ?? "", /\/public\/account\//);
});

test("keeps unknown networks, blank identifiers, and near matches as text", () => {
  assert.equal(contractUrl("private", "tx", "<placeholder>"), null);
  assert.equal(contractUrl("testnetnet", "tx", "<placeholder>"), null);
  assert.equal(contractUrl(undefined, "contract", "<placeholder>"), null);
  assert.equal(contractUrl("public", "tx", "   "), null);
});

test("encodes identifiers as one path segment and never includes credentials", () => {
  const url = contractUrl("public", "contract", "C/example") ?? "";
  assert.equal(url, "https://stellar.expert/explorer/public/contract/C%2Fexample");
  assert.doesNotMatch(url, /PRIVATE KEY|token|secret|@/i);
});
