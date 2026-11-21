# Account screening form UI contract

This document defines the account-screening interaction for the Stellar
Sentinel dashboard. It describes client behavior only; the backend remains the
source of truth for scoring and observation data.

## Interaction states

The form has one text field and one submit action. The field is trimmed before
validation and submission. A value must match the Stellar public-account shape
(`G` followed by 55 uppercase base32 characters). Validation is synchronous on
submit and does not call the API when the value is empty or malformed.

| State | Form behavior | Result and copy |
| --- | --- | --- |
| Empty | Submit is disabled; field remains editable. | Placeholder: “Paste a Stellar account address (G…)”. |
| Invalid | Submit remains available for a non-empty value; focus stays in the field. | “Enter a 56-character G-prefixed Stellar public account address.” Use `aria-invalid=true`. |
| Loading | Submit is disabled and shows a spinner plus “Analyzing”. | Keep the previous successful assessment visible. Abort after the client timeout and offer retry. |
| Success | Field remains editable for the next screening. | Show score, threshold state, observed metrics, signal explanations, source network, and observation time. |
| Stale success | A later request is loading or failed. | Keep the last successful result visible and identify it as the previous assessment; never replace it with sample data. |
| Error | Form remains editable and retryable. | “Could not analyze account” followed by a short sanitized reason and backend availability guidance. |
| Empty result | Request succeeds with no notable signals. | Show “No notable signals were returned for this assessment.” A zero-signal result is still a successful response. |
| Cancel/clear | User clears the current result or chooses a recent screen. | Clear removes the active result without changing server state. Selecting history restores only the in-session response. |

Duplicate submissions are prevented while a request is loading. A request is
not persisted across reloads, and the page keeps at most five successful
assessments in memory for the current session. A failed request never removes
the previous successful result.

## Response contract

The frontend accepts the following shape from `POST /risk/score`:

```json
{
  "address": "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "score": 42,
  "risk_level": "low",
  "threshold": 70,
  "threshold_exceeded": false,
  "signals": [],
  "metrics": {
    "operations_scanned": 120,
    "operations_in_window": 12,
    "transfers_in_window": 4,
    "transfer_volume_xlm": 25.5,
    "distinct_counterparties": 3,
    "account_sequence": 18,
    "native_xlm_balance": 100.25,
    "window_days": 30
  },
  "source": { "horizon_url": "https://horizon.example.invalid", "network": "Testnet" },
  "as_of": "2026-01-01T00:00:00Z"
}
```

Signal fields may be optional and unknown additional response fields must be
ignored. `signals` is an array; an absent optional explanation or source is
rendered as a neutral fallback, never inferred as proof of risk. Account IDs,
tokens, private keys, and real personal data must not appear in fixtures,
documentation, logs, or rendered fallback content.

The score is a transparent off-chain signal. “Review threshold exceeded” is a
workflow cue, not a compliance, fraud, or ownership determination. The UI must
keep on-chain facts, backend observations, and heuristic interpretation
visually and textually distinct.

## Accessibility and responsive behavior

- The input has the accessible name “Stellar account address” and exposes
  invalid state with `aria-invalid`; validation errors use `role=alert`.
- The loading and result regions use status/live announcements sparingly so a
  screen reader hears state changes without the full result being repeated.
- Keyboard users can focus the input, submit with Enter, reach recent-result
  controls, and clear or retry without pointer-only interactions.
- Focus-visible outlines remain visible against the green dashboard theme.
- At narrow widths, the input and submit controls stack vertically, retain a
  minimum comfortable target height, and do not require horizontal scrolling.
- Long account identifiers and backend messages are clipped or wrapped without
  exposing secrets; the full account is available only through the explicit
  copy action.

## Representative degraded-state copy

- Backend unavailable: “Could not analyze account. The screening service is
  unavailable. Try again.”
- Timed out: “The request timed out. Try again.”
- Older result retained: “The last successful assessment remains visible
  below.”
- No notable signals: “No notable signals were returned for this
  assessment.”

These messages should remain explicit and should not imply that missing data is
safe, risky, verified, or equivalent to a zero score.
