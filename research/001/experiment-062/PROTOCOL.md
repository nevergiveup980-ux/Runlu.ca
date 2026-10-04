# Experiment 062 — Claim Robustness Ledger

## Purpose
E054–E061 introduced several distinct robustness diagnostics. E062 prevents them from being collapsed into a misleading average score.

A claim is traced through explicit layers. Each layer is independently classified.

## Layer states
- ROBUST: survives the declared challenge at that layer.
- SENSITIVE: conclusion changes under an admitted/plausible challenge.
- UNRESOLVED: evidence is insufficient to classify.
- NOT_APPLICABLE: layer does not logically apply.

## Aggregation rule
No arithmetic average.

For a claim:
1. any SENSITIVE layer prevents an overall ROBUST label;
2. otherwise any UNRESOLVED layer yields overall UNRESOLVED;
3. otherwise all applicable layers ROBUST yields overall ROBUST.

This is a conservative logical ledger, not a probability model.

## Audited claim
C062-1:
"The three exponential parameter variants in the E059–E061 synthetic fixture should not be counted as three independent structural confirmations."

Layers:
- parameter robustness;
- model-form robustness;
- admission uncertainty;
- family dependence;
- vocabulary sensitivity;
- empirical/operational boundary.
