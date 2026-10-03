# E078 — Dependence Policy

Every non-Cartesian uncertainty set must record:

- constraint ID and version;
- mathematical form;
- variables constrained;
- origin of the constraint;
- whether preregistered;
- empirical/physical/theoretical justification;
- sensitivity to relaxing the constraint;
- downstream claims that depend on it.

Never remove an adverse region merely because it worsens the conclusion.

If dependence is unknown, report the Cartesian result or explicitly label the result conditional on an assumed dependence model.

A constraint that is mathematically convenient but scientifically unsupported cannot upgrade a robustness claim.

## Next drill — E079
Attack constraint fragility.

A justified dependence relation is rarely exact. Give the constraint a tolerance band epsilon and expand it gradually.

Track the first epsilon at which the sign becomes unresolved.

This creates a robustness margin for the dependence assumption itself:
epsilon* = smallest relaxation that changes the conclusion.

Question: how much misspecification can a dependence-based conclusion survive?
