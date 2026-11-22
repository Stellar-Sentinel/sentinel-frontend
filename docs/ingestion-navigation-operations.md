# Ingestion freshness and navigation operations

The event feed treats freshness as backend metadata, not as an on-chain fact. A current response
may be labelled `fresh`; a delayed response is `stale`; a missing or unreadable metadata field is
`unknown`. The UI must show the timestamp and a short explanation, keep already loaded events
visible, and offer retry without fabricating sample events.

Dashboard sections use hash navigation (`overview`, `investigate`, and `events`). A deep link with
an event identifier is valid only after that event is present in the loaded response. Invalid or
expired links show an unavailable state and a refresh action. Navigation must remain keyboard
reachable, preserve browser history, and avoid logging account values, response bodies, or tokens.

Older backend responses may omit freshness metadata and remain compatible: render the unknown
state and preserve the existing event data. Preview deployments use their configured public API
origin; production and preview must never share a secret-bearing endpoint.
