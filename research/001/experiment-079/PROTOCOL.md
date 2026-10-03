# Experiment 079 — Constraint Fragility Margin

## Purpose
E078 showed that a dependence constraint can change a robustness conclusion, but the constraint itself needs justification. E079 asks how much misspecification that conclusion can survive.

## Synthetic constrained model
w in [0.46,0.54].

Nominal dependence:
dE0(w) = 0.10 + 0.20(w-0.50)
dH0(w) = 0.02 + 0.10(w-0.50)

Both nominal subgroup effects are positive over the declared target range.

Misspecification band epsilon:
dE in [dE0(w)-epsilon, dE0(w)+epsilon]
dH in [dH0(w)-epsilon, dH0(w)+epsilon].

Overall contrast:
D = w*dE + (1-w)*dH.

## Fragility margin
epsilon* is the smallest nonnegative relaxation for which the admissible set reaches D <= 0.

The executable derives epsilon* from the nominal minimum contrast and verifies it numerically.

This is a synthetic assumption-stress test, not an empirical tolerance estimate.
