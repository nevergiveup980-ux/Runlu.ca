# Experiment 099 — Interaction-Model Multiplicity Audit

## Purpose
E098 admitted justified interaction mechanisms. E099 tests the next governance risk: model shopping.

When several interaction models are scientifically admissible, selecting only the model that produces a preferred conclusion can manufacture apparent robustness or dependence.

## Fixed synthetic fixture
Four admitted models evaluate the same source pair AB:
- M1 SOFTWARE_ONLY -> DEPENDENT
- M2 CALIBRATION_ONLY -> SEPARATE
- M3 SOFTWARE_AND_CALIBRATION -> SEPARATE
- M4 CROSS_LAYER_K9 -> DEPENDENT

A fifth model, M5 LABEL_ONLY, is considered but has no admission basis and is excluded before conclusion aggregation.

## Decision rule
The admitted family is fixed before reading the aggregate verdict.

Family verdict:
- STABLE_DEPENDENT: every admitted model says DEPENDENT.
- STABLE_SEPARATE: every admitted model says SEPARATE.
- MODEL_SENSITIVE: admitted models disagree.
- UNRESOLVED_FAMILY: admission itself is unresolved.

No majority vote converts model disagreement into scientific certainty.
