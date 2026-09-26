# Experiment 039 — Reconfiguration Policy: Oracle, Robust Static, Hysteretic

## Purpose
Turn E038 encoding drift into a control problem.

Compare:
1. ORACLE: immediately use the workload-specific optimal codebook.
2. ROBUST STATIC: one 2-bit codebook chosen to minimize worst-case regret across the admitted synthetic workloads U/L/B.
3. HYSTERETIC: switch only when expected regret savings over a decision horizon exceed a declared switching/version-coordination cost.

No physical switching cost is assumed; E039 derives the decision rule symbolically.

## Robust objective
min_codebook max_w R(w,codebook)

over every contiguous 4-bucket partition of queues 0..15.

## Hysteretic rule
For current codebook c, candidate c', estimated workload w, horizon N and switching cost C_switch:

switch only if
N [R(w,c)-R(w,c')] > C_switch + uncertainty_margin.

The uncertainty margin prevents reconfiguration on noisy workload estimates.
