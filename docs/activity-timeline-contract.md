# Activity timeline asset rendering

The activity timeline renders backend-normalized operations. It is an
on-chain activity view, not a risk decision.

Each operation may include an `amounts` array. Render each amount independently:

- Map `asset_type: "native"` to `XLM`.
- For issued assets, display the supplied `asset_code` and `asset_issuer` when
  present. Never use an issued `asset_type` such as `credit_alphanum4` as the
  visible asset code.
- If an issued asset has no code, display `Unknown asset`; do not infer one.
- Preserve the backend amount text, and use `—` when it is absent or blank.

Fixtures and examples must use placeholder accounts and issuers only. The UI
must not make live Horizon or Soroban calls to render these states.
