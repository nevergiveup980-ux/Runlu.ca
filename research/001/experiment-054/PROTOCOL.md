# Experiment 054 — Horizon Robustness Intervals

## Purpose
Replace a single arbitrary fairness-memory parameter with an explicit map of where the corrective decision is invariant and where it flips.

E053 showed that the same history can imply opposite corrections under different memory horizons. E054 characterizes those flip boundaries.

## Models
Rolling window W:
debt(W) = sum of d_i for events with age_i <= W.

Exponential half-life H:
debt(H) = sum_i d_i * 2^(-age_i/H).

Decision:
- debt > 0 -> corrective preference B;
- debt < 0 -> corrective preference A;
- debt = 0 -> tie.

## Output
For a declared event history:
- exact rolling-window intervals between event ages;
- exact debt and decision on each interval;
- numerical exponential sweep;
- bisection-refined exponential decision-flip roots;
- robustness intervals between roots.

The numerical root is a model result, not an operationally calibrated time constant.
