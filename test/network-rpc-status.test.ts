import assert from "node:assert/strict";
import test from "node:test";
import { parseNetworkStatus } from "../app/network-status.ts";

const healthy = {
  network: "Test SDF Network ; September 2015",
  rpc_url: "https://soroban-testnet.stellar.org?credential=must-not-render",
  status: "healthy",
  latest_ledger: 123456,
  oldest_ledger: 123000,
  observed_at: "2026-11-22T10:00:00Z",
};

test("normalizes a healthy network/RPC response without retaining rpc_url", () => {
  const status = parseNetworkStatus(healthy);

  assert.deepEqual(status, {
    network: healthy.network,
    status: "healthy",
    latest_ledger: 123456,
    oldest_ledger: 123000,
    observed_at: healthy.observed_at,
  });
  assert.equal("rpc_url" in (status ?? {}), false);
});

test("preserves an explicit degraded RPC observation", () => {
  const status = parseNetworkStatus({ ...healthy, status: "degraded", latest_ledger: null });

  assert.equal(status?.status, "degraded");
  assert.equal(status?.latest_ledger, null);
});

test("treats malformed optional ledger fields as unavailable", () => {
  const status = parseNetworkStatus({ ...healthy, latest_ledger: "123456", oldest_ledger: -1 });

  assert.equal(status?.latest_ledger, null);
  assert.equal(status?.oldest_ledger, null);
});

test("rejects a response missing required identity or observation fields", () => {
  assert.equal(parseNetworkStatus({ ...healthy, network: undefined }), null);
  assert.equal(parseNetworkStatus({ ...healthy, observed_at: "" }), null);
  assert.equal(parseNetworkStatus(null), null);
});

test("bounds untrusted status strings", () => {
  const status = parseNetworkStatus({ ...healthy, network: "n".repeat(200), status: "s".repeat(200), observed_at: "o".repeat(200) });

  assert.equal(status?.network.length, 80);
  assert.equal(status?.status.length, 40);
  assert.equal(status?.observed_at.length, 80);
});

test("status retry is a keyboard-reachable button in the page contract", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../app/page.tsx", import.meta.url), "utf8"));

  assert.match(source, /button className=\"network-retry\"/);
  assert.match(source, /Retry status check/);
  assert.match(source, /onClick=\{\(\) => void loadNetworkStatus\(\)\}/);
});
