# Network and RPC status UI contract

This contract defines how the dashboard communicates chain availability without blocking account screening or event review. The browser receives status only from `GET /network/status`; it does not connect to Horizon or Soroban RPC directly.

## Trust boundaries

| Field or message | Meaning | UI treatment |
| --- | --- | --- |
| `network` | On-chain network identity reported by the backend | Display as identity; never infer a network from an RPC URL |
| `rpc_url` | Backend-selected RPC origin | Use only for diagnostics; do not render the full value or expose credentials/query strings |
| `status` | Backend observation of the RPC health check | Render as a status observation, not proof that the network is usable for every operation |
| `latest_ledger`, `oldest_ledger` | Ledger values observed by the backend | Show only when present; label as “latest” or “oldest” and never invent a value |
| `observed_at` | Time at which the backend made the observation | Render with the dashboard time preference and label it as a check time |
| risk score or signal | Heuristic/off-chain interpretation | Keep separate from network/RPC status; never use it to imply chain health or compliance |

### Response shape

The backend response is the source of truth for the following TypeScript shape. `null` means the backend knows the field is unavailable; it is not the same as zero.

```ts
type NetworkStatus = {
  network: string;
  rpc_url: string;
  status: string;
  latest_ledger: number | null;
  oldest_ledger: number | null;
  observed_at: string;
};
```

`network`, `status`, and `observed_at` are required strings. `rpc_url` is required for backend diagnostics but is privacy-sensitive: the frontend must not display it, persist it, include it in analytics, or copy it into an error message. Ledger fields are optional in meaning and represented as nullable numbers. The frontend must tolerate additional response fields and unknown status values.

## State contract

The status indicator is informational and must never disable account screening, event filtering, navigation, or already-loaded results. A status refresh may run independently of the event request.

| State | Trigger | Badge/copy | Detail and action |
| --- | --- | --- | --- |
| Loading | Initial request or refresh in flight | Pending dot; “Checking Stellar RPC…” | Keep prior content visible during refresh when available. Disable only the status refresh control while its request is active. |
| Empty/unknown | No usable response yet, or required identity/status is absent | “Stellar network · RPC unknown” | Show “Waiting for latest ledger”. Do not show a fabricated network or ledger. |
| Success | Response has a recognized healthy status | Green dot; “`<Network>` · RPC healthy” | Show latest ledger when non-null and “Checked `<time>`”. |
| Stale | A previous response exists but its check is older than the freshness window | Amber/pending dot; “`<Network>` · RPC status may be stale” | Keep the last observed ledger and check time. Explain “Last check was `<time>`” and offer “Refresh status”. Stale data is not an error. |
| Degraded | Response is valid but status is not healthy (including unknown future values) | Amber dot; “`<Network>` · RPC `<status>`” | Keep screening usable. If no ledger is returned, say “Latest ledger unavailable”. Do not translate unknown values into “healthy” or “offline”. |
| Error/unavailable | Request fails, times out, or response cannot be parsed | Red dot; “RPC status unavailable” | Say “We couldn’t check RPC health.” Never include `rpc_url`, response bodies, tokens, or private backend details. Keep prior observed status/ledger visible only if clearly marked as last known. |

The status control is keyboard reachable, has a visible focus state, and exposes the same state in text—not color alone. Retry is an explicit, idempotent `GET /network/status`; use the existing request guard so repeated clicks cannot create overlapping checks. A failed retry preserves the last successful network observation and exposes the error through an `alert` or live region.

## Safe mocked payloads

These examples are contract fixtures only. They contain no real account, token, or private-key data.

```json
{
  "network": "Testnet",
  "rpc_url": "https://rpc.example.invalid/soroban",
  "status": "healthy",
  "latest_ledger": 123456,
  "oldest_ledger": 123400,
  "observed_at": "2026-01-15T12:00:00Z"
}
```

```json
{
  "network": "Testnet",
  "rpc_url": "https://rpc.example.invalid/soroban",
  "status": "degraded",
  "latest_ledger": null,
  "oldest_ledger": null,
  "observed_at": "2026-01-15T12:00:00Z"
}
```

For a transport error, no response payload is required. The UI copy is “RPC status unavailable” and “We couldn’t check RPC health. Try again.” A missing ledger is not “ledger 0”; it is “Latest ledger unavailable”.

## Responsive and accessibility requirements

- Desktop may show network, RPC status, latest ledger, and check time in the header; the sidebar may repeat a compact version.
- Narrow layouts may hide the ledger and check time, but must retain network identity, status, and a reachable refresh action.
- Use a text label plus a status dot; do not rely on green/amber/red alone.
- Status changes are announced in a polite live region without stealing focus. Errors use an alert when they require attention.
- Retry buttons have an accessible name that includes the target (“Retry RPC status check”), a visible focus ring, and remain usable at keyboard and touch sizes.
- A status check never blocks account screening, loaded event rows, CSV export, or navigation.

## Examples of user-facing copy

- Degraded: “Testnet · RPC degraded” / “The network is reachable, but some RPC requests may be delayed. Screening remains available.”
- Unavailable: “RPC status unavailable” / “We couldn’t check RPC health. Try again.”
- Stale: “Testnet · RPC status may be stale” / “Last checked 4 minutes ago. Refresh status.”
- Unknown network: “Stellar network · RPC unknown” / “Network identity is not available yet.”

This contract intentionally does not define backend retry intervals, health-check thresholds, or a new schema. Those remain backend concerns and must be coordinated through `/network/status` before changing the response shape.
