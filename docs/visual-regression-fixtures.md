# Visual regression fixtures

The executable fixture catalog in `test/visual-regression-fixtures.ts` is the
single source for deterministic `loading`, `empty`, `success`, `stale`,
`error`, and `recovery` states. The companion contract test checks that each
state has heading and status copy, uses placeholder identifiers, and contains
no private keys, credentials, real account identifiers, transaction hashes, or
external URLs.

Run the contract with:

```sh
npm test -- --test-name-pattern='visual regression'
```

Browser screenshot tooling can consume the same catalog later without creating
a second source of fixtures or introducing live account data.
