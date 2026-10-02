# Experiment 105 — Conflicting Boundary Evidence Audit

## Purpose
E104 graded evidence supporting a selected ancestry boundary. E105 tests the case where multiple strong, admissible evidence channels support different boundaries.

Strong evidence is not necessarily convergent evidence.

## Synthetic fixture
Three current, bound, mechanism-relevant channels:
- ARCHITECTURE: depth 2
- REPRODUCIBLE_PROPAGATION: depth 3
- EMPIRICAL_CANDIDATE: depth 1

A control fixture has all three channels supporting depth 2.

## Rule
Do not collapse disagreement by averaging depths, majority vote, or choosing the nominally strongest evidence label.

Classify the evidence set itself:
- BOUNDARY_CONVERGENT
- BOUNDARY_CONFLICT
- BOUNDARY_EVIDENCE_INCOMPLETE

A conflict requires explanation or scope partitioning, not arithmetic compromise.
