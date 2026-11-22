import assert from "node:assert/strict";
import test from "node:test";
import { formatActivityAmount } from "../app/activity-data.ts";

test("renders native activity amounts as XLM", () => {
  assert.equal(formatActivityAmount({ amount: "12.50", asset_type: "native" }), "12.50 XLM");
});

test("keeps an issued asset code and issuer distinct from XLM", () => {
  assert.equal(
    formatActivityAmount({ amount: "7.25", asset_type: "credit_alphanum4", asset_code: "USDC", asset_issuer: "GISSUER" }),
    "7.25 USDC · issuer GISSUER",
  );
});

test("does not infer an issued asset code from its asset type", () => {
  assert.equal(
    formatActivityAmount({ amount: "3.00", asset_type: "credit_alphanum12", asset_issuer: "GISSUER" }),
    "3.00 Unknown asset · issuer GISSUER",
  );
});

test("uses safe placeholders for malformed optional fields", () => {
  assert.equal(formatActivityAmount({ amount: "  ", asset_type: "credit_alphanum4", asset_code: "  " }), "— Unknown asset");
});
