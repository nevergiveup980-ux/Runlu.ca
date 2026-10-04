# Experiment 084 — Evidence Independence Graph

## Purpose
E083 showed that several metrics from one outcome family are not independent confirmations. E084 lifts the audit to experiment level.

## Evidence dimensions
Each experiment declares provenance for:
- SCENARIO_SET
- GENERATOR_OR_SIMULATOR
- RANDOMNESS_OR_ENUMERATION
- PREPROCESSING
- CORE_MODEL_ASSUMPTIONS
- DATA_ORIGIN
- IMPLEMENTATION

## Relation classes
- REANALYSIS: same evidence base, changed summary or metric.
- PARTIAL_REPLICATION: at least one important evidence-generating dimension changes, but major dependencies remain.
- INDEPENDENT_REPLICATION_CANDIDATE: independently generated evidence and implementation with no declared critical shared evidence path.
- CONCEPTUAL_ONLY: same synthetic source used to test a different methodological point.

Classification is provenance-based, not a probability of independence.
