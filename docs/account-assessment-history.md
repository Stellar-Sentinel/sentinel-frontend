# Account assessment history contract

Account history is a session-only convenience for comparing recent successful
lookups. It is not a record of decisions, and it must never be persisted to
local storage, sent to telemetry, or presented as proof of fraud or compliance.

## States and behavior

- **Loading:** keep the current result visible while the next request runs and
  disable duplicate analysis actions.
- **Empty:** hide the history controls until a successful assessment exists.
- **Success:** prepend the latest result, remove any older entry for the same
  address, and retain at most five entries.
- **Stale:** a failed refresh keeps the last successful result visible and
  offers a retry without adding a history entry.
- **Error:** show bounded, user-facing error text; do not echo credentials,
  private keys, raw tokens, or unnecessary account data.
- **Retry/unavailable:** retry the bounded backend request and preserve the
  distinction between backend observations and heuristic interpretation.

History controls must be keyboard reachable, have explicit accessible labels,
and remain usable at narrow widths. They must respect reduced-motion settings
and use placeholder fixtures only in tests and documentation.

## Data boundary

Each entry is the successful backend response needed to restore the current
screen. The page owns the collection, clear action, and individual removal;
unmounting the page drops it. No history entry is written to a cookie,
`localStorage`, URL, analytics event, or server request.
