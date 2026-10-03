# Experiment 053 — Fairness Memory Horizon

## Purpose
Determine how the accounting horizon changes fairness debt even when the current operating state is identical.

E052 established that fairness depends on denominator semantics. E053 holds the denominator fixed and attacks the memory rule.

## Memory models
M1 CUMULATIVE_SESSION:
all signed fairness increments since session start receive weight 1.

M2 ROLLING_W:
only increments whose age is <= W are retained.

M3 EXP_DECAY_H:
an increment of age t receives weight 2^(-t/H), where H is the declared half-life.

## Signed fairness increment
For this structural audit, each historical accounting event contributes a signed scalar d:
- d > 0: past accounting favored A;
- d < 0: past accounting favored B.

Debt > 0 therefore suggests a corrective preference toward B; debt < 0 suggests A.

The signed increments are abstract accounting residuals, not physical safety commands.

## Question
Can the same event history imply opposite corrective actions under plausible memory horizons?

If yes, accounting horizon is part of fairness semantics, not a harmless implementation detail.
