# Configuration and environment contract

The frontend has one public configuration input: `NEXT_PUBLIC_API_BASE_URL`.
It is read at build time, and the resolved origin is exposed to the browser.
Missing configuration uses the safe local default; malformed configuration is
marked unavailable and prevents requests rather than silently falling back to
a different service.

## Rules

- Accept only an HTTPS origin outside local development. Local HTTP is allowed
  for `localhost`, `127.0.0.1`, and `::1`.
- Reject credentials, paths, query strings, fragments, and malformed URLs.
- Normalize an accepted origin before joining API paths; do not concatenate an
  arbitrary configured path.
- Never place tokens, cookies, private keys, or account data in public
  environment variables or client bundles.
- Treat a missing value as local development and malformed or unreachable
  values as an unavailable API. The UI reports an invalid configuration
  without echoing the configured value.
- Keep development, preview, and production values separate; do not commit
  environment files containing credentials.
- The root dashboard exposes only `data-api-config-status` and
  `data-api-config-source` for smoke tests/telemetry. These are `valid` or
  `invalid`, and `default`, `explicit`, or `invalid`; the URL is never exposed
  by the instrumentation.

## Operational checks

Verify a deployment with a placeholder HTTPS origin, a missing value, an
invalid origin, and a known unavailable service. Confirm that the page remains
usable, retry preserves user input, the root status attributes contain no URL,
and no secret appears in source, rendered markup, logs, or diagnostics.
