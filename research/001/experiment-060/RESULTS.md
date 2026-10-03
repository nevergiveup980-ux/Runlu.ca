# E060 — Dependency-Aware Result

The E059 fixture is re-expressed as an assumption graph.

The three exponential A-voters have identical declared structural assumptions, so their action-specific effective diversity is exactly:

N_eff(A) = 1.

The two B-voters (rolling and linear) share some assumptions but are not identical, so:

1 < N_eff(B) <= 2.

Thus the raw vote 3A versus 2B does not represent 3 independent structures versus 2 independent structures.

## Important interpretation

N_eff is a redundancy diagnostic, not an evidence weight, confidence level, posterior probability, or automatic decision rule.

Jaccard overlap is deliberately transparent but coarse. Its output depends on the declared assumption vocabulary.

## Why this improves E059

Hard family counting says whether models are in the same bucket.

The dependency graph says how assumptions overlap even across bucket boundaries.

This exposes partial dependence instead of pretending independence is all-or-nothing.
