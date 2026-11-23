# Activity asset rendering operations

Activity amounts must preserve the asset identity supplied by the backend.
The frontend must never label an issued asset as XLM merely because an asset
code is missing or a row came from a native-looking operation.

## Display contract

Each operation may contain an asset type, code, issuer, amount, precision, and
path-payment context. Optional fields remain optional for older backend
deployments:

- Native XLM is labelled `XLM` only when the backend identifies the asset as
  native or supplies the canonical native asset shape.
- An issued asset shows its code and issuer when both are available. The issuer
  is displayed in a bounded, copyable form and is never inferred from the
  account or transaction prefix.
- An unknown or incomplete asset is labelled `Unknown asset`, not XLM. Keep the
  raw amount visible only when its provenance is clear.
- Amounts use a bounded decimal formatter and retain the backend's sign. Do
  not round a value into zero or silently convert a path payment into XLM.

## User-facing states

Loading keeps the row structure visible. Empty results explain that no
operations were returned. Degraded responses retain known asset facts and mark
missing issuer, precision, or path fields as unavailable. Unavailable data uses
redacted error copy and a retry control. Recovery replaces the failed page
without duplicating operations or changing asset identity.

Asset badges and issuer text must have accessible labels and must not rely on
color alone. Narrow layouts may scroll long issuer values, and keyboard users
must be able to focus copy or explorer actions without an unlabeled control.

## Preview and rollback checks

Use placeholders only in fixtures: one native asset, one issued asset with an
issuer, one issued asset with missing optional metadata, an unknown asset, and
a path payment with multiple assets. Verify a narrow viewport and keyboard
flow. Coordinate response changes with backend normalization and explorer-link
issues before release. If an asset is mislabeled or a path payment loses its
identity, roll back the frontend deployment and keep the last known-good view;
do not add fabricated production data.

Never include tokens, private keys, real account data, or real transaction
hashes in fixtures, screenshots, logs, or deployment notes.
