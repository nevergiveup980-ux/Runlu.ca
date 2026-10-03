# E057 — Structural Result

The admission gate was applied to five declared candidates.

Admitted:
- ROLLING_WINDOW;
- EXPONENTIAL_DECAY;
- LINEAR_TO_ZERO.

Excluded from consensus voting:
- POST_HOC_POLYNOMIAL, because it lacks operational interpretation/parameter semantics, is not independently fixed, and is post-result;
- FUTURE_AWARE_WEIGHT, because it leaks future information and lacks an admissible estimation route.

The important result is not that the original three models are universally correct. It is that consensus depth now has a declared denominator:

consensus depth = agreeing admitted models / total admitted models.

A sensitivity model can still be shown without being granted a vote.

## Anti-model-shopping rule

Do not add, remove, or retune a model because its vote helps or hurts the desired consensus.

A new family can enter a later version only with:
1. an admission record;
2. a declared parameter domain;
3. a reason independent of its eventual vote;
4. a version bump to the model set.

This turns model-set composition into auditable research state.
