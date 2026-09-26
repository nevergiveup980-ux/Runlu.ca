# Experiment 078 — Dependence-Aware Uncertainty

## Purpose
E077 propagated uncertainty over a Cartesian box, implicitly allowing every combination of target weight and subgroup effects. E078 tests what changes when the admissible inputs obey declared dependence constraints.

## Contrast
D(w,dE,dH) = w*dE + (1-w)*dH.

## Three audits
1. BOX: every combination in declared intervals is admissible.
2. JUSTIFIED_CONSTRAINT: only points satisfying a preregistered structural relation are admissible.
3. UNJUSTIFIED_FILTER: a post-hoc rule removes adverse points without independent support.

## Principle
Dependence can change robustness conclusions, but a constraint is evidence-bearing. It must be justified independently of the desired sign.
