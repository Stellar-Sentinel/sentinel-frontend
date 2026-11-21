# Activity timeline UI contract

The activity timeline presents normalized operations returned by the backend.
It is an on-chain activity view, not a risk decision and not a replacement for
the aggregate score or signal explanations.

## Response shape

The endpoint is cursor-paginated and may omit optional values. A compatible
page has this shape:

```json
{
  "items": [{
    "id": "op-demo-001",
    "occurred_at": "2026-01-15T12:34:56Z",
    "type": "payment",
    "counterparty": "G...demo",
    "asset": "native",
    "amount": "12.50",
    "transaction_hash": "tx-demo-001"
  }],
  "next_cursor": "cursor-demo-001"
}
```

The example uses placeholders only. Never add a real account, transaction,
API key, signing seed, or personal data to fixtures or documentation.

| Field | Type | Required | Rendering rule |
| --- | --- | --- | --- |
| `id` | string | yes | Stable row key; do not expose it as a secret. |
| `occurred_at` | ISO timestamp | yes | Show a localized date and retain UTC in detail text. |
| `type` | string | yes | Show the backend-normalized operation type. |
| `counterparty` | string | no | Show an explicit unavailable state when absent. |
| `asset` | string | no | Display the asset code or `Unknown asset`; do not infer it. |
| `amount` | string | no | Preserve decimal text; never parse money through binary floats. |
| `transaction_hash` | string | no | Link to the matching explorer network only when present. |

Unknown fields must be ignored so additive backend fields remain compatible.
Unknown operation types and malformed optional values get a neutral label and
remain inspectable rather than being silently dropped.

## States and copy

- **Loading:** `Loading account activity…` with a non-blocking skeleton.
- **Empty:** `No account activity was returned for this window.`
- **Success:** show rows, the loaded count, and `Load more` only when a cursor
  is available.
- **Stale:** retain the previous rows while a new cursor is loading and label
  them `Showing previously loaded activity while refreshing.`
- **Error:** `Could not load account activity.` Keep loaded rows visible and
  offer `Retry`; do not replace them with sample data.
- **Unavailable:** `Activity details are unavailable from the backend.` Make
  the distinction from an empty account explicit.

Each retry must use the current cursor and must not duplicate existing rows.
Bound the number of retained rows, prevent concurrent page requests, and do
not log raw account identifiers or response bodies.

## Accessibility and responsive behavior

Use a labelled table or equivalent list with a keyboard-reachable retry and
load-more control. Announce loading, errors, and newly appended rows through a
status region without stealing focus. At narrow widths, allow horizontal
scrolling for dense columns while keeping operation type, time, state copy,
and retry controls usable. Links must identify their destination and open the
correct network explorer only when the backend supplies a known network.

Before release, verify loading, empty, success, stale, error, and unavailable
states with the backend response contract, plus keyboard navigation and a
narrow viewport. Coordinate any field or cursor change with the backend issue
and retain backwards compatibility during rollout.
