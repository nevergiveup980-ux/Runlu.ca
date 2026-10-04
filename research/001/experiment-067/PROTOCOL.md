# Experiment 067 — Orphan Claim Audit

## Purpose
E066 preserved scope through known parent-child claim transformations. E067 audits broken provenance.

## Failure classes
ORPHAN:
claim has no resolvable parent/source.

MISSING_PARENT:
a parent ID is declared but absent from the registry.

STALE_PARENT:
claim was reviewed against an older parent version than the current evidence-bearing source.

UNREVIEWED_MUTATION:
claim text changed after its last approved review hash/version.

VALID_LINEAGE:
parent exists, reviewed parent version matches, and text is the reviewed text.

## Principle
A public claim is not provenance-valid merely because its wording sounds cautious.

Traceability requires an exact evidence-bearing source version and a review state for the actual published text.
