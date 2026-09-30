# Experiment 097 — Failure-Mode-Conditioned Dependency

## Purpose
E096 showed that a global provenance graph can connect observers through several dependency layers. E097 asks whether that connectivity is relevant to a particular failure mode.

## Failure modes
SCALE_BIAS -> CALIBRATION roots are critical.
TRANSFORM_BUG -> SOFTWARE roots are critical.
LABEL_LEAKAGE -> LABEL_SOURCE roots are critical.

A global path is not automatically a pathway for every failure mode.

## Rule
Independence claims must be conditioned on the failure mechanism being evaluated. Report both global connectivity and failure-mode-conditioned connectivity.
