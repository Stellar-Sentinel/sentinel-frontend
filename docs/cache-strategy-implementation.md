# Frontend caching implementation rules

Cache reads must be safe when optional response fields are missing. Invalidate
or bypass entries after a failed refresh, retain last-known data only with a
stale label, and prevent duplicate pagination results. Keep cache diagnostics to
status, duration, and age; exclude response bodies, tokens, cookies, and real
account identifiers.
