# Risk result presentation safeguards

Risk results are transparent, off-chain signals for analyst review. The UI
must not describe a score as proof of fraud, compliance status, or an on-chain
fact.

## Presentation contract

Show the numeric score with its configured review threshold, observation time,
data source/network, and signal explanations as separate pieces of
information. Use the existing low, medium, and high labels consistently;
`threshold_exceeded` is the explicit policy comparison. If an older backend
omits optional metadata, show `Unavailable` or `Not provided` instead of
inventing a policy version, threshold, metric, or sample result.

When supplied, show the policy version and data-completeness indicator beside
the observation time. Treat an unknown policy version as unknown rather than
silently applying a current policy. Preserve a successful result while a
later request is loading or fails, and label its observation time so stale
data is not mistaken for a new assessment.

Recommended copy:

- Complete: `Signals from Stellar Horizon · observed <observation-time>`.
- Partial: `Some activity data was unavailable; interpret this score with caution.`
- Unavailable: `No assessment is available. Check the backend and try again.`
- Caveat: `This score is an off-chain signal for review, not proof of fraud or compliance status.`

## Safeguards and privacy

Allow one screening request at a time, bound response size, and retain only
the small in-session history needed to revisit recent results. Redact account
identifiers, hashes, tokens, and private-key markers from errors and
telemetry. Never log request bodies, authorization headers, signing seeds, or
real personal account data. Use placeholders such as `<subject-account>` and
`<transaction-hash>` in fixtures and screenshots.

## Accessibility and release checks

Keep score, threshold, and caveat text in the live result region. Ensure the
meter has a text alternative, controls have visible keyboard focus, and the
result remains readable at a narrow viewport without relying on color alone.
Respect `prefers-reduced-motion` for loading and scrolling behavior.

Before release, check complete, partial, unavailable, stale, timeout, and
failed-follow-up states using an older response that omits optional metadata.
Record the frontend build, backend scoring-policy version, API origin, and
preview environment. If result-contract or caveat copy regresses, roll back
to the last verified frontend deployment without changing backend or contract
schemas in this issue.
