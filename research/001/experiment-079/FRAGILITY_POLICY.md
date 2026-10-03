# E079 — Constraint Fragility Policy

For any conclusion upgraded by a dependence constraint:

1. State the nominal constraint.
2. Define an interpretable relaxation family before inspecting the desired result.
3. Compute the smallest relaxation that changes the qualitative conclusion when tractable.
4. Report that threshold as a conditional fragility margin.
5. Do not call epsilon* a confidence level or probability.
6. Test alternative relaxation families when the choice of misspecification geometry is consequential.

A large margin under one convenient relaxation model does not prove general robustness.

## Next drill — E080
Attack misspecification geometry.

E079 uses a common symmetric +/- epsilon band. Compare several preregistered perturbation geometries:
- common additive band;
- stratum-specific additive bands;
- relative multiplicative error;
- target-weight perturbation plus effect perturbation.

Question: does the claimed fragility margin survive reasonable changes in how model error is represented?
