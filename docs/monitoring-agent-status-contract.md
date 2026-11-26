# Monitoring agent status contract

The monitoring-agent surface reports backend observations, not proof of agent
health or compliance. Every status is paired with its source and observation
time when available.

## State model

| State | User-facing behavior |
| --- | --- |
| Loading | Keep the section context visible and announce that status is being retrieved. |
| Healthy | Show the observed status and timestamp with a source label. |
| Stale | Keep the last observation visible and label its age; offer refresh. |
| Degraded | Explain which capability is unavailable without hiding other known facts. |
| Unavailable | Say that no observation is available; never infer healthy or unhealthy. |
| Error | Show safe error copy tied to the status region and provide retry. |
| Recovery | Replace the temporary state after a successful refresh without fabricated data. |

Response fields are optional for compatibility with older backend deployments.
Missing timestamps, capabilities, and details render as unavailable copy. The
UI must preserve the distinction between an observed status and any heuristic
interpretation.

## Accessibility and operations

Status changes are announced once through a live region, remain readable by
keyboard and screen readers, and retain visible focus. Fixtures and examples
must use placeholders only and contain no tokens, private keys, real accounts,
or production event identifiers.
