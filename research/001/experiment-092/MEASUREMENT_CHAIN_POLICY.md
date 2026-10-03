# E092 — Measurement Chain Policy

Before promoting an empirical oracle:
- identify sensor/observer and measurement definition;
- retain calibration evidence and validity interval;
- align measurement time with the event being labeled;
- ensure oracle labels are not derived from the target rule under test;
- characterize missingness and exclusions;
- state the target population/context and test representativeness;
- preserve raw-to-aggregate lineage.

Failure of a critical gate yields GROUND_TRUTH_NOT_ESTABLISHED.

Passing all declared gates yields only EMPIRICAL_ORACLE_CANDIDATE until uncertainty and inter-observer/measurement reliability are audited.

## Next drill — E093
Attack measurement reliability.

Two calibrated observers/sensors can still disagree.

Measure repeatability and agreement separately from validity. Create repeated synthetic labels with:
PERFECT_AGREEMENT, HIGH_AGREEMENT, SYSTEMATIC_BIAS, and LOW_AGREEMENT.

Question: can a measurement be highly repeatable yet consistently wrong, and how should that constrain "ground truth" language?
