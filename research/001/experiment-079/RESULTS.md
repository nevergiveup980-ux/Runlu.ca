# E079 — Constraint Fragility Margin Result

E079 stress-tests a declared synthetic dependence model rather than treating it as exact.

For each target weight w in [0.46,0.54], nominal subgroup effects are defined by preregistered functions dE0(w) and dH0(w).

Both are then relaxed symmetrically by epsilon.

Because both subgroup-effect intervals expand by the same +/- epsilon, the overall contrast interval expands by exactly +/- epsilon:

D_epsilon(w) = D_0(w) +/- epsilon.

Therefore the first possible zero occurs when epsilon equals the minimum nominal contrast over the target range.

The executable computes this value directly and checks four states:

- epsilon = 0: ROBUST_A;
- epsilon = epsilon*/2: ROBUST_A;
- epsilon = epsilon*: BOUNDARY_TOUCHING;
- epsilon > epsilon*: SIGN_UNRESOLVED.

## Core result

A dependence-based robustness claim should carry a fragility margin for the dependence assumption itself.

"Robust under the assumed constraint" is materially weaker than "robust under plausible misspecification."

The margin is conditional on the chosen misspecification model; it is not a universal error tolerance.

## Boundary

All functions and tolerances in E079 are synthetic. No warehouse dependence relation or misspecification distribution has been estimated.
