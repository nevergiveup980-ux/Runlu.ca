# Experiment 100 — Model-Family Redundancy Audit

## Purpose
E099 showed that an admitted model family can support opposing conclusions. E100 asks whether apparent model multiplicity represents genuinely distinct model provenance.

Ten admitted synthetic models are assigned to specification roots. Several models differ in name or parameterization but descend from the same root.

## Fixture
- M1, M2, M3, M4 -> SPEC_A
- M5, M6, M7 -> SPEC_B
- M8 -> SPEC_C
- M9 -> SPEC_D
- M10 -> SPEC_E

Raw model count = 10.
Declared specification-root count = 5.

Within-root variants are not counted as independent model confirmations merely because their implementation names or parameters differ.

## Audit
Report:
1. raw admitted model count;
2. unique declared specification roots;
3. root clusters and verdict composition;
4. whether raw verdict multiplicity survives provenance clustering;
5. whether any root itself has internally mixed verdicts.

This is a provenance census, not a statistical effective sample size.
