# Event detail navigation UI contract

Status: proposed for issue #101

This contract gives each loaded Sentinel event a stable, analyst-facing link. It keeps the selected network in the address, separates facts from interpretation, and remains useful when an event or optional backend record is unavailable.

## URL and navigation

The canonical route is:

```text
/events/<network>/<eventId>
```

`network` is a lowercase allow-listed identifier (`testnet` or `public`). `eventId` is the opaque, URL-encoded event identifier returned by `GET /events`; it is never derived from an account address, score, ledger, or array index. The route is shareable and bookmarkable. The page must preserve the route on refresh and must not silently substitute another network.

The event list links to the canonical route. In-app navigation uses the History API or the framework router without a full page reload. The detail view provides a keyboard-focusable “Back to events” control that returns to the prior list location, including the loaded filter and pagination cursor when available. Browser Back/Forward must restore the selected event and list/detail focus state.

If the product cannot add a dedicated route segment in the first implementation, `?network=<network>&event=<eventId>` is the only compatible fallback. It must be treated as an alias that redirects or normalizes to the canonical path; URLs without `network` are not canonical.

## Data contract

The frontend consumes the existing event feed and may use a dedicated detail endpoint later. No new backend schema is implied by this document.

```ts
type EventNetwork = "testnet" | "public";

type EventDetail = {
  id: string;                 // required, opaque stable identifier
  network: EventNetwork;      // required route/data context
  ledger: number;             // required on-chain fact
  created_at: string;         // required ISO-8601 timestamp
  contract_id: string;        // required on-chain contract identifier
  subject: string;            // required account identifier
  agent: string;              // required monitoring-agent account
  score: number;              // required observed score value
  transaction_hash?: string | null;
  report_digest?: string | null;
};
```

Required fields are shown as on-chain or backend observations only when present in the response. Optional fields get an explicit “Unavailable” value; the UI must not invent a hash, digest, timestamp, score, or account. `score` is a heuristic signal and must be labeled as such; it is not a finding of fraud, compliance status, or intent.

The detail response, if introduced, should be `GET /events/<network>/<eventId>` and return either `200 { event: EventDetail }`, `404 { detail: "Event not found" }`, or the standard API error envelope. A list response remains paginated with `GET /events?limit=20&cursor=...`.

## State and copy contract

The detail region must expose a heading and a status announcement for each state:

| State | Required behavior and representative copy |
| --- | --- |
| Loading | Keep the route visible; show a skeleton or spinner and `Loading event details`. Do not show stale values as current. |
| Empty | The event feed returned no events: `No event details are available yet.` Keep a link back to the event list. |
| Success | Show the event ID, network, ledger, recorded time, subject, agent, contract, optional transaction, and score labeled `Heuristic score`. |
| Stale | If list data is rendered while revalidation runs, label it `Previously loaded event — checking for updates` and retain the last known values until the request completes. |
| Error | For timeout/5xx: `Event details are temporarily unavailable.` Provide `Retry` and `Back to events`; do not clear the URL. |
| Unknown event | For 404 or an event absent from the selected network: `This event is not available on the selected network.` Provide `Back to events` and `Refresh events`. |
| Optional evidence unavailable | `On-chain event loaded. Optional backend evidence is unavailable.` Never block the on-chain facts on this secondary record. |
| Degraded network context | `Network context could not be verified. Explorer links are disabled until the network is known.` Render identifiers as text, not links. |

## Information boundaries

The detail view has three visually distinct groups:

1. **On-chain facts:** network, event ID, ledger, contract, transaction hash, and account identifiers. Link only to an explorer for the selected known network.
2. **Backend observations:** recorded timestamp, monitoring agent, and optional evidence metadata. Mark these as sourced by the backend.
3. **Heuristic interpretation:** score and explanatory labels. Use language such as “signal” and “for review,” never “proof,” “fraud,” or “compliant.”

Do not add real account-sensitive examples, tokens, private keys, secrets, or personal data to the UI, fixtures, screenshots, or documentation. Mocked payloads used in tests or review must use placeholders such as `<subject-account>` and `<transaction-hash>`.

## Accessibility and responsive behavior

- Use one `h1`/detail heading hierarchy and a landmark labelled `Event details`.
- Put focus on the detail heading after navigation and return focus to the activating “View details” control when closing.
- Announce loading, error, retry completion, and unknown-event messages with `role="status"` or `role="alert"` as appropriate.
- Every icon-only control has an accessible name. Every explorer link names its entity and network, for example `View transaction on Stellar Expert (Testnet)`.
- Keyboard order is list link → detail content → retry/back actions; no action is mouse-only. Visible focus styling must remain present.
- At narrow widths, stack metadata into a single column, allow long IDs to wrap, keep actions reachable without horizontal scrolling, and preserve the fixed mobile navigation safe area.
- Respect `prefers-reduced-motion`; scrolling and route transitions must become immediate.

## Representative mocked payload

```json
{
  "event": {
    "id": "evt_demo_01",
    "network": "testnet",
    "ledger": 123456,
    "created_at": "2030-01-02T03:04:05Z",
    "contract_id": "<contract-id>",
    "subject": "<subject-account>",
    "agent": "<monitoring-agent>",
    "score": 72,
    "transaction_hash": null,
    "report_digest": null
  }
}
```

This payload is documentation-only and must not be added to production rendering or presented as a real event.

## Review checklist

- [ ] Canonical URLs contain both network and opaque event ID.
- [ ] Refresh, deep link, Back/Forward, retry, and unknown-event behavior are covered.
- [ ] Facts, observations, and heuristic interpretation are visually and verbally distinct.
- [ ] Optional values, degraded explorer links, responsive layout, and keyboard focus are covered.
- [ ] No real account-sensitive data or credentials are included.
