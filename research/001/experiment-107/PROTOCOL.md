# Experiment 107 — Conditioning Granularity Audit

## Purpose
E106 showed that justified conditioning can separate apparent conflict from within-context conflict. E107 asks whether that classification is stable across defensible resolutions of the same context variables.

## Synthetic fixture
Four observations use the same underlying attributes:
- failure family: SOFTWARE
- subtype: TIMEOUT or TRANSFORM
- timescale: SHORT
- regime: NORMAL or SURGE
- supported depth: 1 or 2

Three preregistered resolutions are compared:
- G0 COARSE: failure family only.
- G1 MEDIUM: failure subtype + timescale.
- G2 FINE: failure subtype + timescale + regime.

G0 pools distinct mechanisms and reports conflict.
G1 still contains a TIMEOUT conflict across regimes.
G2 separates that heterogeneity.

A deliberately overfit G3 adds observation_id, creating singleton contexts. It is not admissible.

## Principle
Granularity is part of the model. Report classification across the admissible granularity set, not only at the resolution producing the cleanest result.
