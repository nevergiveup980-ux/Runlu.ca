# Experiment 063 — Claim Scope Graph

## Purpose
E062 showed that a narrow methodological claim can be robust while broader operational relevance remains unresolved. E063 makes scope expansion explicit.

## Claim levels
L0 ANALYTIC
A theorem, identity, impossibility result, or exact property inside a declared mathematical model.

L1 SYNTHETIC
A result reproduced in a declared synthetic simulator or fixture.

L2 OBSERVATIONAL
A relationship calibrated or validated against representative read-only operational observations.

L3 OPERATIONAL
A decision rule shown to improve a declared operational objective under controlled, non-production evaluation while respecting the safety architecture.

L4 PRODUCTION_SAFETY
A production deployment claim involving real control behavior and safety assurance.

## Evidence edges
A higher level does not inherit validity automatically from a lower one.

L0 -> L1 requires executable reproduction and scenario/model correspondence.
L1 -> L2 requires validated telemetry semantics, sampling/coverage audit, uncertainty analysis, and representative observations.
L2 -> L3 requires prospective or controlled operational evaluation, declared comparator, objective, failure handling, and safety separation.
L3 -> L4 requires a separate production safety case, hazard analysis, authority/ownership, validation, monitoring, rollback/recovery, and deployment governance.

## Rule
A claim may be stated only up to the highest level whose incoming evidence edge is satisfied.
