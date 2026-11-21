# Visual regression contract

Visual regression coverage should verify layout invariants rather than pixel
noise from fonts, timestamps, network data, or animation.

## Required viewports and states

Capture the dashboard at a narrow mobile viewport, a standard laptop viewport,
and a wide analyst viewport. Cover the overview, account screening, event feed,
and network-status surfaces in loading, empty, success, stale/degraded, error,
and recovery states.

## Stable fixture rules

- Use deterministic mocked responses and a fixed clock.
- Disable or settle animations before capture, while retaining reduced-motion
  coverage for navigation.
- Use placeholder addresses, hashes, and event identifiers only.
- Assert no page-level horizontal overflow, overlapping controls, clipped focus
  indicators, or unreadable long identifiers.
- Keep snapshots free of tokens, cookies, private keys, and real account data.

Review diffs for changed information hierarchy and accessibility affordances,
not incidental rendering differences.
