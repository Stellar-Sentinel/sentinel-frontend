# Explorer link generation UI contract

This contract defines when the dashboard may turn a Stellar identifier into a
read-only Stellar Expert link. It keeps backend network identity, on-chain
facts, and heuristic interpretation separate.

## Data and URL contract

The backend-provided `network` value is the source of truth. The frontend
accepts only these exact, trimmed, case-insensitive values:

| Network value | Explorer segment |
| --- | --- |
| `testnet` | `testnet` |
| `Test SDF Network ; September 2015` | `testnet` |
| `public` | `public` |
| `Public Global Stellar Network ; September 2015` | `public` |

Supported resources are `account`, `contract`, `tx`, and `ledger`. A link is
constructed as:

```text
https://stellar.expert/explorer/<network>/<resource>/<encoded-identifier>
```

The identifier is encoded with `encodeURIComponent` and remains one URL path
segment. The URL-generation helper is the single boundary; callers must not
concatenate explorer URLs or infer a network from an address prefix, hash, RPC
URL, or browser environment.

Unknown or absent networks and blank identifiers return no URL. The UI keeps
the identifier as text instead of defaulting to Public Network or Testnet.
Optional backend fields remain optional for older deployments: a missing
`transaction_hash` renders no transaction link, and a missing `network`
renders identifiers as text.

## Interaction states

| State | UI behavior |
| --- | --- |
| Loading / network unknown | Keep loaded identifiers visible as text; do not wait for or guess a network. |
| Empty identifier | Show the existing empty marker or label; never render an empty link. |
| Success / known network | Render account, contract, transaction, or ledger as a link to the matching network. |
| Stale or degraded status | Preserve the backend-provided network identity. If it is allow-listed, links remain available and the status remains visibly separate from the link. |
| Unavailable / unknown network | Disable explorer links and explain that the network could not be verified; preserve the identifier. |
| Recovery | Retrying network status may restore links, but a failed retry keeps the last safe rendering and never substitutes another network. |

Links are read-only evidence references. A link being available does not prove
that a record exists, is current, fraudulent, compliant, or otherwise risky.

## Accessibility and safe user-facing copy

- Links open in a new tab with `noopener noreferrer`.
- Link names identify the resource and network, for example `View transaction
  on Stellar Expert (Testnet)`.
- Unknown-network identifiers remain keyboard-readable text; no empty or
  unlabeled control is inserted.
- Network state uses text as well as color, and status changes are announced
  through the existing polite status region.

Suggested unavailable copy: `Network context could not be verified. Explorer
links are disabled until the network is known.`

## Mocked examples

```text
explorerUrl("Test SDF Network ; September 2015", "account", "<subject-account>")
=> https://stellar.expert/explorer/testnet/account/%3Csubject-account%3E

explorerUrl("public", "contract", "C/example")
=> https://stellar.expert/explorer/public/contract/C%2Fexample

explorerUrl("private", "tx", "<transaction-hash>")
=> null
```

Examples use placeholders only. Do not add real accounts, transaction hashes,
tokens, private keys, or personal account data to fixtures, screenshots, or
documentation.

## Regression coverage

The contract test covers canonical names and passphrases for both allow-listed
networks, every supported resource type, path-segment encoding, blank
identifiers, absent networks, and near-match network rejection. Update the
allow-list, this contract, and the tests together when a new network is
reviewed and explicitly supported.
