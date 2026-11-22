# Event detail navigation operations

This guide documents the event-detail behavior shipped by the frontend and the
checks needed when promoting it between preview and production. It applies to
the current dashboard implementation, which uses the shareable
`?event=<event-id>` query parameter rather than a separate Next.js route.

## What an analyst can bookmark

Selecting **View details** from a loaded event updates the URL with the event's
opaque `id` and keeps the page in place. The URL is safe to copy or bookmark:

```text
https://sentinel-frontend-gules.vercel.app/?event=<event-id>
```

The event must be present in the currently loaded `GET /events` pages. A deep
link does not invent or fetch an event by array position. If the selected ID is
not in the current response, the page shows **Event unavailable**, offers
**Refresh events**, and leaves the rest of the feed usable. **Back to events**
removes the query parameter without a full-page reload; browser Back and
Forward restore the selected ID through the History API.

On-chain facts and backend observations remain separate:

- On-chain facts are the event ID, ledger, contract, subject, transaction hash,
  and the explorer links available for a known network.
- Backend observations are the recorded timestamp, monitoring agent, and the
  optional evidence response.
- The score is a heuristic signal for review. It is not proof of fraud,
  compliance status, or intent.

An event with a `report_digest` checks `/evidence/<digest>` as an optional
secondary request. Missing evidence must not hide the on-chain event. A digest
without a backend record is shown as:

> On-chain event loaded. Optional backend evidence is unavailable.

## API and environment contract

The browser calls the backend configured by `NEXT_PUBLIC_API_BASE_URL`. This is
a public origin and must never contain a token, private key, or other secret.
The backend must allow the deployed frontend origin in `CORS_ORIGINS`.

The event-detail flow depends on these existing responses:

| Request | Operational expectation |
| --- | --- |
| `GET /events?limit=20&cursor=...` | Returns paginated events with an opaque `id`, on-chain fields, and optional `report_digest`. |
| `GET /evidence/<digest>` | Returns optional evidence, or `404` when no record exists. A 404 is not an event-feed failure. |
| `GET /network/status` | Identifies the network used to decide whether Stellar Expert links are safe to render. |

Keep frontend and backend changes coordinated through the
[sentinel-backend issue tracker](https://github.com/Stellar-Sentinel/sentinel-backend/issues).
Contract event or deployment changes belong in the
[sentinel-contracts issue tracker](https://github.com/Stellar-Sentinel/sentinel-contracts/issues).
This frontend change does not alter either backend or contract schema.

## Vercel preview and Render coordination

For a pull request preview:

1. Set `NEXT_PUBLIC_API_BASE_URL` to the intended Render backend origin in the
   Vercel preview environment. Do not copy a secret from a local `.env` file.
2. Add the exact Vercel preview origin to the backend's `CORS_ORIGINS` for the
   duration of review. Remove temporary origins after the preview is retired.
3. Open the preview with an event feed available, select **View details**, and
   copy the resulting `?event=` URL into a fresh tab. Confirm that refresh,
   Back, Forward, **Back to events**, and an unknown ID behave as documented.
4. If Render is cold, wait for the API to wake and use the dashboard retry
   action. Do not treat a first-request timeout as evidence that the event
   navigation is broken.

Before promoting to production, compare the preview and production values of
`NEXT_PUBLIC_API_BASE_URL`, verify the backend CORS allowlist, and check that
the contract ID and Soroban RPC configured by the backend are still valid.

## Explicit UI states

These messages are intentional and should remain truthful when API behavior
changes:

| Situation | User-facing behavior |
| --- | --- |
| Events are loading | `Loading contract events` and a source check message. |
| No events are returned | `No flag events yet`; no sample event is substituted. |
| Feed request fails | `Event feed unavailable` with `Try again`; already loaded events remain visible when possible. |
| Event ID is absent from loaded pages | `Event unavailable` with `Refresh events` and `Back to events`. |
| Optional evidence is missing | The on-chain detail remains visible and says optional evidence is unavailable. |
| Network context is unknown | Identifiers remain text; explorer links are not fabricated. |

## Rollback and smoke checks

If a release causes broken links or incompatible API responses:

1. Disable or roll back the Vercel deployment to the last known-good frontend
   deployment.
2. Keep the backend running unless its response or CORS change is the cause;
   avoid rolling back both services without checking which contract broke.
3. Re-run the smoke flow: load events, open details, refresh a deep link,
   return with **Back to events**, and confirm an unknown ID remains explicit.
4. Inspect the Vercel deployment logs and Render request logs for the affected
   `/events`, `/evidence/<digest>`, and `/network/status` calls.
5. Record the deployment commit, API origin, contract ID, and observed error in
   the linked backend or contract issue before retrying promotion.

For local validation, use a non-secret `.env.local` with the backend origin,
then run `npm run lint`. The repository CI additionally runs `npm run build`.
