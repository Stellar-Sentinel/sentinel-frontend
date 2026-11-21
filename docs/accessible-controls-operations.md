# Accessible controls operations checklist

Use this checklist when reviewing interactive controls in a preview or
production deployment:

1. Tab through navigation, forms, event actions, retry buttons, and icon-only
   controls. Confirm visual focus and DOM order.
2. Trigger loading, empty, stale, degraded, error, retry, and recovery states.
   Confirm each affected region has concise accessible status text and that
   unchanged messages are not repeatedly announced.
3. Repeat at a narrow viewport and with a coarse pointer. Confirm controls do
   not overlap, targets remain usable, and long identifiers wrap.
4. Enable reduced motion and confirm navigation remains understandable without
   animation.
5. Inspect diagnostics and fixtures for credentials, private keys, cookies,
   real account data, and production event identifiers.

Instrumentation may record operation, status class, and duration only. It must
not capture control values, response bodies, URLs with secrets, or user data.
