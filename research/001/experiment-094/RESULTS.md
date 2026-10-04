# E094 — Shared Bias Provenance Result

E094 gives multiple synthetic observers explicit calibration roots.

INDEPENDENT_NOISE uses three separate roots and small opposing noise around truth.
Provenance: SEPARATE_ROOTS.

SHARED_OFFSET uses three observers that all trace to SHORT_RULER.
All three report exactly 99 when the declared synthetic truth is 100.
Inter-observer SD = 0, yet mean bias = -1.
Provenance: SHARED_CALIBRATION_ROOT.
Evidence: CORRELATED_EVIDENCE.

MIXED_BIAS has two observers sharing SHORT_RULER and one observer on a separate root.
Provenance: MIXED_DEPENDENCE.

SEPARATE_BUT_WRONG is deliberately important: all three roots are separate, yet all three happen to report 99.
The audit says NO_DECLARED_SHARED_ROOT, not VALID.

## Core result

Observer multiplicity is not evidence multiplicity.

Perfect agreement can coexist with systematic error when observers inherit a shared calibration or label source.

Conversely, separate provenance roots eliminate one dependence explanation but do not prove correctness.

## Scope

Synthetic governance fixture only. No real sensor or warehouse observer bias is asserted.
