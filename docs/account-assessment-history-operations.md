# Account assessment history

This dashboard keeps a short review trail for analysts comparing recent lookups. The trail is deliberately page-session state: it is held in React memory, is never written to `localStorage`, `sessionStorage`, cookies, analytics, or the backend, and disappears on a full browser refresh or when the page is closed.

## State and replacement policy

`assessmentHistory` is an ordered `RiskResult[]`. Each successful `POST /risk/score` response is inserted at the front. A response for an address already in the list replaces the older result and moves that address to the front. The list is capped at five entries; failed requests never enter it.

The current result is separate from the history list. Selecting a recent screen restores its address and result without fetching again. Clearing the current assessment only clears the visible result and form. Removing an item removes it from the recent-screen controls but does not erase a currently displayed result. “Clear recent screens” removes all history while leaving the current result visible.

The helper policy is covered by `test/assessment-history.test.ts`. Keep the helper pure so changes to ordering, deduplication, or the five-entry cap can be reviewed without a browser or backend.

## Privacy and evidence boundaries

- Store only the successful backend response needed to render the existing result. Do not add raw request payloads, credentials, private keys, tokens, or personal profile data.
- On-chain facts (account address, metrics, and timestamps) remain distinct from backend observations and heuristic interpretation. A score or threshold is a review signal, not proof of fraud, compliance status, or intent.
- Do not add fabricated accounts or real account examples to fixtures, screenshots, or docs. Use placeholders such as `<subject-account>`.
- A backend failure leaves the last successful visible result in place and shows the new error; it does not mutate history.

## Refresh and deployment semantics

Network and event-feed refreshes do not clear account history. A full page reload clears it by design, so previews and production must not be described as providing persistent analyst workspaces. If persistence or cross-user history is later required, coordinate a separate backend/privacy issue before changing this boundary.

For a Vercel preview or production rollout:

1. Run `npm run test`, `npm run lint`, and `npm run build` against the candidate.
2. In a narrow viewport, complete two successful placeholder-account lookups, restore the older one, remove one entry, clear the remainder, and confirm keyboard focus reaches each button.
3. Trigger a failed lookup after a successful one and confirm the last result remains visible.
4. Confirm a browser refresh clears “Recent screens”; do not use real account data.
5. If history controls regress or sensitive data is introduced, roll back to the prior Vercel deployment. Render/backend rollback is not required because this change does not alter API or contract schemas; coordinate any API response change with [sentinel-backend](https://github.com/Stellar-Sentinel/sentinel-backend) and [sentinel-contracts](https://github.com/Stellar-Sentinel/sentinel-contracts).

The frontend API origin is configured with `NEXT_PUBLIC_API_BASE_URL`; it is public configuration and must never contain a secret. See the root README for local setup and CORS requirements.
