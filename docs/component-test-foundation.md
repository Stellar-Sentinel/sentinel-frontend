# Component test foundation

The frontend uses Node's built-in `node:test` runner with TypeScript's
`--experimental-strip-types` support. The first component-facing seam is the
pure event-feed state model in `app/event-feed-state.ts`.

Tests pass state and bounded, placeholder event fixtures directly to that
model. They do not call the backend, use real account identifiers, depend on
browser timers, or require a DOM. This keeps loading, empty, unavailable,
degraded/retry, and successful states deterministic while leaving browser
interaction tests available as a later, separately scoped milestone.

Run the foundation with:

```bash
npm test
```
