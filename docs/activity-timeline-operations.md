# Activity timeline operations

The activity timeline consumes cursor-paginated normalized operations. The
parser treats the cursor as opaque, bounds retained rows, drops malformed
records, and de-duplicates overlapping pages by operation id. Optional fields
such as issuer, amount metadata, timestamps, and transaction hashes remain
optional for older backends.

Loading keeps the timeline region labelled. Empty results show no sample rows;
degraded results preserve known facts and mark missing fields; unavailable
results show redacted retryable copy; recovery replaces the failed page without
duplicates. Unknown network context keeps identifiers as text rather than
guessing an explorer destination.

Use placeholder accounts and transaction ids only in tests. Do not log response
bodies, tokens, private keys, or personal data. Verify keyboard focus and a
narrow viewport before release, and roll back if pagination repeats rows,
exposes raw errors, or loses the distinction between on-chain facts and
backend observations.
