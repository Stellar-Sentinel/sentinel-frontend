# Component test foundation contract

The frontend test foundation must make UI behavior deterministic without
contacting live backend, Horizon, RPC, or explorer services.

## Required fixture boundaries

- Mock the fetch boundary and provide explicit success, empty, malformed
  optional-field, failure, retry, stale, and recovery responses.
- Keep on-chain facts, backend observations, and heuristic interpretation in
  separate fixture fields so assertions cannot conflate them.
- Use placeholder addresses and event identifiers only. Never put credentials,
  private keys, cookies, or production data in fixtures or snapshots.
- Reset mocks, timers, DOM state, and navigation state after every case.
- Assert accessible names, focus behavior, live status text, and responsive
  layout invariants alongside visible copy.

## Operational checklist

1. Run focused component tests with deterministic time and network mocks.
2. Run lint and the production build in CI, keeping fixture-only failures
   separate from deployment failures.
3. Review snapshots for accidental secrets, real account data, generated
   clutter, and unstable timestamps before committing them.
4. Keep tests independent so a failed retry or pagination case does not poison
   later cases.

The foundation is a test boundary, not a source of fabricated production
records.
