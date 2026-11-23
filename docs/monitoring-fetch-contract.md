# Monitoring and fetch-client contract

The monitoring status surface and its fetch boundary share the same explicit
operational states. This contract keeps backend observations separate from
heuristic interpretation and remains compatible with older responses.

## Monitoring states

| State | UI behavior |
| --- | --- |
| Loading | Keep the surface context visible and announce progress without moving controls. |
| Healthy | Show the observed status and timestamp with its source. |
| Stale/degraded | Keep last-known data, label its age, and expose retry. |
| Empty/unavailable | Explain that no status is available; do not infer a healthy service. |
| Error | Associate safe error copy with the region and preserve navigation/input. |
| Recovery | Replace the temporary state after a successful retry. |

## Fetch boundary

- Use the configured API base only; never place credentials in public config or
  URLs.
- Treat non-2xx, abort, and network failures as typed transport failures while
  keeping valid empty responses distinct.
- Optional fields are omitted or rendered as unavailable rather than throwing.
- Safe instrumentation may record operation, status class, duration, and retry
  count, but never bodies, query secrets, account identifiers, cookies, tokens,
  or private keys.

The regression checklist should use deterministic mocked responses for every
state and must not contact live monitoring or Stellar services.
