# Experiment 083 — Metric Dependency Graph

## Purpose
E082 protected multiple outcome dimensions from scalar masking. E083 prevents the opposite error: counting correlated or mathematically related metrics as independent confirmations.

## Metric classes
- DISTRIBUTION_SUMMARY: MEAN_LOSS, TAIL95_LOSS, WORST_LOSS
- DISTINCT_OBJECTIVE: FAIRNESS_GAP
- PROTECTED_CONSTRAINT: SAFETY_ENVELOPE_VIOLATION

## Dependency types
SAME_SOURCE: metrics summarize the same underlying loss sample.
MATHEMATICALLY_ORDERED: e.g. for a finite loss sample, maximum loss is at least a lower quantile.
DISTINCT_OBJECTIVE: different normative/operational target.
PROTECTED: cannot be traded against efficiency evidence.

## Rule
Multiple passing summaries from the same dependency family do not become multiple independent votes for robustness.
