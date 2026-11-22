# Vercel deployment observability contract

The frontend runs on Vercel and calls a separately deployed Render API. The
dashboard should make deployment and API-origin failures diagnosable without
exposing account data or credentials.

## Runtime states

| State | Copy | Behavior |
| --- | --- | --- |
| Loading | `Connecting to API` / `Checking Stellar RPC…` | Show status without blocking already loaded results. |
| Success | `API connected` | Keep the observed network and ledger metadata separate from scores. |
| Stale | `Showing indexed events; the provider is temporarily stale.` | Keep rows and show freshness metadata. |
| Error | `API unavailable` or `RPC status unavailable · Retry` | Offer a labelled retry and preserve prior data. |
| Recovery | `API connected` | Replace only the failed resource after a successful check. |

`NEXT_PUBLIC_API_BASE_URL` is build-time public configuration. It must be a
public API origin, never a secret, and Vercel preview environments must be
configured explicitly rather than inheriting an unintended production origin.
Render CORS must allow the exact preview and production origins.

## Safe diagnostics

Use deployment metadata such as build ID, commit SHA, environment name, API
origin host, HTTP status class, latency bucket, and observed network. Do not
record request bodies, authorization headers, account identifiers,
transaction hashes, scores, signals, response payloads, signing seeds, or
private keys. User-facing errors should be redacted and limited in length.

Use placeholder-only fixtures, for example:

```json
{ "status": "healthy", "latest_ledger": null }
```

and

```json
{ "detail": "temporarily unavailable" }
```

These examples are not production data and must not be rendered as fallback
dashboard content.

## Release and rollback checks

Before promotion, verify a preview build can load the API, handle a timeout,
show an empty event feed, retry a failed request, and recover without losing a
successful result. Check keyboard focus on retry controls and a narrow
viewport. Record the Vercel deployment, Render release, API origin, and
contract/network in release notes without account data.

If diagnostics or configuration regress, roll back to the last verified Vercel
deployment, re-check environment variables and CORS, and keep backend and
contract response schemas backwards compatible.
