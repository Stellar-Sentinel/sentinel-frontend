# Explorer link contract

Explorer links are optional presentation helpers. They must never turn an
untrusted value into executable markup or imply that an unavailable link is a
verified fact.

## Link generation

- Generate links only for the recognized Stellar network and resource type:
  account, contract, or transaction.
- Encode the resource identifier as a URL component and render it as text.
- Unknown networks, empty identifiers, and malformed values render a plain
  value without a link.
- External links open with `noopener noreferrer` and have an accessible name
  that identifies the resource and destination.
- Link construction must not include tokens, cookies, private keys, or hidden
  query parameters.

## Regression matrix

| Input | Expected result |
| --- | --- |
| Public network + account | Correct public explorer account URL and readable label. |
| Testnet + contract or transaction | Correct testnet URL with encoded identifier. |
| Unknown network | Plain text, no guessed network. |
| Empty or malformed value | Plain text or unavailable copy, never a fabricated link. |
| Identifier containing reserved characters | Proper URL encoding and no markup injection. |
| Keyboard and screen reader use | Visible focus, meaningful accessible name, and no reliance on the external page. |

The matrix uses placeholders only and must not contain real account data or
production transaction identifiers.
