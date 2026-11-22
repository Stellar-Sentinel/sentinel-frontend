# Configuration and environment contract

The frontend has one public configuration input: the API base URL. Runtime
configuration is optional and must fail safely so a missing or malformed value
cannot silently point the dashboard at an unintended service.

## Rules

- Read `NEXT_PUBLIC_API_BASE_URL` at runtime/build time through the existing
  configuration boundary and remove only a trailing slash.
- Never place tokens, cookies, private keys, or account data in public
  environment variables or client bundles.
- Treat an empty, malformed, or unreachable base URL as an unavailable API and
  render the existing retry/error state.
- Keep development, preview, and production values separate; do not commit
  environment files containing credentials.
- Redact configuration values in diagnostics. Safe telemetry may include the
  environment name and status class, but not the URL path, query, or response.

## Operational checks

Verify a deployment with a placeholder API base, a missing value, and a known
unavailable service. Confirm that the page remains usable, retry preserves user
input, and no secret appears in source, rendered markup, logs, or diagnostics.
