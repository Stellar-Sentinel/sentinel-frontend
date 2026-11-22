# Responsive dashboard contract

This contract covers the dashboard's presentation states and layout behavior.
It preserves the existing API shape and keeps backend observations, on-chain
facts, and heuristic interpretation visually distinct.

## Breakpoints and overflow

- Below 650px, the sidebar becomes the mobile navigation and the active section
  remains indicated in the navigation.
- Below 900px, score and activity panels use a single-column layout.
- The page never owns horizontal overflow. Dense tables may scroll inside their
  panel, while actions wrap and long addresses, hashes, issuers, and errors can
  break at arbitrary characters.
- Touch controls are at least 44 CSS pixels on coarse pointers and retain a
  visible keyboard focus indicator.

## State contract

Loading, empty, success, stale, degraded, error, and retry states use the same
responsive container as the successful view. A stale or degraded view retains
the last known data and exposes its age. An error view identifies the affected
surface, preserves user input, and offers retry. Optional response fields are
never replaced with fabricated data.

## Accessibility contract

Navigation and controls follow DOM order, icon-only controls have accessible
names, dynamic status messages are announced once, and reduced-motion users do
not depend on animation or smooth scrolling. The regression matrix in
`ui-regression-matrix.md` is the review checklist for these guarantees.
