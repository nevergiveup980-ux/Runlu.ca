# E046 — Interpretation Policy

E046 flags are not automatic proof that a dataset is unusable; they are reasons to review collection design before making strong calibration claims.

## Strong-claim gate
Do not call an E045 threshold or robust codebook "empirically calibrated" unless:
- event IDs and timestamps pass basic integrity checks;
- the observation denominator is documented;
- context/time coverage is reported;
- quiet as well as busy operation is represented when those states exist;
- source-mode changes are disclosed;
- missingness and uncertain observations are reported;
- the result is stable enough under reasonable resampling/sensitivity checks.

## Anti-selection rule
Do not collect only when "something interesting happened." Routine uneventful observations are part of the evidence.

## Next drill
E047 should add resampling/uncertainty to calibration itself: bootstrap or exact sensitivity intervals for regret and threshold stability, so small samples do not produce falsely precise codebooks.
