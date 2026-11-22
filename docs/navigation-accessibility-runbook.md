# Navigation and accessibility runbook

This runbook defines the review and regression cases for dashboard navigation,
deep links, and accessible interactive controls. It uses mocked responses and
does not require live account, event, or network data.

## Deep-link contract

- Supported section fragments are `#overview`, `#investigate`, and `#events`.
- An unknown or missing fragment opens Overview and must not prevent the page
  from rendering.
- An optional event query parameter is treated as an opaque identifier. Missing
  or malformed values show the event list rather than a fabricated detail.
- Navigation updates the active section without losing the current form value.

## Keyboard and state matrix

| Case | Expected result |
| --- | --- |
| Tab through navigation | Focus follows visual order and every control has a visible focus ring. |
| Activate a section with Enter or Space | The target section is reachable and the active state is announced. |
| Loading or retrying | The control remains named and disabled only while the request is active. |
| Empty or unavailable data | The region explains the state and offers a next action where possible. |
| Error then recovery | The error is associated with its region, retry preserves input, and success removes the temporary message. |
| Reduced motion | Fragment navigation uses instant scrolling; no animation is required to understand state. |

## Operational checklist

1. Test the three supported fragments and an unknown fragment at a narrow and
   wide viewport.
2. Use keyboard-only navigation through the account form, event actions, and
   retry controls.
3. Exercise success, malformed optional fields, empty, stale, unavailable,
   failure, retry, and recovery with deterministic mocked responses.
4. Confirm long addresses and hashes wrap without page-level horizontal scroll.
5. Confirm no fixture contains a token, private key, real account, or production
   event identifier.
