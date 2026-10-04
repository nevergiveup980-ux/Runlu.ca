# Experiment 057 — Model Admission Gate

## Purpose
E056 showed that consensus depth depends on which model families are admitted. E057 prevents result-driven model shopping by defining admission criteria before consensus is counted.

## Admission criteria
A candidate memory model receives a vote only if it passes all mandatory gates:

G1 OPERATIONAL INTERPRETABILITY
The memory rule has a plausible operational meaning, not merely a convenient curve.

G2 CAUSAL TIMING
Weights depend only on information available at decision time. No future leakage.

G3 PARAMETER SEMANTICS
Every free parameter has a declared meaning and unit/boundary interpretation.

G4 IDENTIFIABILITY / ESTIMABILITY
There is a stated observational or policy route by which the parameter could be fixed, bounded, or deliberately declared. A free knob chosen after seeing the desired action fails.

G5 FALSIFIABILITY
The model makes at least one observable or decision-level claim that could disagree with data or operational semantics.

G6 OBJECTIVE COMPATIBILITY
The model is being used for the same declared fairness objective, denominator, and lifecycle semantics as the other voters.

G7 PRE-RESULT REGISTRATION
Admission rationale and parameter domain are recorded before using the model to alter consensus depth.

## Decision
PASS only if all mandatory gates pass.

A failed candidate may still be shown as a sensitivity probe, but it does not receive a consensus vote.
