# Responsive layout and cache contract

Responsive dashboard views must remain readable while cached data is labeled by
freshness. Mobile and desktop surfaces use deterministic loading, empty, stale,
degraded, error, and recovery states; no cached response invents account or
event data. Dense tables scroll inside their panel, identifiers wrap, and
controls remain keyboard and touch accessible.

Cache policy is presentation-only: cache keys include the request scope,
optional fields remain optional, and stale data is visibly marked with its
observation age. Retry preserves the current input and pagination intent.
