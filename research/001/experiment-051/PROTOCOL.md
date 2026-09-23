# Experiment 051 — Snapshot Sufficiency vs Dynamic Fairness State

## Purpose
Test whether E050's aggregate temporal snapshot can remain decision-sufficient when allocation is repeated over time.

E051 separates two questions:
1. Is the current queue snapshot sufficient for a one-step waiting objective?
2. Is it sufficient for a dynamic objective that also depends on service history or future evolution?

## Snapshot state
Use E050-style aggregates per side:
- queue count;
- oldest wait;
- cumulative wait;
- overdue count at a declared threshold.

## Dynamic fairness state
For a declared equal-share fairness objective, define a scalar service balance:

D = served_A - served_B.

A positive D means A has received more service opportunities than B; a negative D means B has received more.

For a one-step fairness-restoration term after serving A or B:
- serve A -> D' = D + 1;
- serve B -> D' = D - 1.

A simple fairness penalty is |D'|.

This is a deliberately narrow synthetic model. It is not a production scheduling policy.

## Main question
Can two histories have the same current queue snapshot but require opposite next actions under the dynamic fairness objective?

If yes, snapshot-only telemetry is insufficient for that objective.
