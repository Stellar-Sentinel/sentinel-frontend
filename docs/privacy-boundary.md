# Privacy and analytics boundary

The dashboard treats screening results as session-scoped analyst work. The
frontend does not persist account assessments in browser storage, cookies, or
URL state, and it does not send analytics or error telemetry. Recent screens
are held in React memory only, limited to five entries, and disappear on page
reload or when the user clears them.

The configured backend is the only application API. A submitted account
address is sent to `POST /risk/score`; event and network data are read from
the corresponding backend endpoints. The frontend does not add a second
tracking destination. CSV export is an explicit, local user action over data
already loaded in the page.

The UI keeps these categories distinct:

- on-chain facts, such as contract events and account activity;
- backend observations, such as the returned metrics and data source; and
- heuristic interpretation, such as the risk score and signals.

The regression tests in `tests/privacy-boundary.test.mjs` protect the
in-memory retention limit and flag accidental additions of browser persistence
or analytics/error-reporting sinks in the page boundary.
