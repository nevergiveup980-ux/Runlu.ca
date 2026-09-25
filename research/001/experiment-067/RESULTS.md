# E067 — Orphan Claim Audit Result

The fixture tests five derived-claim conditions.

GOOD:
parent resolves, reviewed parent version equals the current source version, and the published text matches its reviewed hash.
Result: VALID_LINEAGE.

STALE:
the source claim is now version 3, but the child was reviewed against version 2.
Result: STALE_PARENT.

MUTATED:
the parent is current, but the published sentence differs from the sentence that was reviewed.
Result: UNREVIEWED_MUTATION.

MISSING:
the claim names a parent ID that does not exist in the registry.
Result: MISSING_PARENT.

ORPHAN:
the public claim has no parent/source reference.
Result: ORPHAN.

## Core result

Provenance validity is version-specific and text-specific.

A claim cannot inherit approval forever merely because an earlier version of its parent was reviewed.

Likewise, changing a few words after review can alter scope and therefore requires re-review.

## Boundary

This is a synthetic provenance-control fixture, not evidence of real warehouse performance.
