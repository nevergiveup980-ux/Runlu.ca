# E075 — Target Population Policy

When effect heterogeneity is present:

1. Report the subgroup-specific effects.
2. Declare the target population before using it to produce an overall standardized contrast.
3. Publish the target weights with the result.
4. If a direction-flip boundary exists, report it.
5. Do not describe the overall result as population-independent.
6. Do not choose weights to manufacture a preferred direction.

A target population is part of the estimand, not cosmetic presentation metadata.

## Next drill — E076
Attack target-weight uncertainty.

A real target mix is often estimated rather than known exactly.

Represent w as an interval [w_low,w_high] rather than a point estimate.

Classify:
- ROBUST_A if the entire interval lies above w*;
- ROBUST_B if the entire interval lies below w*;
- BOUNDARY_CROSSING if the interval contains w*.

Question: when should uncertainty in the target population force the overall comparative conclusion to remain unresolved?
