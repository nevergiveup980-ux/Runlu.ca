# E053 — Structural Results

Use the same current operating state and the same two historical fairness residuals:

- old event, age 50: +8 (past favored A);
- recent event, age 5: -3 (recently favored B).

Positive debt implies corrective preference toward B; negative debt toward A.

Results:

| Memory rule | Debt | Corrective preference |
|---|---:|---|
| cumulative session | +5 | B |
| rolling window W=10 | -3 | A |
| rolling window W=60 | +5 | B |
| exponential half-life H=5 | approximately -1.494 | A |
| exponential half-life H=100 | approximately +2.359 | B |

The action reverses solely because the memory rule changes.

Therefore the fairness horizon is part of objective semantics.

## Lifecycle result
Cumulative-since-session accounting also requires a session-boundary definition. Resetting a session clears debt by definition, so session identity/recovery semantics affect fairness state just as they affected freshness state in E015–E017.

## No universal horizon
E053 does not establish that rolling, decay, or cumulative memory is best. The correct horizon depends on what operational unfairness is intended to mean and how long historical imbalance should remain decision-relevant.
