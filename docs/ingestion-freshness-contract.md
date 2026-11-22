# Ingestion freshness UI contract

Status: proposed for issue #118

The event feed reports whether the backend's index is current. This is a
backend observation, not an on-chain fact and not a client-side time heuristic.
The frontend must preserve the distinction between indexed events, backend
observations, and any later heuristic interpretation.

## Response and states

`GET /events` may include the following optional field:

```json
{
  "source": {
    "network": "Test SDF Network ; September 2015",
    "rpc_url": "https://rpc.example.test",
    "ingestion_status": "current"
  }
}
```

The accepted values and user-facing contract are:

| Backend value | Chip | Explanation and action |
| --- | --- | --- |
| `current` | **Feed current** | The backend reports a successful ingestion check. Show the check time. |
| `stale` | **Feed delayed** | Say that on-chain flags may not be indexed yet, keep existing rows visible, and offer **Retry feed sync**. |
| missing, malformed, or unknown | **Freshness unknown** | Say that the backend did not report freshness. Do not present the feed as current and do not invent a delay threshold. |

Loading, empty, success, stale, degraded, unavailable, and recovery behavior
remain independent: loading may keep existing rows visible; an empty response
says no events were returned; an error preserves loaded rows when possible and
offers retry; recovery replaces the status with the newest valid observation.

The checked time is formatted with the dashboard's Local/UTC preference. A
relative suffix may be added after one minute, but it never changes the
backend status. Retry is bounded by the existing in-flight request guard and
must not create duplicate rows when a page is loaded again.

## Privacy and accessibility

The chip uses a status role or live-region update for transitions, has visible
text in addition to color, and keeps retry keyboard reachable with a visible
focus indicator. Do not render the RPC URL, response body, tokens, private
keys, or account-sensitive data in status copy, logs, fixtures, or examples.

The regression cases in `test/ingestion-freshness.test.ts` lock the parser
boundary: current and stale are preserved, omitted and future values remain
unknown, and malformed optional metadata cannot discard a valid event.
