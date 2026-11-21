# Dashboard navigation and deep-link contract

Status: proposed for issue #126

The dashboard has three shareable sections: `overview`, `investigate`, and `events`. Section
selection is presentation state; it must never be interpreted as an on-chain fact, backend
observation, or heuristic risk result.

## URL and active-section state

The canonical dashboard URL is `/` with an optional `section` query parameter:

```text
/?section=overview
/?section=investigate
/?section=events
```

The parameter is optional for compatibility with existing bookmarks. A missing or unknown value
normalizes to `overview` without changing any loaded data. The URL must remain reload-safe and
shareable; it must not contain account addresses, scores, tokens, or backend credentials.

The active section is the section whose heading is currently visible. Navigation links update the
URL with `history.pushState` when the user activates a link. Passive scroll tracking may update
the active styling, but should use `history.replaceState` (or no history mutation) so scrolling
does not create a browser-history entry for every section.

An event detail is a separate deep link using the existing `?event=<opaque-event-id>` state. It
must preserve the selected section as `events` and must not derive the identifier from an account,
score, ledger, or array index. Browser Back/Forward restores the previous list/detail state.

## State and copy contract

| State | Required behavior and representative copy |
| --- | --- |
| Loading | Keep the requested section visible and announce `Loading dashboard section`. Do not show fabricated values. |
| Empty | Preserve the section URL and show an explicit empty message such as `No flag events yet`. |
| Success | Render the response fields with their source meaning intact; label scores as signals, not findings. |
| Stale/degraded | Keep previously loaded events visible, announce `Feed delayed`, and provide a retry action. |
| Unavailable | Show `Feed unavailable`, explain that the source could not be checked, and provide retry. |
| Unknown deep link | Keep the URL, show `Event unavailable`, and provide `Back to events` and `Refresh events`. |
| Recovery | Retry the same request/cursor, replace the failed state on success, and retain valid loaded data. |

Optional response fields remain optional for older backend deployments. Missing network context
disables explorer links rather than inventing a network. A failed older-page request must not clear
events already loaded from earlier pages.

## Focus, keyboard, and responsive behavior

- Navigation links and retry/back controls are native keyboard-focusable controls with visible focus.
- Activating a section moves focus to that section heading or landmark after navigation.
- Opening an event detail moves focus to the detail heading; closing it returns focus to the
  activating `View details` control when it still exists.
- `role="status"` or `role="alert"` announces loading, stale, unavailable, retry, and unknown
  event states without relying on color alone.
- Keyboard order is navigation → section content → recovery actions. No behavior is mouse-only.
- At narrow widths, navigation and recovery controls wrap without horizontal scrolling; long opaque
  IDs wrap safely. `prefers-reduced-motion` changes smooth scrolling to immediate scrolling.

## Mocked examples

Successful section selection:

```text
/?section=events
```

Unavailable event detail:

```json
{
  "detail": "Event not found",
  "event": "<opaque-event-id>"
}
```

Examples are documentation-only. Do not add real accounts, personal data, secrets, private keys,
or tokens to fixtures, screenshots, URLs, or telemetry.

## Review checklist

- [ ] Section URLs reload and share without exposing sensitive data.
- [ ] Back/Forward, refresh, unknown section, and unknown event behavior are explicit.
- [ ] Loading, empty, success, stale, unavailable, retry, and recovery copy is covered.
- [ ] Focus restoration, keyboard-only navigation, live announcements, and narrow layouts are covered.
- [ ] On-chain facts, backend observations, and heuristic signals remain distinct.
