# Experiment 088 — Provenance Evidence Freshness

## Purpose
E087 graded the evidence supporting provenance edges. E088 asks whether previously verified evidence still matches the artifacts used by the experiment.

## Binding tuple
Every VERIFIED_ARTIFACT edge should bind:
- artifact_id
- artifact_version
- artifact_digest
- verified_at
- experiment_executed_at
- executed_artifact_version
- executed_artifact_digest

## Status
CURRENT_VERIFICATION: verified version/digest equals executed version/digest.
STALE_VERIFICATION: verification is for an older/different artifact than execution.
FUTURE_VERIFICATION: evidence was verified after the claimed execution and therefore cannot establish what was used at execution time without additional immutable records.
MISSING_BINDING: version/digest/time binding is incomplete.

Freshness is identity/version consistency, not merely elapsed clock time.
