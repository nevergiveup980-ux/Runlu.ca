# Experiment 002 — Matched Action Budget Results

Specification: 100,000 paired synthetic trials; seed 20260920; observation accuracy 0.72; safe-state prevalence 0.65; gate probability 0.70.

| Policy | GO rate | Disagreement | Unsafe | Success | Deadlock |
|---|---:|---:|---:|---:|---:|
| Matched-independent | 0.396235 | 0.43785 | 0.12433 | 0.16395 | 0.15901 |
| Classical correlation | 0.396090 | 0.28312 | 0.11808 | 0.23515 | 0.23027 |

The marginal GO rates are essentially matched. Under this model, sharing the classical gate changes joint behavior: disagreement is lower and successful joint action is higher, while unsafe action is modestly lower. Deadlock is also higher because the shared gate synchronizes STOP as well as GO.

## Interpretation
This is stronger evidence than Experiment 001 that the observed difference is not explained only by acting less often. It still does not validate the general headline hypothesis: the result may depend on the chosen task structure, observation model, gate probability, and metric definitions.

## Next tests
1. Sweep gate probability and observation accuracy.
2. Add anti-correlated/complementary-action tasks where GO/GO itself can be dangerous.
3. Add deterministic role-assignment and optimized classical policies.
4. Hold out scenario distributions to test robustness.
5. Keep all Warehouse OS data synthetic/read-only until these controls survive.
