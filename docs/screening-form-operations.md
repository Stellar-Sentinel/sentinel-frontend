# Account screening form operations

The dashboard's screening form sends one request to the backend's
`POST /risk/score` endpoint. The browser sends `{ "address": "G..." }` and
expects a risk result containing a score, threshold, signals, metrics, source,
and observation time. The score is an off-chain signal, not proof of fraud or
compliance status.

## Form state and copy

- **Idle:** show `Analyze account`; keep the submit button disabled until the
  field contains text.
- **Invalid:** the address must be a 56-character, `G`-prefixed Stellar public
  key. Show `Enter a 56-character G-prefixed Stellar public account address.`
  before sending a request.
- **Loading:** disable duplicate submissions and show `Analyzing`. The client
  aborts a request after 12 seconds and displays `The request timed out. Try
  again.`
- **Success:** preserve the returned assessment and keep the score, source,
  signals, and metrics visibly distinct. A later failed request must not erase
  the last successful assessment.
- **Degraded or unavailable:** show an alert with the backend error, tell the
  analyst to check the address and API availability, and offer `Clear form`
  only when no previous assessment exists. Never replace missing data with
  fabricated sample values.

The form uses a visible label for the address input, `aria-invalid` for format
errors, a live result region, and a status alert for failures. Keyboard users
must be able to focus the input, submit with Enter, and reach the clear and
history controls in their normal tab order. On narrow screens, verify that the
input, submit button, alert, and score remain readable without horizontal
scrolling.

## Deployment coordination

Set `NEXT_PUBLIC_API_BASE_URL` to the public backend origin at build time. It
is exposed to the browser and must never contain a secret. Configure the
backend's `CORS_ORIGINS` with the production and preview origins. Vercel
preview builds should point to a non-production backend or a deliberately
approved Testnet environment; do not use production account data as fixture
data.

Before promoting a build, verify a valid account, invalid input, a backend
validation error, a timeout/unavailable response, and a second request after a
successful assessment. Confirm that the API response is compatible with the
optional fields used by the UI and that the backend and contract release
versions are recorded together.

If the screening flow regresses, roll back the frontend to the last verified
Vercel deployment and keep the backend response contract unchanged. Confirm
the preview and production environment variables after rollback, then repeat
the keyboard and narrow-viewport checks. Do not log API keys, signing seeds,
private keys, or real personal account data while diagnosing a deployment.

Related coordination: the backend owns `/risk/score` and CORS; the
[sentinel-contracts event schema](https://github.com/Stellar-Sentinel/sentinel-contracts/blob/main/docs/EVENT_SCHEMA.md)
owns on-chain event compatibility. Changes to either response or event
schemas require a coordinated issue and a backwards-compatible rollout.
