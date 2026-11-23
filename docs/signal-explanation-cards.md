# Signal explanation card contract

Signal cards explain the observations behind a heuristic score. They must not
present a signal as proof of fraud, compliance status, or intent.

## Normalized fields

```ts
type SignalCard = {
  id?: string;
  label: string;
  observed_value?: string | number | null;
  severity?: "high" | "medium" | "low" | "info";
  weight?: number | null;
  explanation?: string;
  observed_at?: string;
  policy_version?: string;
  missing_data?: boolean;
};
```

All fields other than `label` are optional. Missing values render as
`Unavailable`, never as zero or fabricated sample data. A partial response is
labelled `Some evidence is unavailable.` and still shows the facts that were
returned.

## States and interaction

- Loading: announce `Loading assessment signals` without blocking navigation.
- Empty: show `No explanatory signals were returned.`
- Success: show label, observed value, severity, weight when supplied, and the
  explanation separately from the aggregate score.
- Stale/degraded: show the observation time and a visible partial-data caveat.
- Error/unavailable: show `Signal explanations are temporarily unavailable.`
  Keep the aggregate score and provide a retry action when possible.

Cards are keyboard reachable, expose severity and value as text, and do not
use color as the only distinction. At narrow widths they become one column;
long values wrap. Mocked payloads must contain placeholders such as
`<signal-id>` and `<subject-account>`, never real addresses or secrets.
