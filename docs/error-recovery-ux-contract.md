# Error and recovery UX contract

This contract defines how the dashboard turns backend, RPC, and optional-data
failures into actionable UI states. It applies to account screening, network
status, event history, and event evidence. It does not change an API or
contract schema.

## Trust boundaries

- On-chain facts (ledger, event, account, and transaction fields) are rendered
  as facts only when the backend supplies them.
- Backend observations (availability, status, timestamps, and error details)
  are labeled as observations; they do not prove that the chain or an account
  is safe.
- Heuristic interpretation (risk score, risk level, and signals) stays
  separate from chain facts and backend health. Missing optional fields must
  not be filled with sample or inferred values.
- Response fields are optional for compatibility with older deployments. The
  UI must tolerate missing, `null`, or unknown fields and retain known fields
  that are still valid.

## State and interaction contract

| State | User-facing copy | Required behavior |
| --- | --- | --- |
| Loading | “Loading account assessment…” / “Loading event history…” | Keep prior content visible during refresh. Disable only the affected action and expose progress text. |
| Empty | “No contract events are available yet.” / “No evidence is available for this event.” | Explain that there is no result, not that the request failed. Never add fixtures or sample production data. |
| Success | “Assessment ready.” / “Event history loaded.” | Render supplied facts and observations with their source/context. Keep heuristic output labeled as interpretation. |
| Stale | “Showing the last successful result.” | Keep the last successful result visible, identify its observation time when available, and offer a targeted retry. Stale data is not presented as current. |
| Degraded | “Some data is unavailable; interpret this result with caution.” | Render valid fields, mark missing optional fields explicitly, and keep unrelated panels and navigation usable. |
| Unavailable/error | “We couldn’t load event history. Try again.” | Place the error beside the affected panel, offer retry, and preserve prior results. Do not expose URLs, response bodies, tokens, or private backend details. |
| Recovery | “Event history updated.” / “Assessment updated.” | Announce recovery politely, replace only the failed resource after success, and return focus to the initiating control when practical. |

Inline errors belong beside the affected panel. A global banner is reserved for
an API or network condition that affects multiple panels, and must still name
what remains usable. A failed account assessment never clears the previous
successful assessment; a failed older event page never clears already-loaded
events. Retry uses the same opaque cursor or request input, is idempotent where
the endpoint permits it, and cannot create overlapping requests for one
resource.

### Resource-specific behavior

- Account screening: validate the public address before requesting. On a
  failed request, keep the last successful assessment and show the new error
  above it. A successful retry replaces the assessment and records its new
  observation time.
- Event history: the initial failure shows an empty unavailable state. A
  pagination failure keeps loaded rows and retries the failed cursor only.
  An empty successful page is distinct from an unavailable feed.
- Network/RPC status: a failed refresh keeps the last observation, labeled as
  last known, and offers “Retry RPC status check”. Unknown status values remain
  unknown/degraded; they are never translated to healthy.
- Optional evidence: a missing or `404` evidence record is an explicit empty
  state (“No backend evidence is available for this digest.”), not an error in
  the on-chain event. Other failures are scoped to the evidence panel.

## Accessibility and responsive requirements

- Every state is conveyed in text, not color alone. Status changes use a
  polite `aria-live` region; actionable failures use `role="alert"` without
  stealing focus.
- Retry controls are keyboard reachable, have a visible focus indicator, and
  name their target (for example, “Retry event history” and “Retry RPC status
  check”). Loading disables the initiating control without trapping focus.
- Keyboard users can reach the error, its explanation, and retry in a logical
  order. A narrow viewport keeps the state label and retry action visible;
  secondary timestamps or diagnostics may wrap or collapse.
- Error copy is safe to display. Never include `rpc_url`, authorization data,
  private keys, full response bodies, or account data that was not already
  intentionally shown in the relevant panel.

## Safe mocked examples

These are contract fixtures only and contain no real account, token, key, or
personal data.

Successful event response with optional fields omitted:

```json
{
  "events": [],
  "next_cursor": null
}
```

Degraded assessment response with an optional signal field absent:

```json
{
  "address": "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
  "score": 42,
  "risk_level": "low",
  "signals": [],
  "as_of": "2026-01-15T12:00:00Z"
}
```

Transport failure (the body is not rendered):

```text
GET /events → 503 Service Unavailable
UI: “We couldn’t load event history. Try again.”
```

Successful recovery announces “Event history updated.” and renders the new
response. It does not claim that the backend outage is resolved globally.
