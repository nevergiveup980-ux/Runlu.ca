# Experiment 091 — Oracle Provenance & Circular Validation

## Purpose
E090 used an oracle fixture to expose shared-specification errors. E091 audits whether that oracle is actually independent of the specification it is supposed to test.

## Oracle provenance classes
DERIVED_FROM_SPEC — expected answer is computed/copied from the target specification.
INDEPENDENT_ANALYTIC — expected answer is derived independently from stated mathematics/logic.
EXTERNAL_REFERENCE — expected answer comes from a separately governed reference source.
EMPIRICAL_GROUND_TRUTH_CANDIDATE — expected answer comes from measured reality with declared measurement provenance; "candidate" because measurement can still be wrong.

## Circularity
For target specification S and oracle O, circular validation exists when provenance closure of O reaches S (directly or transitively), while O is used to validate S.

A circular oracle may be useful as a regression fixture, but not as independent validation of the specification.
