# Experiment 101 — Transitive Model Ancestry Audit

## Purpose
E100 clustered model instances by their immediate specification roots. E101 asks whether apparently distinct roots remain distinct after following ancestry transitively.

Immediate-root diversity can overstate provenance diversity when different specifications inherit a common framework, loss definition, simulator, or mathematical assumption.

## Synthetic ancestry
SPEC_A -> FRAMEWORK_X -> ASSUMPTION_ROOT
SPEC_B -> FRAMEWORK_X -> ASSUMPTION_ROOT
SPEC_C -> FRAMEWORK_Y -> ASSUMPTION_ROOT
SPEC_D -> FRAMEWORK_Z -> LOSS_ROOT
SPEC_E -> FRAMEWORK_W -> LOSS_ROOT

At the immediate specification level there are five roots.
At deeper levels, A/B share FRAMEWORK_X; A/B/C share ASSUMPTION_ROOT; D/E share LOSS_ROOT.

## Audit
Compute transitive ancestors for each specification root and all pairwise common ancestors.

A common ancestor means declared provenance coupling, not equal error propagation or statistical dependence.
Absence of a declared common ancestor means only NO_DECLARED_COMMON_ANCESTOR.
