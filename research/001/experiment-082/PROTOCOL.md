# Experiment 082 — Multi-Metric Stress Vector

## Purpose
E081 normalized heterogeneous stress geometries on one scalar outcome, D. E082 tests whether a favorable scalar summary can hide adverse behavior in other preregistered outcomes.

## Synthetic outcomes
For each stress scenario report a vector:
- MEAN_LOSS: average efficiency loss;
- WORST_LOSS: worst-case efficiency loss;
- TAIL95_LOSS: upper-tail loss;
- FAIRNESS_GAP: allocation disparity.

Safety-envelope violations are intentionally excluded from scalar aggregation and remain separately governed.

## Decision rule
A scenario is VECTOR_ROBUST only when every preregistered metric stays within its declared bound.
If mean passes but any other metric fails: SCALAR_MASKING.
If multiple metrics fail: MULTI_METRIC_FAIL.

No weighted average may rescue a failed protected metric unless such aggregation was preregistered and scientifically justified.
