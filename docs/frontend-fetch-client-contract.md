# Frontend fetch client contract

The dashboard fetch client is the boundary between UI state and the backend.
It must keep transport failures separate from valid API responses and must not
leak request data into logs.

## Request and response rules

- Build URLs from the configured API base and never embed credentials in a URL.
- Treat non-2xx responses as typed failures with safe, user-facing detail; do
  not expose response bodies containing secrets.
- Keep optional response fields optional so older deployments render an
  unavailable state instead of failing the entire dashboard.
- Keep aborted requests and network failures distinguishable from valid empty
  responses so the UI can offer retry.

## Safe instrumentation

Instrumentation may record operation name, status class, duration, and retry
count. It must not record URLs with query secrets, request or response bodies,
Stellar account identifiers, tokens, cookies, or private keys. Measurements are
emitted once per completed request and never change the user-visible result.

## UI hand-off

Callers map failures to loading, empty, stale, degraded, unavailable, error,
and recovery states. Retry keeps current input and pagination intent. A
successful retry replaces the affected state without inventing data.
