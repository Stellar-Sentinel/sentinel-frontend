# Soroban event feed operations

This guide defines the frontend contract for the paginated `GET /events`
feed. It is intentionally compatible with the existing backend response and
does not change the backend or contract schema.

## Ordering and pagination

The backend is the authority for ordering. The frontend renders each page in
the order returned and requests older data with the opaque `next_cursor`; it
must not sort by account, score, or client clock. The initial request is:

```text
GET /events?limit=20
```

An older page uses:

```text
GET /events?limit=20&cursor=<opaque-cursor>
```

The cursor is treated as an opaque string and is never decoded, persisted as
an account identifier, or constructed by the browser. When pages overlap, the
frontend de-duplicates by the stable event `id` while preserving the first
server-provided position. The dashboard keeps a bounded in-memory window;
loading older events must not discard the newest visible page unexpectedly.

## Legacy and v2 event rendering

The renderer accepts both the legacy event shape and the current shape. These
fields remain stable for display: `id`, `ledger`, `created_at`, `agent`,
`subject`, `score`, and `contract_id`. Current responses may additionally
provide `transaction_hash`, `tx_hash`, `report_digest`, or a network/source
object. `transaction_hash` is preferred; `tx_hash` is the compatibility
fallback. Missing optional fields render as an explicit em dash or unavailable
state, never a fabricated value.

Unknown fields are ignored so a backend can add v2 metadata without breaking
the existing UI. A malformed page is treated as an API error and can be
retried; it is not silently coerced into an empty feed.

## Freshness and loading states

The feed is refreshed when the dashboard loads. While a request is in flight,
keep already loaded events visible and disable only the action that would
start a duplicate request. Loading older pages appends after success. A failed
append keeps the existing rows and exposes `Retry loading older events`; a
failed initial request exposes `Event feed unavailable` and `Try again`.

The page does not infer freshness from the browser clock. If the backend later
adds `observed_at` or a source timestamp, label it as backend metadata and
display it alongside the event rather than rewriting the event's on-chain
ledger ordering. A cold Render service may delay the first request; a timeout
is a degraded state, not an empty result.

## Empty and unavailable states

- No events: `No flag events yet`. Do not add sample rows.
- No older page: hide the load-more control.
- API unavailable: `Event feed unavailable` and `Try again`; retain rows
  already loaded from a successful request.
- Unknown network: show identifiers as text and disable explorer links until
  `/network/status` provides a known network.
- Optional evidence unavailable: keep on-chain event facts visible and say
  `Optional backend evidence is unavailable.`

Scores and signal labels are heuristic review cues. They are not proof of
fraud, compliance status, ownership, or intent. On-chain facts, backend
observations, and heuristic interpretation stay in separate visual groups.

## Preview, deployment, and rollback coordination

The frontend reads the public `NEXT_PUBLIC_API_BASE_URL`; it must contain only
the backend origin. For a Vercel preview, point that variable at the intended
Render backend and temporarily allow the exact preview origin in the backend's
`CORS_ORIGINS`. Remove the temporary origin after review.

Before promotion, verify the preview and production API origins, request the
first feed page, append one older page, and exercise retry, empty, unknown
network, and optional-evidence states. Keep the related coordination work in
the [sentinel-backend issue tracker](https://github.com/Stellar-Sentinel/sentinel-backend/issues)
and [sentinel-contracts issue tracker](https://github.com/Stellar-Sentinel/sentinel-contracts/issues).

If a deployment returns an incompatible feed, roll back the Vercel frontend to
the last known-good deployment first. Roll back Render only when logs show the
backend response or CORS configuration is the cause. Record the frontend
commit, backend URL, contract ID, network, and failing request in the linked
issue before retrying.
