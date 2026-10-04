# E101 — Transitive Model Ancestry Result

E100 found five immediate specification roots. E101 followed their declared ancestry.

SPEC_A and SPEC_B share FRAMEWORK_X directly.

SPEC_A, SPEC_B, and SPEC_C all reach ASSUMPTION_ROOT transitively, even though SPEC_C has a different immediate framework.

SPEC_D and SPEC_E both reach LOSS_ROOT through different immediate frameworks.

Thus the five immediate specification roots collapse into two declared deep-ancestry families in this synthetic fixture:

ASSUMPTION_ROOT -> {SPEC_A, SPEC_B, SPEC_C}
LOSS_ROOT -> {SPEC_D, SPEC_E}

SPEC_A and SPEC_D have no declared common ancestor.

## Core result

Distinct Immediate Roots != Distinct Transitive Provenance.

A model family can look diverse at one ancestry depth and become tightly related at another.

NO_DECLARED_COMMON_ANCESTOR is deliberately weaker than INDEPENDENT. The ancestry graph may be incomplete.

## Scope

Synthetic governance fixture only. Shared ancestry identifies a declared dependency route; it does not quantify correlation strength, error propagation, model quality, or statistical effective sample size.
