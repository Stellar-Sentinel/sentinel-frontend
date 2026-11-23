# Activity asset rendering UI contract

This contract defines how activity amounts are labelled and formatted when a
Horizon operation contains native XLM, an issued asset, or an asset that the
frontend cannot identify. It prevents an issued-asset amount from being
presented as XLM while keeping optional backend fields compatible with older
responses.

## Data contract

The backend remains the source of truth for asset identity. The UI must not
infer an asset from an amount, operation type, or missing issuer. Values remain
decimal strings so large values and trailing precision are not silently
rounded. `native` is the only identity that may show the unit `XLM`.

| Asset identity | Badge | Main value | Secondary identity |
| --- | --- | --- | --- |
| Native | `Native` | `<formatted amount> XLM` | `Stellar native asset` |
| Issued with valid code and issuer | `Issued` | `<formatted amount> <CODE>` | `Issued by <truncated issuer>` |
| Missing/invalid identity | `Unknown asset` | `<formatted amount>` | `Asset identity unavailable` |

Preserve source precision for accessible details, and never append XLM to an
issued or unknown amount. Issuer identifiers may be visually truncated but
must remain available through an accessible details or copy affordance where
the product supports it. Explorer links require known network and issuer.

## State and accessibility contract

| State | Required behavior |
| --- | --- |
| Loading | Keep operation context visible and show `Loading asset details`; never show XLM as a placeholder. |
| Empty | Show `No asset activity to display.` and do not insert sample rows. |
| Success | Show the formatted value, one badge, and identity according to the table above. |
| Stale | Keep the last value and label it `Previously loaded asset details`. |
| Error | Show `Asset details are temporarily unavailable.` and `Retry asset details`. |
| Degraded | Show `Unknown asset` and `Asset identity unavailable` when metadata is incomplete. |
| Unavailable | Preserve the operation and show `Amount unit unavailable` when the optional asset object is absent. |

Retry is idempotent and must not duplicate rows. State changes use a polite
live region; actionable errors use an alert. Preserve visible focus, keyboard
order, narrow-layout usability, and `prefers-reduced-motion`. Do not rely on
badge color alone.

## Mocked examples and review checklist

Use placeholders only, such as `op-placeholder-issued` and
`<issuer-account>`. Never add real accounts, hashes, tokens, private keys, or
personal data to fixtures, screenshots, logs, or documentation.

- Native values are the only values labelled XLM.
- Issued values show code plus issuer or explicitly degrade to Unknown asset.
- Optional fields do not remove operations or invent identity.
- Loading, empty, success, stale, error, retry, degraded, and unavailable
  states are covered.
