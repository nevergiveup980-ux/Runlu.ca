# Experiment 094 — Shared Bias Provenance

## Purpose
E093 separated reliability from validity. E094 asks whether agreement among observers/sensors is genuinely independent or inherited from a common calibration/training/reference root.

## Measurement model
For observer i:
Y_i = T + B_shared(root_i) + B_i + epsilon_i

Agreement can be high when epsilon is small even if B_shared is large.

## Provenance classes
SEPARATE_ROOTS — observers trace to distinct declared calibration/reference roots.
SHARED_CALIBRATION_ROOT — observers share a calibration ancestor.
SHARED_LABEL_ROOT — observers/models share a training/label ancestor.
MIXED_DEPENDENCE — some roots are shared and some are separate.

## Rule
Observer count is not independent-evidence count when observers inherit a common systematic bias source.
