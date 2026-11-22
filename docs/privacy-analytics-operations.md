# Privacy and analytics operations

This guide turns the privacy boundary into a contributor and deployment
checklist. Screening results can contain account-specific activity; they are
for the current analyst session and are not a durable frontend record.

## Boundary at a glance

| Data | Allowed frontend handling | Prohibited handling |
| --- | --- | --- |
| On-chain facts (account, contract, transaction, ledger) | Render from the backend response; link only when the network is known; keep in React memory | Persist across reloads, put in URLs, logs, screenshots, or telemetry |
| Backend observations (metrics, evidence, timestamps) | Label as backend-sourced and render only optional fields that are present | Treat as on-chain proof or copy raw responses into errors |
| Heuristic interpretation (score, signals, threshold) | Label as a signal for review | Describe as fraud, compliance, intent, or certainty |
| Operational telemetry | If an approved integration exists, use `sanitizeTelemetry` and send only route, status class, latency bucket, and deployment ID | Send addresses, hashes, scores, signals, response bodies, headers, clipboard text, or request bodies |

There is no implicit analytics collection in this frontend. The in-session
assessment list is capped at five entries, is held in React state, and is cleared
by the existing clear controls or on page exit. Do not add localStorage,
sessionStorage, cookies, IndexedDB, URL parameters, or analytics SDK calls for
screening data.

## Contributor checks

Before requesting review:

1. Use placeholder-only fixtures such as `G...placeholder`, `C...placeholder`,
   and `evt-placeholder`; never paste a real account, token, signing key, or
   personal data into tests, screenshots, or docs.
2. Keep `NEXT_PUBLIC_API_BASE_URL` as a public origin only. It is browser-visible
   configuration, not a secret store.
3. Exercise loading, empty, degraded, unavailable, retry, and recovery states.
   A failed follow-up request must leave the last successful result visible.
4. Check a narrow viewport and keyboard-only navigation. Status copy must remain
   understandable without color, and retry/clear actions must be reachable.
5. Run `npm test`, `npm run lint`, and `npm run build` before handoff.

The pure `app/privacy.ts` helpers and `test/privacy-boundary.test.ts` provide a
regression guard for the five-item retention limit and the telemetry allowlist.
They do not prove that a third-party deployment or browser extension collects
no data.

## Preview and deployment procedure

1. Set the Vercel preview's `NEXT_PUBLIC_API_BASE_URL` to the intended Render
   backend origin. Do not copy values from `.env.local` unless they are public.
2. Add the exact preview origin to the backend CORS allowlist for review, then
   remove it when the preview is retired.
3. In the preview, confirm that screening, event loading, CSV export, and retry
   work; inspect browser storage and the Network panel for unexpected
   persistence or requests. Requests may contain the user-entered account only
   when the analyst submits screening; it must not be sent to analytics.
4. Verify that errors show redacted actionable copy, optional backend fields can
   be absent, and on-chain facts remain distinct from backend observations and
   heuristic signals.
5. Before promotion, compare preview and production API origins, CORS entries,
   contract configuration, and RPC/network status. Record the deployment ID and
   check time, not account data.

## Rollback and incident handling

If a release introduces persistence, an unsafe telemetry payload, or a broken
privacy boundary, pause promotion and roll back the Vercel frontend to the last
known-good deployment. Keep Render running unless the failure is in the API or
CORS contract. Re-run the smoke flow (screen, refresh, retry, event detail,
clear, and reload) and inspect deployment/request logs for identifiers or raw
responses. Remove any temporary preview CORS entry and document the affected
deployment, endpoint, and redacted symptom in the linked issue.

This frontend cannot guarantee privacy outside its own code: backend retention,
hosting logs, browser extensions, explorers, and third-party infrastructure need
their own review. Any change to retention, telemetry, API optionality, or CORS
requires coordinated frontend/backend review; this milestone does not change a
backend or contract schema.
