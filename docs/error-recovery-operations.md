# Error and recovery operations

The dashboard treats backend wake-up delays, RPC outages, malformed optional
fields, and network timeouts as expected operational states. Recovery copy
must be actionable without overstating what the data proves.

## State contract

| State | Copy | Required behavior |
| --- | --- | --- |
| Loading | `Checking Stellar RPC…` / `Loading contract events…` | Disable only the control being refreshed; keep prior data visible. |
| Empty | `No contract events are available.` | Do not insert fixtures or sample production content. |
| Degraded | `Some activity data was unavailable; interpret this score with caution.` | Preserve successful fields and mark missing data explicitly. |
| Unavailable | `Event history is unavailable from the backend.` | Offer retry and keep previous rows/results when present. |
| Recovery | `API connected` or the recovered result | Replace only the failed resource after a successful retry. |

Inline errors belong beside the affected panel; global connection status is
reserved for API/RPC availability. Retry requests are bounded, do not run
concurrently for the same resource, and must reuse the current opaque cursor.
An older-page failure must never discard already loaded pages.

## Configuration and deployment

Local development requires Node.js 24 and a separately running backend. Set
`NEXT_PUBLIC_API_BASE_URL` to a public API origin in `.env.local`; it is
exposed to the browser and must never contain a secret. The backend must allow
the local, Vercel preview, and production origins through `CORS_ORIGINS`.

Preview deployments should use an explicitly approved Testnet backend. Before
promotion, check a healthy API, unhealthy API, RPC timeout, empty event page,
malformed optional response, failed retry, and successful recovery. Record the
frontend deployment, backend version, API origin, and contract/network in the
release note without recording account data or credentials.

If a deployment regresses, roll the frontend back to the last verified Vercel
deployment and re-check environment variables, CORS, keyboard navigation, and
a narrow viewport. Do not change backend or contract schemas as an emergency
frontend workaround; coordinate a backwards-compatible response change.

## Safe examples

Use placeholders such as `{ "events": [], "next_cursor": null }` for empty
responses and `{ "detail": "temporarily unavailable" }` for failures. Never
use real account IDs, transaction hashes, API keys, signing seeds, private
keys, or personal data in docs, tests, logs, or screenshots.
