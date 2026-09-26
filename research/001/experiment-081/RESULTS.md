# E081 — Outcome-Normalized Stress Result

E081 does not compare epsilon to rho.

Instead it declares a common consequence:

b = maximum allowed reduction in the overall contrast D.

For each geometry, the audit computes the native perturbation parameter needed to produce the same outcome impact b at the nominal worst-case target weight.

Therefore common additive, EASY-only additive, HARD-only additive, and relative multiplicative stress can require different native parameter values while representing the same declared reduction in D.

Three outcome budgets are tested:

- half of the nominal minimum contrast -> ROBUST_A;
- exactly the nominal minimum contrast -> BOUNDARY_TOUCHING;
- 1.25 times the nominal minimum contrast -> SIGN_UNRESOLVED.

## Core result

Outcome normalization separates two questions:

1. How is model error parameterized?
2. How much damage to the decision-relevant contrast is being compared?

This avoids ranking stress geometries by incomparable raw parameter magnitudes.

However, outcome normalization does not make the geometries scientifically equivalent. Their plausibility and admissible perturbation sets still require independent justification.

## Boundary

All models and budgets are synthetic. No operational warehouse stress budget is established.
