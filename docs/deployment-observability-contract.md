# Deployment observability contract

This document defines the signals contributors and operators may use to
diagnose a production frontend failure. The frontend is deployed on Vercel and
calls a separately deployed Render API; a deployment signal is an observation,
not proof about the Stellar chain or an account.

## Configuration and provenance

`NEXT_PUBLIC_API_BASE_URL` is build-time, browser-visible configuration. It
must contain only a public API origin. Secrets, signing material, bearer
tokens, and private keys do not belong in the frontend environment or a
diagnostic event. Vercel preview, production, and local environments must be
configured explicitly, and the Render CORS allow-list must contain the exact
origins that are expected to call the API.

For each release, record the Vercel deployment URL, frontend commit SHA,
environment (`preview` or `production`), Render release identifier, API-origin
host, selected Stellar network, and the time of the check. Keep this release
record separate from account screening results.

## User-visible states

| State | Accessible copy | Contract |
| --- | --- | --- |
| Loading | `Connecting to the API` | Announce progress without hiding already loaded results. |
| Empty | `No events are available yet.` | Explain that an empty response is valid; do not invent rows. |
| Degraded | `Some data may be out of date.` | Preserve usable data and expose freshness when known. |
| Unavailable | `The API is unavailable. Retry.` | Provide a labelled, keyboard-focusable retry action. |
| Recovery | `Connection restored.` | Replace only the failed resource after a successful retry. |

Network, backend, and heuristic signals must remain distinct. A timeout or a
stale API response is not an on-chain fact, and a screening score is not proof
of fraud or compliance status.

## Safe diagnostics

Diagnostics may include a deployment ID or commit SHA, environment name, API
origin hostname, HTTP status class, latency bucket, selected network, and a
coarse failure category. They must not include request or response bodies,
authorization headers, account identifiers, transaction hashes, scores,
signals, cookies, local-storage contents, or private keys. User-facing errors
must be redacted and bounded in length.

Use placeholder-only examples when testing documentation or a mock:

```json
{ "status": "healthy", "latest_ledger": null }
```

```json
{ "detail": "temporarily unavailable" }
```

These examples must never be rendered as fallback production data. Response
fields remain optional so an older backend deployment can still be diagnosed
without requiring a coordinated schema change.

## Preview, release, and rollback

Before promotion, check a preview against the intended API origin and verify
loading, empty, degraded, unavailable, retry, recovery, narrow-viewport, and
keyboard-only behavior. Confirm that a failed request does not erase a
previously successful result. After promotion, record the same provenance
fields and verify the public health path without exposing account data.

If the frontend or API-origin contract regresses, roll back to the last
verified Vercel deployment, re-check environment variables and CORS, and
re-test the recovery path. Do not change backend or contract schemas as part
of a frontend-only rollback.
