# Signal explanation cards: UI and operational contract

This contract covers the `signals` array returned by `POST /risk/score`. The
dashboard uses it to explain a heuristic score for review; it is not proof of
fraud, compliance status, or intent.

## Response boundary

Each usable item has a non-empty `label`. The following fields are optional:

```ts
type Signal = {
  id?: string;
  label: string;
  value?: string | number;
  severity?: "high" | "medium" | "low" | "info";
  points?: number;
  explanation?: string;
  source?: string;
  observed_at?: string;
  window?: string;
};
```

The frontend bounds text and the number of items, drops rows without a label,
and treats unknown severity values as `info`. Missing values stay unavailable:
the card may show `—`, `0`, or a documented fallback label where appropriate;
it must not invent observations, timestamps, points, or account data. A missing
or malformed `signals` array produces the explicit empty state, not placeholder
production data.

## UI contract

The assessment section renders one explanation row per normalized signal with:

- signal label and severity indicator;
- observed value;
- severity and points;
- “Why it matters” from `explanation`, then `source`, then the explicit
  “Observed account activity” fallback;
- the observation window, or “Recent activity” when it is absent.

Severity filtering and ordering must remain keyboard reachable and must expose
the visible count. The table must remain horizontally usable at narrow widths,
retain visible focus states, and keep explanatory text wrapped rather than
silently clipping it. Copy must distinguish observed activity from heuristic
interpretation and on-chain facts.

## Degraded and unavailable states

- No usable rows: “No notable signals were returned for this assessment.”
- Rows exist but the selected filter matches none: “No signals match this
  severity.”
- A failed refresh after a successful assessment keeps the last assessment
  visible and reports the request error above it.
- A malformed optional field is omitted or replaced by the documented fallback;
  it must not break the assessment or render an object/secret in the page.

## Operations and validation

Use placeholder fixtures only in automated tests and previews. Do not add live
Horizon, Soroban, account, token, or personal-account data to fixtures.

For a release or preview, verify the mocked `POST /risk/score` response, the
empty and malformed optional-field states, severity filter/order, keyboard
operation, narrow viewport wrapping, and retry/error copy. Run `npm test`,
`npm run lint`, and `npm run build`; the CI workflow repeats lint and build.
Coordinate changes to this response shape with the backend issue before
promotion, and record the deployed commit and API origin for rollback.
