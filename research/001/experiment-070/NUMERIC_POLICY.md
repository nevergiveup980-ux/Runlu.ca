# E070 — Numeric Lineage Policy

Every headline research number should record:
- numeric claim ID;
- source numeric claim ID(s);
- source version(s);
- transformation;
- transformation parameters;
- displayed value;
- tolerance/rounding rule;
- audit status.

Do not reverse-engineer a plausible source after publication. Register the transform when the derived number is created.

Tolerance is for representation, not scientific discretion.

If a source version changes, rerun numeric lineage and E068 downstream impact propagation.

## Next drill — E071
Attack compound numeric laundering.

A percentage can be arithmetically correct yet rhetorically misleading because the denominator, baseline, unit, conditional population, or time window disappeared.

Audit semantic numeric context:
VALUE + UNIT + DENOMINATOR + BASELINE + POPULATION + WINDOW.

Question: can a mathematically correct number still become a misleading claim after its context is stripped?
