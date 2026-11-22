# Screening form flow contract

The account screening form keeps the last successful assessment visible when a later request fails. The request body contains only the trimmed account address, and invalid input is rejected before a request is made.

The form allows one screening request at a time. A second submission while the first is pending is ignored, and the pending state is cleared on both success and failure so the user can retry. Recent successful assessments are deduplicated by address and bounded to five entries.

Backend signal rows are treated as optional data: rows without a string `label` are ignored, optional fields with unexpected types are omitted, and the rendered signal list is bounded before display. This keeps degraded responses explicit without fabricating values.

The deterministic coverage for these rules is in `test/screening-flow.test.ts`. It uses no live Horizon, Soroban, or backend calls. For manual review, verify the narrow layout and keyboard path: focus the address field, submit an invalid value, correct it, submit once, and confirm that a failed retry leaves the previous result visible.
