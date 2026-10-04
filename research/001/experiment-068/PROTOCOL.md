# Experiment 068 — Downstream Claim Impact Propagation

## Purpose
E067 detects stale direct parent links. E068 propagates a source correction through every descendant claim.

## Change classes
NON_SUBSTANTIVE — formatting/wording only; scientific meaning unchanged.
NARROWED_SCOPE — source remains valid but only in a narrower domain.
NUMERIC_CORRECTION — a reported quantity changed.
CONCLUSION_REVERSED — source conclusion no longer supports the previous direction.
RETRACTED — source should no longer be relied upon.

## Descendant actions
UNAFFECTED — descendant does not depend on the changed proposition.
RE_REVIEW — dependency may remain valid but wording/numbers/scope must be checked.
BLOCK — descendant currently relies on a proposition that was reversed or retracted.

## Principle
A corrected source must trigger review of transitive descendants, not only its immediate children.
