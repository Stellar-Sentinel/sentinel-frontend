# Explorer link generation operations

This frontend generates read-only Stellar Expert links for on-chain identifiers. The helper in `app/explorer.ts` is the single URL-generation boundary; callers should not build explorer URLs inline.

## Network mapping

Only these exact, trimmed, case-insensitive network values are allowed:

| Backend network value | Explorer path |
| --- | --- |
| `testnet` | `/explorer/testnet/` |
| `Test SDF Network ; September 2015` | `/explorer/testnet/` |
| `public` | `/explorer/public/` |
| `Public Global Stellar Network ; September 2015` | `/explorer/public/` |

The supported resource types are `account`, `contract`, `tx`, and `ledger`. The identifier is encoded with `encodeURIComponent` so it remains one path segment. A network outside this allow-list, an absent network, or a blank identifier returns no URL; the UI must render that value as text instead of guessing a destination.

Examples:

```text
explorerUrl("testnet", "account", "GABC…")
=> https://stellar.expert/explorer/testnet/account/GABC%E2%80%A6

explorerUrl("public", "contract", "C/example")
=> https://stellar.expert/explorer/public/contract/C%2Fexample

explorerUrl("private", "tx", "hash")
=> null
```

## Operational behavior

- A known network enables account, contract, transaction, and ledger links in the dashboard.
- An unknown or unavailable network keeps identifiers visible as plain text. It is not safe to default to public or testnet.
- A missing transaction hash does not render a transaction link; the event table shows an em dash.
- Links open Stellar Expert in a new tab with `noopener noreferrer`. They are evidence references only: the frontend does not infer fraud, compliance, or risk from a destination.
- Backend network identity remains the source of truth. Do not derive the network from an account prefix, contract prefix, transaction format, or the browser environment.

## Test vectors and change procedure

Run the focused URL contract tests after changing the mapping or helper:

```bash
npm test -- --test-name-pattern='explorer'
```

The vectors cover both canonical Stellar passphrases, aliases, exact allow-list rejection, blank identifiers, and path-segment encoding. Update the tests and this table together when the backend introduces a new supported network. A new network must be explicitly reviewed before it is added; do not broaden matching with substring checks.

For a preview or deployment check, verify one account, contract, and transaction link on each supported network, then verify that an unknown network and a missing transaction hash remain text. If link generation regresses, revert the frontend deployment or remove the affected mapping; do not silently redirect links to another network.

## Limitations

Stellar Expert availability and the correctness of the backend-provided network are external dependencies. The frontend does not probe or validate a link target before rendering it. A link being available is not proof that the referenced record exists, is current, or supports any risk conclusion.
