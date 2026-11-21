# Signal explanation card safeguards

Signal cards explain the off-chain observations behind an account score. They
must never present a heuristic as proof of fraud, compliance status, or an
on-chain contract fact.

## Rendering contract

The UI treats `signals` as optional and renders an explicit empty state when
the backend returns no signals. Optional fields use safe fallbacks: missing
severity is `Info`, missing points are `0`, missing explanation uses the
source or `Observed account activity`, and missing values display `—`. Keep
the score, threshold, observed metrics, and signal explanations in separate
visual groups so analysts can compare them without conflating their sources.

Severity filtering and ordering are client-side over the already returned
bounded result. Do not fetch a second copy of the account or retain raw API
responses beyond the current page session. The application keeps only the
small recent-assessment history needed for navigation and never persists it
to local storage.

## Failure and privacy behavior

If a response is unavailable, malformed, or times out, show a clear degraded
state and preserve the last successful assessment when one exists. Error
messages are shortened and redact account identifiers, hashes, tokens, and
private-key markers before they reach the UI. Do not add request bodies,
headers, API keys, signing seeds, or real personal account data to telemetry,
screenshots, fixtures, or logs.

The API client has one in-flight request per dashboard resource and rejects
responses larger than its configured safety bound. A new screening request
must not create duplicate submissions while the previous one is loading.

## Accessibility and responsive checks

- Use the labelled severity and ordering controls with keyboard navigation.
- Keep the result region and errors announced through the existing live/status
  regions without moving focus unexpectedly.
- Verify the signal table at a narrow viewport: it may scroll horizontally,
  but the score, severity, explanation, and empty/degraded copy must remain
  understandable.
- Respect `prefers-reduced-motion`; loading animation and smooth scrolling
  must be reduced for users who request it.
- Check the normal tab order through filter controls, signal content, and the
  assessment-history actions.

Before release, exercise a full result, an empty signal list, a missing
optional field, a timeout, an oversized response, and a failed follow-up
request after a successful assessment. Record the frontend build, backend
response version, and preview environment used for the check.
