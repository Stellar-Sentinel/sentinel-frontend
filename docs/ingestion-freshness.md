# Ingestion freshness contract

The event feed is an indexed view of Soroban events. The freshness indicator describes the
backend ingestion observation; it does not change the meaning of an on-chain event and is not a
fraud, compliance, or risk verdict.

## UI contract

`GET /events?limit=20&cursor=...` returns the existing event page plus optional source metadata:

```ts
type EventsSource = {
  rpc_url: string;
  network: string;
  contract_id?: string;
  ingestion_status?: "current" | "stale";
};
```

The field is optional so older backends remain readable. The frontend maps it to four states:

| State | Condition | Copy and action |
| --- | --- | --- |
| Loading | Initial request is in flight | “Checking feed”; do not imply freshness. |
| Current | Response says `current` | “Feed current”; indexed through the latest successful ingestion attempt. |
| Stale | Response says `stale` | “Feed delayed”; keep indexed events visible and offer refresh. |
| Unavailable | Initial request fails, or status is absent after a failed/legacy response | “Feed unavailable”; explain that the source could not be checked and offer retry. |

An empty successful response is a separate content state: “No flag events yet”. It must not be
relabeled as stale or unavailable. A failure while loading an older cursor preserves already loaded
events and offers “Retry loading older events”.

The indicator is announced through a polite live region and is not color-only. On narrow screens it
may wrap beside export and refresh actions. Use the existing local/UTC timestamp toggle for event
times and respect `prefers-reduced-motion`.

## Thresholds and data boundaries

The backend status is authoritative. The frontend must not infer freshness from `created_at`, ledger
numbers, or a client clock. For operational alerting, treat a normally 30-second ingestion interval
as delayed after 90 seconds without a successful sync; the backend should emit `stale` while serving
indexed records during RPC failure. If an observation timestamp is added later, use ISO-8601 UTC and
apply the threshold server-side first.

On-chain facts are event ID, ledger, event topics/subjects, score signal, contract, digest, and
transaction reference. Backend observations are ingestion status, network, RPC source, and
timestamps. Heuristic interpretation is separate. Never send or render raw reports, private keys,
access tokens, or unnecessary account data in the indicator or telemetry.

## Representative mocked payloads

Current feed:

```json
{
  "events": [],
  "next_cursor": null,
  "source": {
    "rpc_url": "https://soroban-testnet.stellar.org",
    "network": "Test SDF Network ; September 2015",
    "contract_id": "CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "ingestion_status": "current"
  }
}
```

Degraded feed (indexed history remains usable):

```json
{
  "events": [{
    "id": "mock-event-1",
    "ledger": 100,
    "created_at": "2026-01-01T12:00:00Z",
    "agent": "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "subject": "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    "score": 82,
    "contract_id": "CCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  }],
  "next_cursor": null,
  "source": {
    "rpc_url": "https://soroban-testnet.stellar.org",
    "network": "Test SDF Network ; September 2015",
    "ingestion_status": "stale"
  }
}
```

Unavailable is represented by the existing HTTP error response; the frontend must not replace it
with fabricated events.

## Safeguards and instrumentation

- Allow only one `/events` request at a time and disable refresh while it is active.
- Retain at most 100 events in the page session; do not persist event data across reloads.
- Keep pagination bounded and preserve loaded events when an older-page request fails.
- Log only coarse state transitions (`loading`, `current`, `stale`, `unavailable`) and request
  outcome/latency. Do not log full account lists, raw responses, URLs with credentials, or tokens.
- Keep the indicator non-blocking, screen-reader announced, responsive, and reduced-motion safe.

## Release and coordination runbook

Local setup uses the public API origin in `NEXT_PUBLIC_API_BASE_URL`; never put a secret in a
`NEXT_PUBLIC_*` value. Preview deployments must point to a preview backend and matching
network/contract, not a production write endpoint. Before release, check current, stale, empty,
unavailable, and retry states at a narrow viewport with keyboard navigation. Confirm rollback still
leaves the event list readable against an older backend that omits `ingestion_status`.

The backend owns ingestion status and RPC retry behavior: [sentinel-backend](https://github.com/Stellar-Sentinel/sentinel-backend).
The contract remains the source of append-only on-chain events: [sentinel-contracts](https://github.com/Stellar-Sentinel/sentinel-contracts).
Coordinate backend response changes and contract redeployments before promoting a frontend preview.
