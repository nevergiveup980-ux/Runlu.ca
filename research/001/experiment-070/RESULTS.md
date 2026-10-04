# E070 — Numeric Lineage Result

The audit traces displayed values back to versioned source numbers.

Source R = 0.0961840629.

PERCENT transforms R × 100 and displays 9.62 with declared rounding tolerance.
Result: PASS_NUMERIC_LINEAGE.

ROUND displays R as 0.0962.
Result: PASS_NUMERIC_LINEAGE.

DIFFERENCE recomputes A - B:
0.1946250383 - 0.0984409754 = 0.0961840629.
Result: PASS_NUMERIC_LINEAGE.

A deliberately incorrect display of 10.0% from R is flagged NUMERIC_MISMATCH.

A claim bound to source A version 1 is flagged STALE_SOURCE_VERSION because the registry contains A version 2.

## Core result
A number's lineage includes both arithmetic and source version.

Matching arithmetic against an obsolete source version is not sufficient provenance.

## Boundary
These are deterministic fixture numbers. They do not constitute new empirical warehouse measurements.
