# E050 — Telemetry Minimization Policy

Do not collect all temporal fields "just in case."

Choose the decision objective first, then collect the smallest aggregate statistic that is sufficient for that objective.

## Examples
For J_max:
- collect oldest_wait_seconds per side.

For J_sum:
- collect queue_wait_sum_seconds per side.
- oldest wait may be retained only if a separate tail-risk audit needs it.

For J_tau:
- collect overdue_count per side plus the versioned threshold tau.
- if multiple SLA thresholds are operationally required, prefer a small fixed age histogram over per-task ages.

## Privacy / isolation
No task IDs, customer names, employee names, or per-task timestamps are required by these snapshot objectives.

## Semantic versioning
The objective and threshold are part of message meaning.

An overdue count without its threshold is semantically incomplete.
Changing tau is a versioned semantic change, analogous to the codebook-version issue in E038.

## Next drill — E051
Test whether aggregate temporal statistics remain decision-sufficient when allocation has consequences over multiple future encounters.

A snapshot statistic can be sufficient for a one-step objective yet fail for a dynamic fairness/service objective.

E051 should compare:
- one-step J_sum;
- repeated service with arrivals;
- starvation/fairness measured across time.

This will determine whether Research 001B needs temporal state evolution or can remain snapshot-based.
