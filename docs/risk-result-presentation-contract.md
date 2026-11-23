# Risk result presentation contract

This contract describes how the dashboard presents a heuristic risk result
without turning a score into a claim of fraud, compliance status, or intent.
On-chain facts, backend observations, and heuristic interpretation remain
visually and verbally distinct.

## Response shape

The scoring response may omit any field marked optional. A missing optional
value is shown as unavailable; it is never replaced with a fabricated value or
zero.

```ts
type RiskResult = {
  address: string;
  score: number;
  threshold?: number;
  threshold_exceeded?: boolean;
  as_of?: string;
  policy_version?: string;
  completeness?: "complete" | "partial" | "unknown";
  source?: { network?: "testnet" | "public" | string; observed_at?: string };
  caveat?: string;
  metrics?: Record<string, number | null>;
  signals?: Array<{
    id?: string;
    label: string;
    severity?: "high" | "medium" | "low" | "info";
    explanation?: string;
    points?: number;
    observed_at?: string;
  }>;
};
```

The address is treated as sensitive account data: display a shortened form in
the result header, keep the full value available only through an explicit copy
action, and never include it in error messages or telemetry.

## State and copy contract

| State | Required presentation |
| --- | --- |
| Loading | `Loading risk assessment` and a non-blocking progress indicator. Keep the search controls usable. |
| Empty | `No risk assessment returned` and an explanation that the backend supplied no result. |
| Success | Show the score band, observation time, policy version when present, and the caveat that the score is heuristic. |
| Stale | Label the observation time and say `This assessment may be out of date.` Never imply that it is current. |
| Partial/degraded | Show `Assessment is based on partial data.` List missing optional evidence without hiding available facts. |
| Error/unavailable | Show `Risk assessment unavailable. Try again.` Preserve the last successful result when one exists and label it as last known. |
| Retry | Use a keyboard-focusable `Retry assessment` action. A failed retry must not clear a prior successful result. |

Recommended score copy is `Heuristic risk score: <value> / 100`; avoid
phrasing such as “fraudulent account”, “safe account”, or “compliant”.

## Accessibility and responsive behavior

- The score uses a text label as well as color and exposes a `meter` with
  `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.
- Loading, error, retry completion, and unavailable states use an appropriate
  `role="status"` or `role="alert"` and do not rely on color alone.
- Keyboard users can reach the retry, copy, and details controls in logical
  order, with visible focus indicators.
- At narrow widths, score, metadata, and signal details stack into one column;
  long account identifiers wrap or are shortened without horizontal page
  scrolling.
- Reduced-motion preferences disable decorative transitions while preserving
  state changes and status announcements.

## Safe mocked example

```json
{
  "address": "<subject-account>",
  "score": 64,
  "threshold": 70,
  "as_of": "2026-01-15T12:34:56Z",
  "policy_version": "<policy-version>",
  "completeness": "partial",
  "source": { "network": "testnet", "observed_at": "2026-01-15T12:34:56Z" },
  "signals": [
    {
      "id": "<signal-id>",
      "label": "Repeated counterparties",
      "severity": "medium",
      "points": 18,
      "explanation": "Observed activity pattern requiring review"
    }
  ]
}
```

Mocks and screenshots must not contain real account addresses, tokens, private
keys, secrets, or personal data.
