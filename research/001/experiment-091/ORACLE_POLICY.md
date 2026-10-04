# E091 — Oracle Provenance Policy

Before treating an oracle as independent validation:
- assign an oracle provenance class;
- record upstream dependencies;
- compute transitive provenance closure;
- test whether the closure reaches the target being validated;
- preserve independent derivation/reference/measurement evidence.

DERIVED_FROM_SPEC or any transitive path back to the target:
REGRESSION_ONLY_NOT_INDEPENDENT_VALIDATION.

INDEPENDENT_ANALYTIC and EXTERNAL_REFERENCE:
eligible as independent-oracle candidates, subject to their own evidence audit.

EMPIRICAL_GROUND_TRUTH_CANDIDATE:
must additionally pass measurement provenance, calibration, sampling, timing, and scope audits.

Do not call a fixture independent merely because it lives in another file, package, repository, or team.

## Next drill — E092
Attack empirical ground truth.

A noncircular measurement oracle may still be biased or wrong.

Build a measurement chain:
REALITY -> SENSOR/OBSERVER -> CALIBRATION -> LABELING -> AGGREGATION -> ORACLE.

Audit calibration validity, missingness, observer/label leakage, temporal alignment, and representativeness.

Question: when does noncircular empirical evidence still fail to qualify as ground truth?
