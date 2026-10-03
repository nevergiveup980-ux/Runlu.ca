# Experiment 089 — Verifier Version Audit

## Purpose
E088 bound provenance evidence to the artifact actually used. E089 audits the verifier itself.

A correct digest binding does not prove that the rule used to accept the artifact was correct.

## Verification tuple
- verifier_id
- verifier_version
- ruleset_version
- artifact_digest
- observed_output
- expected_output
- verification_time

## Status
CURRENT_VERIFIER: historical acceptance is reproduced by the current approved verifier.
VERIFIER_OBSOLETE: the historical verifier accepted evidence that the corrected/current verifier rejects.
RULESET_CHANGED: both executions are internally valid but answer different declared rules.
UNREPRODUCIBLE_VERIFICATION: historical verification lacks enough verifier/ruleset/output metadata to replay.

A verifier correction may invalidate an earlier acceptance without changing the underlying artifact.
