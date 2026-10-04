# Experiment 060 — Dependency-Aware Effective Diversity

## Purpose
E059 showed that raw model counts can pseudo-replicate one assumption family. Hard family buckets are also imperfect because model dependence is rarely binary.

E060 replaces hard-only grouping with an explicit shared-assumption graph.

## Assumption features
Each model declares a preregistered set of structural assumptions, for example:
- RECENCY_WEIGHTED;
- FINITE_SUPPORT;
- HARD_CUTOFF;
- SMOOTH_DECAY;
- LINEAR_SHAPE;
- EXPONENTIAL_SHAPE.

Pairwise dependence is represented by Jaccard overlap of declared assumption sets:

similarity(i,j) = |Ai intersect Aj| / |Ai union Aj|.

This is a transparent structural proxy, not a statistical correlation estimate.

## Effective diversity
For n admitted models with similarity matrix S, define a simple redundancy-adjusted effective count:

N_eff = n^2 / sum_ij S_ij.

Properties:
- if models share no assumptions beyond self-similarity, N_eff=n;
- if every model is structurally identical, N_eff=1.

## Action-specific support
For action X, compute N_eff(X) on the subgraph of models voting X.

This does not turn model votes into probabilities. It reports how structurally diverse the supporting model set is.
