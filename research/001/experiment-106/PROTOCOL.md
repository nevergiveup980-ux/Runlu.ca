# Experiment 106 — Conflict Decomposition Audit

## Purpose
E105 preserved disagreement among strong boundary-evidence channels. E106 asks whether that disagreement is a true contradiction or an artifact of pooling evidence from different contexts.

## Synthetic fixture
Three strong, current, bound, relevant observations:
- ARCHITECTURE -> depth 2 for SOFTWARE_FAULT / SHORT / NORMAL
- REPRODUCIBLE_PROPAGATION -> depth 3 for CALIBRATION_DRIFT / LONG / NORMAL
- EMPIRICAL_CANDIDATE -> depth 1 for SOFTWARE_FAULT / SHORT / SURGE

Unconditioned, the depths {1,2,3} conflict.

Conditioning on failure mode, timescale, and operating regime separates all three contexts, so there is no within-context contradiction.

A control fixture places two strong channels in the identical context but at depths 1 and 2; that remains a true within-context conflict.

## Principle
Decomposition is allowed only on dimensions declared independently of the observed verdict. Post-hoc slicing can manufacture agreement just as post-hoc pooling can manufacture conflict.
