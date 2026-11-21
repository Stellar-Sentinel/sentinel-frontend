import assert from "node:assert/strict";
import test from "node:test";
import { redactSensitiveText } from "../app/privacy.ts";

test("redacts credentials, account identifiers, and hashes from user-facing errors", () => {
  const message = "account GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA token " + "gh" + "p_example123 hash " + "a".repeat(64);

  assert.equal(redactSensitiveText(message), "account [redacted] token [redacted] hash [redacted]");
});

test("bounds redacted errors without persisting or logging the source", () => {
  assert.equal(redactSensitiveText("x".repeat(200), 20), "x".repeat(20));
});
