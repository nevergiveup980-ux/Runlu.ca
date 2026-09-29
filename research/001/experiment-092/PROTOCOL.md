# Experiment 092 — Empirical Ground-Truth Chain Audit

## Purpose
E091 showed that a noncircular empirical oracle is only a candidate for ground truth. E092 audits the measurement chain between reality and the oracle.

## Chain
REALITY -> SENSOR_OR_OBSERVER -> CALIBRATION -> TEMPORAL_ALIGNMENT -> LABELING -> MISSINGNESS -> AGGREGATION -> ORACLE

## Gates
CALIBRATION_VALID
TEMPORALLY_ALIGNED
LABEL_INDEPENDENT
MISSINGNESS_ACCEPTABLE
REPRESENTATIVE_FOR_SCOPE

## Status
EMPIRICAL_ORACLE_CANDIDATE: all declared gates pass.
MEASUREMENT_CHAIN_REVIEW: one or more noncritical/uncertain gates require review.
GROUND_TRUTH_NOT_ESTABLISHED: a critical gate fails.

Passing E092 still does not make measurement infallible; it means the declared chain has survived this audit.
