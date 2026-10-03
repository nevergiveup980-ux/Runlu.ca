# E056 — Consensus Depth Policy

Report:
- each model family's action;
- consensus action, if any;
- consensus depth (for example 3/3 or 2/3);
- each model's distance to its own flip boundary where meaningful.

Never report 3/3 as "100% confidence" or 2/3 as "67% probability".

A model family should be included because it has plausible operational semantics, not to manufacture agreement.

## Important correction discipline
Analytical constants must be checked by executable self-test. For the declared linear model the exact flip is L*=77.

## Next drill — E057
Attack model-set selection itself.

Ask:
- Why these three model families?
- Could adding/removing a plausible family change consensus depth?
- What admission criteria should a memory model satisfy before it gets a vote?

Define a pre-registered model-admission gate based on operational interpretability, causal timing semantics, parameter identifiability, and falsifiability. This prevents "model shopping" for a desired consensus.
