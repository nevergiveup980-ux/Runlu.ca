# E066 — Claim Provenance Policy

Every public-facing claim derived from research should point to a source claim ID.

Required lineage fields:
- claim_id;
- parent_claim_id;
- stage;
- evidence_scope;
- retained essential qualifiers;
- transformation purpose;
- review status.

## Invariant
A child claim may:
- shorten;
- simplify;
- remove technical detail that is not scope-critical.

A child claim may not:
- broaden scope;
- erase a qualifier whose removal changes the likely evidence interpretation;
- introduce deployment, safety, or real-operation implications without a new evidence edge.

## Next drill — E067
Attack provenance breaks.

A sentence may be copied into a new page, slide, social post, or product card without its claim ID.

Build an orphan-claim audit:
- known lineage;
- missing parent;
- stale parent version;
- modified text without re-review.

Question: can every public research claim be traced back to the exact evidence-bearing source version?
