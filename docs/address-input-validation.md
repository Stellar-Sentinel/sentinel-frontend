# Stellar address input contract

The browser performs only a cheap shape check before `POST /risk/score`. The
backend remains authoritative for checksum, network, account existence, and
classic versus muxed-address rules. The client must never claim that a shape
check proves an address is valid.

## Input behavior

- Trim surrounding whitespace and preserve the user's pasted value while the
  field is focused.
- Do not send a request for an empty value or an obviously malformed shape.
- Keep validation messages network-agnostic: `Enter a valid Stellar account
  address.` and `The address could not be assessed. Try again.`
- Do not log or send clipboard contents, tokens, private keys, or unrelated
  account data.
- Submit is disabled only while the current request is active; a new request
  cancels the prior one and a prior successful result remains visible.

## State and accessibility contract

Invalid input uses `aria-invalid` and a nearby `role="status"` message. Server
rejection is an alert with a retry action where retry is meaningful. Loading
uses a non-blocking status and never hides a previous successful assessment.
Focus indicators remain visible, error copy does not rely on color, and reduced
motion is respected for scroll and transition behavior. At narrow widths the
input and submit control stack without horizontal scrolling.

The full address is shown only through an explicit copy action; visible result
labels use a shortened address. Test fixtures use `<subject-account>` rather
than real account identifiers.
