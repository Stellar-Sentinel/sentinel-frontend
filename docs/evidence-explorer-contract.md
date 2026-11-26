# Evidence explorer contract

The explorer keeps three evidence boundaries explicit:

- **On-chain facts:** event id, ledger, recorded time, agent, subject account, contract id, score, and an optional transaction hash. These are rendered as chain references and are not presented as proof of fraud or compliance.
- **Backend observations:** account metrics, signal labels, severity, points, explanation, observation window, source URL, network, and `as_of`. These describe what the backend observed and when.
- **Heuristic interpretation:** risk level and threshold status. Copy must call these signals for review, never a definitive finding.

## State and privacy rules

- Loading shows a non-blocking progress state; an empty successful response says that no events have been returned.
- Errors preserve already-loaded events and provide a retry action. Unavailable network/RPC status is distinct from an empty feed.
- Account addresses, transaction hashes, and contract ids may be copied or linked to Stellar Expert when the network is known. Unknown networks and missing hashes remain plain text.
- The client accepts only bounded, typed event fields, ignores malformed rows, caps event retention at 100 rows, and rejects responses larger than 512 KiB. Requests time out after 12 seconds and duplicate event requests are ignored.
- No raw secrets, private keys, tokens, or unnecessary account data are logged or stored across reloads. The recent assessment list is session-only and capped at five entries.

## Accessibility and responsive behavior

All explorer actions have visible labels and keyboard-focusable controls. Status updates use live regions, tables retain their headings on narrow viewports through horizontal scrolling, and motion follows `prefers-reduced-motion`.
