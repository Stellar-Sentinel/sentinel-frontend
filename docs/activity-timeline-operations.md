# Activity timeline operations

The activity timeline is a read-only view of cursor-paginated operations from
the backend. It displays on-chain facts separately from backend observations
and heuristic interpretation; a missing optional field is not replaced with a
fabricated value.

## Row contract

Each row may show the operation type, observed time, counterparties, asset,
amount, ledger, and a transaction reference. `transaction_hash`, asset
metadata, counterparty labels, and timestamps are optional for compatibility
with older API deployments. Use an em dash or an explicit unavailable label
when a value is absent. Encode transaction identifiers before placing them in
an explorer URL, and keep unknown network context as text.

Cursor pagination is opaque. Send the returned cursor unchanged, stop when it
is absent, and do not infer a cursor from a ledger or timestamp. A retry keeps
the current rows visible until the replacement page succeeds; never append a
page twice after a retry.

## User-facing states

| State | Required behavior |
| --- | --- |
| Loading | Keep the timeline region labelled and expose progress without hiding the current assessment. |
| Empty | Explain that no operations were returned; do not add sample rows. |
| Degraded | Keep available facts visible and label omitted optional fields. |
| Unavailable | Show redacted, actionable error copy and a retry control. |
| Recovery | Replace the failed page after a successful retry without duplicate rows or cursor reuse. |

The timeline heading, row labels, retry control, and status messages must be
keyboard reachable and announced in text. Narrow layouts may scroll the row
details horizontally, but the type, time, and primary action remain usable.

## Preview, coordination, and rollback

Preview deployments use the same public API-origin contract as production.
Verify a mocked first page, an empty page, an older response without optional
fields, a cursor-bearing page, a failed request, and a successful retry. Do
not place account identifiers, transaction hashes, tokens, private keys, or
personal data in fixtures or screenshots.

Coordinate backend activity endpoint changes with the asset-identity and
contract release issues before changing response shapes. If a preview shows
duplicate rows, wrong-network links, or unredacted error content, disable the
timeline link or roll back the frontend deployment while preserving the last
known-good assessment. Never silently fall back to another network or invent
asset metadata.

## Validation

Run the repository's documented frontend tests, lint, and production build.
Also inspect a narrow viewport and keyboard-only flow. Review the complete
diff for credentials, generated files, and unrequested API or contract
changes before release.
