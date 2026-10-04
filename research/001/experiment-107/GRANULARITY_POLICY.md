# E107 — Conditioning Granularity Policy

For conditioned conflict claims:

1. Define a scientifically admissible set of context resolutions before inspecting the preferred verdict.
2. Report results across all admitted resolutions.
3. Mark GRANULARITY_SENSITIVE when conflict status changes.
4. Report context counts and singleton prevalence.
5. Reject identifiers or arbitrary partitions whose only function is to isolate observations.
6. Do not assume the finest or coarsest admissible resolution is correct.

Statuses:
- GRANULARITY_ROBUST
- GRANULARITY_SENSITIVE
- GRANULARITY_SET_UNRESOLVED
- OVERFIT_PARTITION_REJECTED

## E108
Condition-support adequacy audit.

Even a scientifically meaningful fine partition may leave too little evidence inside each context to support a conclusion. E108 should distinguish contextual specificity from evidential support.

Core:
A well-defined context can still be data-empty or evidence-thin.
