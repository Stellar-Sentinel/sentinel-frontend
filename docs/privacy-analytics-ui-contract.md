# Privacy and analytics UI contract

Screening results may contain account-specific information and are intended
for the current analyst session. The UI must make retention and telemetry
choices explicit so an analyst is never surprised by silent persistence or
exposure.

## Data boundary

The browser may hold the current result and up to five successful results in
in-memory session state so the analyst can revisit them before leaving the
page. Do not persist screening results, account identifiers, transaction
hashes, scores, signals, API payloads, or error details in cookies,
`localStorage`, `sessionStorage`, IndexedDB, URL parameters, service-worker
caches, or analytics payloads. A reload or a new browser session clears this
working set.

There is no implicit analytics collection in this frontend. If telemetry is
added later, it must be opt-in at the product level, document its purpose and
retention, and use coarse non-identifying events such as `screening_started`,
`screening_succeeded`, or `screening_failed`. Never send an account, wallet,
transaction, response body, score, signal, cookie, or free-form error string.

Error reporting follows the same boundary: send only a stable failure class,
deployment provenance, and bounded technical metadata. Redact backend error
messages before displaying or reporting them.

## Interaction states

| State | Accessible copy | Required behavior |
| --- | --- | --- |
| Loading | `Checking this account…` | Keep the submit control labelled and expose progress. |
| Empty | `Enter a Stellar account to begin.` | Give the input an associated label and no fabricated result. |
| Success | `Screening complete.` | Show chain facts, backend observations, and heuristic interpretation as separate groups. |
| Stale | `Showing the last successful result.` | Say that the displayed result is from the current session and offer retry. |
| Error | `We could not complete the screening. Try again.` | Keep the technical detail out of the accessible message. |
| Retry/recovery | `Retry screening` / `Screening complete.` | Return focus predictably and replace only the failed request state. |

Loading, empty, success, stale, error, and retry states must be reachable with
the keyboard, have visible focus, and remain understandable at narrow
viewports and with reduced motion. Never require color alone to communicate a
state.

## Review and verification checklist

For a UI or dependency change, confirm that a page reload clears screening
results; no new storage, cookie, URL, or analytics call was introduced; error
copy is redacted; and the browser network panel contains no account-specific
telemetry. Check keyboard-only navigation, narrow viewport layout, and reduced
motion behavior. Use synthetic placeholders only in tests and documentation.

This contract governs the frontend boundary only. Backend retention, hosting
logs, browser extensions, and third-party infrastructure require their own
review and must not be described as covered by this document.
