# Experiment 098 — Interaction Failure Mechanisms

## Purpose
E097 conditioned provenance dependency on one failure mode at a time. E098 tests a harder case: a failure may require a combination of provenance conditions.

A source can be harmless with respect to SOFTWARE alone and harmless with respect to CALIBRATION alone, while the joint condition SOFTWARE AND CALIBRATION creates a relevant pathway.

## Mechanisms
- SOFTWARE_ONLY: shared SOFTWARE root.
- CALIBRATION_ONLY: shared CALIBRATION root.
- SOFTWARE_AND_CALIBRATION: both roots must match for the pair.
- SOFTWARE_OR_LABEL: either SOFTWARE or LABEL_SOURCE may transmit the modeled failure.
- CROSS_LAYER_INTERACTION: source A's SOFTWARE root equals source B's CALIBRATION-compatible bridge token, or vice versa.

## Rule
Do not infer interaction-failure independence from marginal layer independence.

All fixtures are synthetic governance models. They do not establish an empirical warehouse failure mechanism.
