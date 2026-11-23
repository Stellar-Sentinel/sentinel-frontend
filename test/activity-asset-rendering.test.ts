import assert from "node:assert/strict";
import test from "node:test";
import { normalizeActivityOperation } from "../app/activity-data.ts";

test("preserves native and issued asset identity without relabeling amounts", () => {
  const operation = normalizeActivityOperation({
    id: "op-placeholder-assets",
    type: "payment",
    created_at: "2026-01-15T12:34:56Z",
    amounts: [
      { asset_type: "native", amount: "12.5000000" },
      { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "<issuer-account>", amount: "3.25" },
    ],
  });

  assert.deepEqual(operation?.amounts, [
    { asset_type: "native", amount: "12.5000000" },
    { asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "<issuer-account>", amount: "3.25" },
  ]);
});

test("retains incomplete asset identity so the UI can render Unknown asset", () => {
  const operation = normalizeActivityOperation({
    id: "op-placeholder-unknown",
    type: "path_payment",
    created_at: "2026-01-15T12:34:56Z",
    amounts: [{ asset_type: "credit_alphanum4", amount: "7" }],
  });

  assert.deepEqual(operation?.amounts, [{ asset_type: "credit_alphanum4", amount: "7" }]);
});
