# Navigation and deep-link contract

Dashboard navigation is stateful but must remain safe when a user opens a
bookmark directly or shares an incomplete URL.

- Supported sections are Overview, Account screening, and On-chain events.
- A missing or unknown section fragment falls back to Overview without an
  error or fabricated data.
- An optional event identifier is treated as opaque input and must be bounded,
  encoded, and validated before it is used for lookup.
- Navigation preserves entered account input and pagination intent.
- The active section is reflected in the navigation and remains keyboard
  reachable at mobile and desktop breakpoints.
- Loading, empty, stale, error, and retry states render inside the destination
  section; navigation itself must not imply a successful request.
- Reduced-motion users receive instant navigation and visible focus remains on
  the activated control or destination heading.

The contract uses optional response fields so it remains compatible with older
backend deployments. Examples and fixtures must use placeholders only and may
not contain real accounts, event identifiers, credentials, or private keys.
