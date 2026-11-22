# Network and RPC status operations

This runbook covers the frontend checks for `GET /network/status`. The status
indicator is an observation of backend connectivity, not proof that every
Stellar operation will succeed. Account screening, event review, navigation,
and already-loaded data remain usable when the status check is degraded or
unavailable.

For the response states, user-facing copy, and trust boundaries, see the
[network/RPC status UI contract](network-rpc-status-ui-contract.md).

## API and environment contract

The browser calls the backend origin in `NEXT_PUBLIC_API_BASE_URL`:

```text
GET {NEXT_PUBLIC_API_BASE_URL}/network/status
```

The value is public configuration. It must be an origin only and must never
contain a token, private key, or query-string credential. The backend must
allow the deployed frontend origin through `CORS_ORIGINS`.

The response supplies the network identity, RPC status, latest and oldest
ledger when available, and the backend observation time. `null` ledger values
mean unavailable; they must not be rendered as zero or replaced with sample
data. The frontend must not display or persist the backend's `rpc_url`.

Keep `/network/status` response changes coordinated with the
[sentinel-backend issues](https://github.com/Stellar-Sentinel/sentinel-backend/issues).
Network or contract deployment changes belong in the
[sentinel-contracts issues](https://github.com/Stellar-Sentinel/sentinel-contracts/issues).

## Preview coordination

Before reviewing a Vercel preview:

1. Set `NEXT_PUBLIC_API_BASE_URL` to the intended Render backend origin in the
   preview environment. Use a non-secret public origin.
2. Add the exact preview origin to the backend CORS allowlist for the review
   window. Remove temporary entries when the preview is retired.
3. Load the preview and confirm that the network identity, RPC state, latest
   ledger, and check time are readable without relying on color alone.
4. Use the status retry control. Confirm that it is keyboard reachable,
   prevents overlapping requests, and does not clear screening results or
   loaded events when a retry fails.
5. Exercise degraded and unavailable responses in a non-production backend.
   Confirm the UI says that status is unavailable or degraded without exposing
   an RPC URL, response body, token, or private backend detail.

If Render is cold, retry after the service wakes. A first-request timeout is a
backend availability signal; it is not evidence that the frontend should block
screening.

## Promotion and rollback

Before promoting, compare the preview and production values of
`NEXT_PUBLIC_API_BASE_URL`, verify the backend CORS allowlist, and confirm that
the backend's configured Stellar network, contract ID, Horizon origin, and
Soroban RPC are the intended release configuration.

If the status contract or links regress:

1. Roll back the Vercel frontend to the last known-good deployment.
2. Keep the backend running unless its response or CORS configuration is the
   identified cause; do not roll back both services automatically.
3. Smoke-test account screening, event loading, status retry, and explorer
   links for a known network. Confirm unknown networks and missing ledgers stay
   explicit and do not produce fabricated links or values.
4. Record the frontend commit, API origin, network, contract ID, and observed
   error in the linked backend or contract issue before retrying promotion.

## Release checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` is an origin without credentials.
- [ ] Backend CORS includes the exact preview or production frontend origin.
- [ ] Healthy, stale, degraded, unknown, loading, and unavailable states have
  truthful text and do not rely on color alone.
- [ ] Status refresh does not block screening, events, navigation, or loaded
  results.
- [ ] Missing ledger values remain unavailable rather than becoming zero.
- [ ] No RPC URL, token, private key, real account data, or raw backend report
  appears in the UI, logs, fixtures, or documentation.
- [ ] Related backend and contract changes are linked and reviewed together.

This guide documents frontend operations only. It does not change the backend
health-check thresholds, retry schedule, or API schema.
