# E091 — Oracle Provenance & Circular Validation Result

E091 traces oracle provenance back to its roots.

ORACLE_COPY directly depends on SPEC_TARGET:
CIRCULAR_VALIDATION.

ORACLE_TRANSITIVE looks separate because it reads a reference table. The table itself was derived from SPEC_TARGET:
CIRCULAR_VALIDATION.

Both are legitimate regression fixtures, but neither is independent evidence that SPEC_TARGET is correct.

ORACLE_MATH derives from an independently declared analytic root:
NONCIRCULAR_ANALYTIC_ORACLE.

ORACLE_EXTERNAL derives from a separately declared external root:
NONCIRCULAR_EXTERNAL_ORACLE.

ORACLE_EMPIRICAL derives from a measurement root:
NONCIRCULAR_EMPIRICAL_CANDIDATE.

"CANDIDATE" is intentional. E091 checks circularity, not whether measurement was accurate, representative, calibrated, or causally relevant.

## Core result

Oracle status is a provenance property, not a filename or role label.

If:
SPEC -> expected answer -> verifier -> claim that SPEC is correct,
the loop is regression consistency, not independent validation.

## Scope

Synthetic governance fixture only. No real warehouse ground truth is asserted.
