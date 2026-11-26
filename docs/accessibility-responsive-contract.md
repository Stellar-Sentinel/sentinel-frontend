# Accessibility and responsive layout contract

This document records the UI rules shared by screening, activity, event, and
network-status surfaces. It is limited to presentation and interaction
behavior; it does not define backend or contract schemas.

## State and feedback rules

| State | Required behavior |
| --- | --- |
| Loading | Keep the heading and context visible, announce progress, and do not shift controls when data arrives. |
| Empty | Explain that no records are available and provide the next useful action when one exists. |
| Success | Render facts with their source and observed time where supplied. Heuristic values are labeled as estimates. |
| Stale/degraded | Keep last-known data visible, label its age, and provide a retry action. |
| Error/unavailable | Associate the message with the affected control or region and provide retry without losing input. |
| Recovery | Replace the temporary status after successful retry without disruptive focus movement. |

Optional response fields must degrade to a meaningful label or omission. The
UI must not fabricate account, event, or network data to fill a layout.

## Keyboard and assistive technology

- Navigation links and buttons remain in DOM order and have visible `:focus-visible` styling.
- Inputs have an associated label or explicit accessible name; validation text is associated with the input.
- Dynamic loading, error, and recovery messages use a live region without repeatedly announcing unchanged content.
- Icon-only controls have an accessible name and a minimum 44 CSS pixel target on coarse pointers.
- Reduced-motion users receive instant scrolling and no required animation.

## Responsive rules

- The sidebar becomes the three-item mobile navigation at the existing 650px breakpoint.
- The page must not scroll sideways; dense tables may scroll within their panel.
- Controls and event actions wrap rather than overlap.
- Addresses, hashes, issuer values, and error text may wrap at arbitrary characters.
- Score cards and status panels collapse to one column below 900px.
- Loading, empty, stale, degraded, and error states use the same responsive containers as success.

These rules are compatible with older backend deployments because they describe
optional fields and presentation states only.
