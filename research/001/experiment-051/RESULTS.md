# E051 — Structural Results

## Result 1 — Snapshot can be sufficient for a one-step objective and insufficient for a dynamic objective

Use identical current queue states:

A = [600, 300]
B = [600, 300]

Both sides have:
- count = 2;
- oldest = 600 seconds;
- cumulative wait = 900 seconds;
- overdue count at tau=600 = 1.

Every E050 snapshot statistic ties.

Now compare two histories.

H1:
- served_A = 9;
- served_B = 1;
- fairness balance D = +8.

H2:
- served_A = 1;
- served_B = 9;
- fairness balance D = -8.

For the narrow immediate fairness-restoration penalty |D'|:
- H1 prefers serving B;
- H2 prefers serving A.

The live queue snapshot is identical, but the dynamic-fairness action reverses.

Therefore E050 snapshot telemetry is not sufficient for this dynamic fairness objective.

## Result 2 — Raw service history is not always necessary

For this specific equal-share one-step fairness term, the full sequence of past actions is unnecessary.

The scalar:

D = served_A - served_B

contains the history information needed by the declared immediate fairness penalty.

This preserves the telemetry-minimization principle: collect/derive the smallest state sufficient for the chosen objective.

## Result 3 — No claim of universal dynamic sufficiency

The scalar D is not claimed sufficient for:
- unequal target shares;
- demand-normalized fairness;
- class/priority-specific fairness;
- future-arrival optimization;
- long-horizon stochastic control.

Those objectives require their own state-sufficiency analysis.
