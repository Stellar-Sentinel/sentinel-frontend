# Navigation and deep-link operations runbook

This runbook turns the dashboard navigation contract into repeatable checks for
local, preview, and production verification.

## Verification matrix

1. Open each supported section directly and through the navigation: Overview,
   Account screening, and On-chain events.
2. Open an unknown or missing fragment and confirm the page safely falls back
   to Overview without inventing data.
3. Exercise an event deep link with a valid placeholder, a missing value, an
   overlong value, and reserved URL characters.
4. Confirm loading, empty, stale, unavailable, error, retry, and recovery copy
   stays inside the destination section at mobile and desktop widths.
5. Navigate with keyboard only, verify focus visibility, and repeat with
   reduced-motion enabled.

## Deployment safeguards

- Keep account input and pagination intent when navigation changes.
- Treat optional backend fields as absent rather than blocking the page.
- Do not put credentials, private keys, real account data, or production event
  identifiers in URLs, fixtures, screenshots, or diagnostics.
- Confirm no page-level horizontal overflow and that long identifiers wrap or
  remain copyable without overlapping controls.

Record the tested deployment and observed timestamp with each verification; do
not treat a visual state as proof of backend or on-chain health.
