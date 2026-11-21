# UI regression matrix

The frontend currently has no test runner configured, so this matrix is the
deterministic fixture contract for the component/integration suite. Each row
must use mocked responses only and must not call a live Stellar or backend
service.

| Surface | Mocked scenario | Assertions |
| --- | --- | --- |
| Account form | loading, success, malformed optional signal, request failure | label is announced, facts remain distinct from heuristic interpretation, retry preserves the address |
| Event feed | empty, first page, next page, pagination failure | status is announced, rows remain keyboard reachable, retry does not duplicate rows |
| Network status | healthy, stale, degraded, unavailable, recovery | status copy and observed time are visible, recovery replaces the error without fabricated data |
| Navigation | keyboard tab order, hash section, reduced motion | focus is visible, the active section is stable, reduced motion avoids smooth scrolling |
| Responsive layout | 320px, 768px, 1280px viewports | no page-level horizontal scroll, long identifiers wrap, controls remain usable |

Optional fields should be omitted or replaced with explicit unavailable copy.
Fixtures must contain placeholder values rather than real account data, tokens,
private keys, or production event identifiers.
