# Stellar address validation contract

The browser performs a cheap, network-agnostic shape check before submitting
an account assessment. It must not claim that an address exists or that it has
passed Stellar checksum validation; the backend remains authoritative.

## Interaction contract

- Trim pasted input before validation and submission; do not store it outside
  the current page session or add it to telemetry.
- Accept the classic public-account shape (`G` followed by 55 uppercase
  base32 characters). Keep the message concise and say that the check is only
  a format check.
- Keep the input labelled, expose invalid state with `aria-invalid`, and make
  the format hint a live status. The control must work with keyboard input and
  narrow layouts.
- Do not call the backend for an empty or malformed value. A valid-shaped value
  may still receive a backend validation error, which should remain distinct
  from network failure and offer the normal retry path.

## Example states

Fixtures use placeholders only: `G` plus 55 base32 characters is a valid
shape; lowercase, the wrong prefix, and the wrong length are malformed. The
UI must never present a format match as proof of account ownership, existence,
or compliance status.
