# Privacy and analytics boundary

Screening results can contain account-specific activity and are intended for
the current browser session. The frontend is a presentation client, not a
long-term record store.

## Storage and retention

- Keep assessments and event rows in React memory only; do not write them to
  localStorage, sessionStorage, cookies, IndexedDB, URLs, or analytics
  payloads.
- Bound in-memory history and loaded event rows. Clear them when the analyst
  uses the clear control or leaves the session.
- Keep public build configuration separate from secrets. `NEXT_PUBLIC_API_BASE_URL`
  is an origin only and must never contain an API key or signing material.
- Do not add account-specific examples, real hashes, personal data, tokens,
  private keys, or request bodies to fixtures, screenshots, or documentation.

## Telemetry and errors

There is no implicit analytics collection in the dashboard. If an approved
observability integration is added, send only aggregate operational facts:
route, status class, latency bucket, and deployment identifier. Never send
account addresses, transaction hashes, scores, signals, raw responses,
authorization headers, or clipboard contents.

User-facing errors must be short, actionable, and redacted. Use explicit
copy such as `The request timed out. Try again.`, `Activity details are
unavailable from the backend.`, and `Your previous assessment remains
visible.` Do not leak backend stack traces or provider responses.

## State and accessibility checks

Verify loading, empty, degraded, unavailable, retry, and recovery states with
placeholder-only responses. Keep a prior successful result visible after a
failed follow-up request, announce state changes through status/alert regions,
and preserve keyboard focus order. Check the narrow layout and reduced-motion
preference without introducing persistent storage.

Any change to retention, telemetry, API response optionality, or backend CORS
requires a coordinated review. The frontend must remain compatible with older
backend responses while omitting fields it cannot safely interpret.
