# E076 — Target Uncertainty Policy

For a target-weight-dependent comparison:

1. Record the point estimate if available.
2. Record the justified uncertainty set separately.
3. Evaluate the full set against every known direction-flip boundary.
4. Use ROBUST_A or ROBUST_B only when the entire set lies strictly in one direction region.
5. Use BOUNDARY_CROSSING when the set spans opposite regions.
6. Preserve BOUNDARY_TOUCHING as a distinct edge case.
7. Do not shrink the interval merely to obtain a directional headline.

This is set robustness, not a probability statement.

## Next drill — E077
Attack joint uncertainty.

So far subgroup effects are fixed and only target weight is uncertain. In real analysis, both may be uncertain.

Represent:
d_easy in [dE_low,dE_high],
d_hard in [dH_low,dH_high],
w in [w_low,w_high].

Audit the full box for:
- ROBUST_A;
- ROBUST_B;
- SIGN_UNRESOLVED.

Question: can individually modest uncertainty in effects and target composition combine to destroy a seemingly stable headline?
