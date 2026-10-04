# Experiment 072 — Numeric Comparability Gate

## Purpose
E071 established that an individual number needs context. E072 asks whether two individually valid numbers are legitimately comparable.

## Comparability dimensions
SAME_METRIC
COMPATIBLE_DENOMINATOR
COMPATIBLE_POPULATION
COMPATIBLE_WINDOW
COMPATIBLE_SCOPE

Optional domain-specific checks may be added, but these five are mandatory for the first audit.

## Outcomes
COMPARABLE — all mandatory dimensions pass.
NOT_COMPARABLE — at least one mandatory dimension fails.
REVIEW_REQUIRED — a dimension cannot be determined from metadata.

## Principle
Correct numbers do not become comparable merely because they share a unit or appear side by side.
