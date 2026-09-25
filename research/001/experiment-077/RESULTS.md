# E077 — Joint Effect-and-Target Uncertainty Result

The audit evaluates all eight corners of each rectangular uncertainty set for:

D(w,dE,dH) = w*dE + (1-w)*dH.

No favorable corner is selected.

ROBUST_A_BOX remains strictly positive over its full box.

ROBUST_B_BOX remains strictly negative over its full box.

MIXED_BOX spans negative and positive contrasts and is SIGN_UNRESOLVED.

A deliberately instructive case is TARGET_ONLY_LOOKS_A:

dE in [0.08,0.12]
dH in [-0.12,-0.08]
w in [0.54,0.58].

A point-style reading of a relatively EASY-heavy target may suggest A. But once the declared uncertainty in both subgroup effects is respected, the box contains both signs.

Result: SIGN_UNRESOLVED.

## Core result

Uncertainty dimensions interact.

A comparison that looks directionally stable when target composition is considered alone can lose that stability when subgroup-effect uncertainty is propagated jointly.

Robustness therefore belongs to the full declared uncertainty set, not to separate one-variable-at-a-time checks.

## Boundary

These intervals are synthetic audit fixtures, not estimated warehouse uncertainty intervals.
