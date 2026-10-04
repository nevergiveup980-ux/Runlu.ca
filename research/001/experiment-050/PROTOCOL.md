# Experiment 050 — Minimum Temporal Telemetry and Objective-Sufficient Summaries

## Purpose
Determine the minimum aggregate temporal information needed to evaluate waiting-time-sensitive allocation objectives without collecting order IDs, employee/customer data, or full task histories.

E050 asks a sufficiency question, not a prediction question:

**Which aggregate statistics preserve the decision implied by a declared temporal objective?**

## Candidate summaries
T0:
- queue count only.

T1:
- queue count;
- oldest_wait_seconds.

T2:
- queue count;
- oldest_wait_seconds;
- queue_wait_sum_seconds.

T3(tau):
- queue count;
- oldest_wait_seconds;
- queue_wait_sum_seconds;
- overdue_count at a declared threshold tau.

## Objectives
J_max:
serve the side with larger maximum waiting age.

J_sum:
serve the side with larger cumulative waiting burden, sum of waiting ages.

J_tau:
serve the side with more tasks whose waiting age is at least tau.

## Question
Is one generic temporal summary sufficient for all three objectives?

E050 uses exact counterexamples to answer this before adding any telemetry to production systems.
