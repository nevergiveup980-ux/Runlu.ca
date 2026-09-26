# Experiment 024 — Native State-Sensitive Blind-Corner Task

## Purpose
Repair E023's weak objective by adding a physically interpretable state-sensitive variable before any nonclassical analysis.

## Native interpretation
Each mover has a private local **stopping-margin state**:
- 0 = COMFORTABLE: enough local margin to yield safely.
- 1 = TIGHT: yielding is locally less desirable because stopping margin is reduced.

This is an abstract operational proxy, not a calibrated safety model.

Each agent observes only its own state during the communication outage and chooses WAIT(0) or ENTER(1).

## Outcomes
Hard constraints/metrics:
- conflict: both ENTER;
- deadlock: both WAIT;
- progress: exactly one ENTER.

State-sensitive metric:
- tight-priority satisfaction: when exactly one mover is TIGHT, success requires that TIGHT mover ENTER and the COMFORTABLE mover WAIT.

Equal-state cases do not award or penalize tight-priority; they remain governed by conflict/deadlock/progress.

## Baselines
- always WAIT;
- fixed right-of-way;
- all 16 deterministic local policy pairs;
- arbitrary shared-classical mixtures (convex hull).

## Question
Does adding this native state-sensitive requirement create a meaningful tradeoff not already solved by fixed role, and if so, what is the exact classical attainable frontier?

No Bell/XOR reward is permitted.
