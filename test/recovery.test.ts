import assert from "node:assert/strict";
import test from "node:test";
import { networkUnavailableMessage, safeErrorMessage } from "../app/recovery.ts";

test("uses actionable copy for unavailable RPC status", () => {
  assert.equal(networkUnavailableMessage(), "We couldn’t check RPC health. Try again.");
});

test("redacts credentials and account identifiers from recovery errors", () => {
  const error = new Error("token ghp_abc123 and account GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  assert.equal(safeErrorMessage(error, "fallback"), "token [redacted] and account [account redacted]");
});
