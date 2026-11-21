# Fetch client implementation contract

The fetch boundary builds requests from the configured API base, distinguishes
valid empty responses from HTTP, abort, and network failures, and preserves
optional fields for older deployments. Non-2xx responses become safe typed
errors; retry preserves input and pagination. Diagnostics may include operation,
status class, duration, and retry count, but never bodies, secrets, cookies, or
account identifiers.
