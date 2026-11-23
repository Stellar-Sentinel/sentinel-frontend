# Frontend test foundation safeguards

The repository uses Node's built-in test runner with TypeScript stripping for
deterministic, dependency-light tests:

```bash
npm test
```

Tests should exercise pure normalizers and bounded response handling without
starting a Next.js server or contacting a real API. Mock backend payloads must
use placeholders, never real account identifiers, transaction hashes, API
keys, signing seeds, or personal data.

## Required cases

For each API-driven view, cover success, malformed optional fields, empty
results, loading, degraded/unavailable responses, retry, and recovery. For
cursor-paginated data, assert that the cursor is opaque, duplicate rows are
deduplicated, and retained rows are bounded. For form flows, assert invalid
input rejection, one in-flight request, timeout copy, keyboard-submit
behavior, and preservation of the last successful result after a failed
follow-up request.

Tests must not assert fabricated risk conclusions. Assert that the UI keeps
on-chain facts, backend observations, and heuristic signals separate and
uses explicit caveat copy when data is incomplete.

## Privacy and accessibility checks

Keep fetch mocks local to each test and restore them in teardown. Never print
mock request bodies or authorization headers on failure. Error-message tests
should verify redaction of account identifiers, hashes, tokens, and private
key markers. Include keyboard-focus and narrow-viewport checks for any new
interactive component, and verify that reduced-motion preferences do not
remove required status or error feedback.

Before merging, run `npm test`, `npm run lint`, and `npm run build` in an
environment with the documented Node version. If a check cannot run locally,
record that limitation in the PR rather than weakening the assertion.
