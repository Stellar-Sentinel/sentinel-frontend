# Accessible interactive controls

Interactive dashboard controls must remain understandable and usable without
pointer input or visual styling.

- Every input has an associated label or explicit accessible name, and related
  validation text is associated with the control.
- Buttons and links follow DOM order, expose their state, and retain visible
  `:focus-visible` styling.
- Icon-only controls have a meaningful accessible name and a 44 CSS pixel
  target on coarse pointers.
- Loading and retry controls communicate disabled/busy state without removing
  the surrounding context.
- Dynamic loading, empty, stale, degraded, error, and recovery messages are
  announced once through the affected region; unchanged messages are not
  repeatedly announced.
- Reduced-motion users receive instant scrolling and no required animation.
- Long identifiers and error copy wrap without hiding controls or causing
  page-level horizontal overflow.

Use placeholder fixture values only. Accessibility examples must not contain
credentials, private keys, real accounts, or production event identifiers.
