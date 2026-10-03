# E080 — Misspecification Geometry Result

E080 keeps the E079 nominal synthetic model fixed and changes only the perturbation geometry.

The common additive geometry reproduces the E079-style margin.

When only EASY or only HARD is perturbed, the raw additive epsilon required to reach zero differs because the perturbed stratum is weighted by w or 1-w rather than by one.

Under relative multiplicative perturbation, the critical parameter has different semantics and units from additive epsilon. In this positive-effect fixture, allowing both subgroup effects to shrink proportionally reaches zero at rho = 1.

## Core result

There is no geometry-free fragility margin.

A statement such as "the conclusion tolerates error up to epsilon*" is incomplete unless it also specifies:
- what quantity is perturbed;
- additive versus multiplicative form;
- whether perturbations are shared or stratum-specific;
- parameter units;
- admissible dependence among perturbations.

Different geometries can produce different critical values without any contradiction.

## Boundary

This is a synthetic stress test. It does not estimate real warehouse model error.
