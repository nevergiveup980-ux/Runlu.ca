# E106 — Conflict Decomposition Policy

When strong evidence channels disagree:

1. Preserve the pooled conflict.
2. Declare candidate conditioning dimensions independently of the verdict.
3. Partition by justified failure mode, timescale, operating regime, or scope.
4. Re-test agreement within each context.
5. If disagreement disappears, report CONTEXT_EXPLAINS_APPARENT_CONFLICT.
6. If disagreement remains within an identical context, report WITHIN_CONTEXT_CONFLICT.
7. If the conditioning rationale is weak or post-hoc, report CONDITIONING_JUSTIFICATION_UNRESOLVED.

Do not:
- create one context per observation merely to force agreement;
- erase the original pooled view;
- infer correctness from contextual agreement;
- assume all heterogeneity is scientifically meaningful.

## E107
Conditioning-granularity audit.

Even justified context variables can be sliced too coarsely or too finely. E107 should test whether the conflict classification is stable across defensible context resolutions.

Core:
Conditioning can clarify heterogeneity, but granularity can manufacture it.
