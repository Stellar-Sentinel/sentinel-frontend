# Soroban event-feed contract

The event feed is an indexed view of on-chain facts. It must distinguish the
event itself from backend freshness and evidence status, and must never present
an indexed event or heuristic score as proof of fraud or compliance status.

## Data contract

Both legacy `flagged` and digest-bearing `flaggedv2` events use the same
normalized fields. Optional references can be null or absent:

```json
{
  "id": "evt-example",
  "ledger": 12345,
  "created_at": "2026-01-15T12:34:56Z",
  "agent": "G...agent",
  "subject": "G...subject",
  "score": 70,
  "contract_id": "C...contract",
  "transaction_hash": null,
  "report_digest": "sha256/example"
}
```

The values above are placeholders and must not be copied into production as
sample events. Unknown fields are ignored. Malformed optional hashes or
digests are omitted from links rather than displayed as verified data.

| State | User-facing copy | Behavior |
| --- | --- | --- |
| Loading | `Loading contract events…` | Keep existing rows while refreshing. |
| Empty | `No contract events are available.` | Do not insert fabricated rows. |
| Success | `Showing <count> events` | Newest-first; preserve the opaque next cursor. |
| Stale | `Showing indexed events; the provider is temporarily stale.` | Keep rows and expose freshness metadata. |
| Unavailable | `Event history is unavailable from the backend.` | Keep prior rows if present. |
| Retry | `Retry loading events` | Retry the failed cursor only; do not start a request storm. |

Pagination appends a page by cursor and deduplicates by stable event ID. A
failed older-page request must not discard earlier pages. Transaction, contract,
agent, and subject fields retain their labels when unavailable. Digest-bearing
events may show an evidence lookup placeholder, but the UI must not claim
verification until the backend returns a verification state.

## Accessibility and coordination

Refresh, retry, load-more, export, and event-detail controls are keyboard
reachable and have labels that describe their action. Loading, stale, empty,
and retry feedback uses a status or alert region without moving focus
unexpectedly. Dense event columns may scroll at narrow widths while the state
copy and action controls remain usable.

Coordinate cursor, freshness, event-name, and digest changes with the backend
and contract repositories. Keep optional fields tolerant of older backend
deployments. Test legacy and v2 payloads, empty history, malformed optional
fields, pagination success/failure, and retry with placeholders only.
