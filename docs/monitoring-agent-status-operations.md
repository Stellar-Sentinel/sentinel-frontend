# Monitoring-agent status surface

The monitoring agent is optional. The frontend may show its public operational
state, but it must never expose signing keys, secret configuration, private
RPC credentials, transaction payloads, or deployment internals.

## Public response contract

The backend may return a status object from its agent-status endpoint. Every
field beyond `state` is optional so older deployments remain readable:

```json
{
  "state": "healthy",
  "observed_at": "2030-01-02T03:04:05Z",
  "last_event_at": "2030-01-02T03:03:00Z",
  "network": "Testnet",
  "message": "Monitoring is active"
}
```

Allowed public states are:

| State | Meaning | User-facing copy |
| --- | --- | --- |
| `disabled` | The agent is not configured to sign or submit transactions. | `Monitoring agent is disabled.` |
| `healthy` | The backend has a recent successful observation. | `Monitoring agent is healthy.` |
| `degraded` | An observation or submission dependency is delayed. | `Monitoring is delayed. Existing event data remains available.` |
| `unknown` | The backend could not report a recognized state. | `Monitoring status is unavailable.` |

Missing, null, or unknown fields are unavailable, never an inferred healthy
state. Timestamps are backend observations, not browser-clock assertions.
Network names provide display context; they do not prove that a transaction was
submitted.

## Loading, recovery, and failure behavior

- Loading: `Checking monitoring status…`; keep the rest of the dashboard usable.
- Disabled: show the explicit disabled state and do not invent events.
- Degraded: retain loaded event rows and provide `Refresh status`.
- Unavailable: show `Monitoring status is unavailable.` with `Try again`.
- Recovery: announce `Monitoring status updated.` without interrupting an
  active account screen.

Polling must be bounded, deduplicated, and cancellable on unmount. A failed
refresh must not clear the previous status or event feed. Show a freshness hint
only when the backend timestamp parses successfully; otherwise render
`Time unavailable`.

## Security and information boundaries

The public response may include state, safe timestamps, network name, and a
short operator-facing message. It must not include a secret, token, seed,
private key, deployment-only signer address, credential-bearing RPC URL,
environment value, stack trace, or raw transaction envelope.

The status panel is a backend observation, separate from on-chain event facts
and heuristic risk scores. Healthy monitoring does not imply that an account
is safe, compliant, or free of risk; disabled monitoring does not imply the
opposite.

## Preview, deployment, and rollback

For Vercel previews, use the public `NEXT_PUBLIC_API_BASE_URL` contract and
allow the exact preview origin in Render `CORS_ORIGINS`. Never copy a local
secret into a preview environment. Verify all four states with safe fixtures
or a controlled test response.

Before promotion, verify the frontend commit, backend deployment, network
label, and CORS origin together. If the status endpoint is incompatible or
leaks a forbidden field, roll back the frontend to the last known-good Vercel
deployment and record the response in the
[sentinel-backend issue tracker](https://github.com/Stellar-Sentinel/sentinel-backend/issues).
Agent signing and contract behavior belong in the
[sentinel-contracts issue tracker](https://github.com/Stellar-Sentinel/sentinel-contracts/issues).

## Accessibility and responsive behavior

The status panel uses a named heading and a `role="status"` announcement for
loading, recovery, and error transitions. Retry and refresh controls are
keyboard reachable with visible focus. On narrow screens, state, freshness
metadata, and actions stack without horizontal scrolling. Color is never the
only indicator: every state has text and, where useful, an accessible icon
label.
