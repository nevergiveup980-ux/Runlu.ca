# E089 — Verifier Version Audit Result

E089 holds artifact identity fixed and changes the verification layer.

STABLE passes the historical and current verifier under the same ruleset:
CURRENT_VERIFIER.

BUG_FIXED was accepted by V1 but rejected by corrected V2 under the same R1 rules:
VERIFIER_OBSOLETE.

This is the key case. The artifact did not change. The checker did.

RULE_CHANGE moves from R1 to R2 and therefore receives RULESET_CHANGED rather than being mislabeled a verifier bug.

MISSING_META cannot reconstruct which verifier/rules produced the historical PASS:
UNREPRODUCIBLE_VERIFICATION.

## Core result

Verified provenance is conditional on both the artifact and the verification procedure.

Artifact digest equality cannot preserve an acceptance that depended on defective verifier logic.

Verifier fixes therefore require downstream impact propagation to claims that depended on the old acceptance.

## Scope

Synthetic governance fixture. E089 does not imply that an earlier RUNLU verifier is defective.
