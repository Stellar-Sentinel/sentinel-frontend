# Risk result presentation safeguards

Risk results are transparent, off-chain signals for analyst review. The UI
must not describe a score as proof of fraud, compliance status, or an on-chain
fact.

## Presentation contract

Show the numeric score with its configured review threshold, the observation
time, the data source/network, and the signal explanations as separate pieces
of information. Use the existing bands consistently: low, medium, and high
are presentation labels, while `threshold_exceeded` is the explicit policy
comparison. Do not invent a band, threshold, policy version, metric, or sample
result when an older backend omits it; show `Unavailable` or `Not provided`.

When the backend supplies a policy version or data-completeness indicator,
display it as metadata beside the observation time. Treat unknown versions as
unknown rather than silently applying a current policy. Preserve a successful
result while a later request is loading or fails, and label the result's
observation time so stale data is not mistaken for a new assessment.

Recommended copy:

- Complete: `Signals from Stellar Horizon · observed <time>`.
- Partial: `Some activity data was unavailable; interpret this score with
  caution.`
- Unavailable: `No assessment is available. Check the backend and try again.`
- Caveat: `This score is an off-chain signal for review, not proof of fraud or
  compliance status.`

## Safeguards and privacy

Allow only one screening request at a time, bound response size, and retain
only the small in-session history needed to revisit recent results. Redact
account identifiers, hashes, tokens, and private-key markers from errors and
telemetry. Never log request bodies, authorization headers, signing seeds, or
real personal account data.

## Accessibility and release checks

Keep score, threshold, and caveat text in the live result region. Ensure the
meter has a text alternative, controls have visible keyboard focus, and the
result remains readable at a narrow viewport without relying on color alone.
Respect `prefers-reduced-motion` for loading and scrolling behavior.

Before release, check complete, partial, unavailable, stale, timeout, and
failed-follow-up states using an older response that omits optional metadata.
Record the frontend build, backend scoring-policy version, API origin, and
preview environment. Roll back the frontend to the last verified deployment
if the result contract or caveat copy regresses, without altering backend or
contract schemas in this issue.
