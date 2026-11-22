# Visual regression contract

Visual checks protect the dashboard's information hierarchy without storing
real account data. Use deterministic placeholder responses and assert stable
structure and accessible copy rather than snapshotting secrets or live data.

## Required states

Capture or assert the following representative states:

- loading: API and RPC status indicators are visible and prior data is not
  replaced during refresh;
- empty: event history and signal cards explain that no data is available;
- success: score, threshold, signals, activity, and event fields retain their
  distinct labels;
- stale/degraded: freshness and partial-data caveats remain visible;
- error/unavailable: retry controls and actionable redacted copy are visible;
- recovery: the failed panel is replaced after retry without duplicating rows.

Run the matrix at a narrow mobile viewport, a standard laptop viewport, and a
wide analyst viewport. Cover the overview, screening, event feed, and
network-status surfaces in the states above.

Fixtures should use values such as `G...placeholder`, `C...placeholder`, and
`evt-placeholder`; they must not contain real accounts, transaction hashes,
API keys, signing seeds, private keys, or personal data. Optional backend
fields should be omitted in at least one fixture so older responses remain
covered. Use a fixed clock and deterministic API responses. Disable or settle
animations for captures while keeping reduced-motion behavior covered.

## Responsive and accessibility assertions

Check desktop and a narrow viewport for the dense result cards, event table,
timeline, badges, and navigation. Assert no page-level horizontal overflow,
overlapping controls, clipped focus indicators, or unreadable long identifiers.
Tables may scroll horizontally, but state copy and primary actions must remain
usable. Verify labelled inputs, buttons,
retry controls, visible keyboard focus, live/status announcements, and
reduced-motion behavior. Do not rely on color alone for score or severity.

When layout changes, review the diff for accidental account data, generated
clutter, and changed caveat copy. Record browser/runtime version and fixture
revision with the check. A visual mismatch is a review signal, not a reason to
weaken accessibility or privacy assertions.
