# E058 — Admission-Uncertainty Result

At the declared synthetic parameter point, the three E057 core models all vote A.

Two additional candidate families are marked UNRESOLVED:
- BOUNDED_HYPERBOLIC_DECAY votes B if eventually admitted;
- TWO_STAGE_RECENCY votes A if eventually admitted.

With two unresolved candidates there are 2^2 = 4 admissible model-set completions.

The executable checks all four:
1. neither admitted;
2. only hyperbolic admitted;
3. only two-stage admitted;
4. both admitted.

In every completion, A remains the directional consensus.

Therefore this fixture is:

SET_ROBUST with stable consensus A.

The vote depth changes across completions, so the numerical fraction agreeing is not stable even though the directional conclusion is.

## Important limitation
This is a constructed audit fixture, not evidence that future real model-admission disputes will be harmless.

If an unresolved set can change A to B or remove directional consensus, the correct label is SET_SENSITIVE.
