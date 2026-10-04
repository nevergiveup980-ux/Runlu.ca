# Experiment 080 — Misspecification Geometry Audit

## Purpose
E079 computed a fragility margin under one symmetric additive error model. E080 tests whether that margin is stable when model error is represented differently.

## Nominal synthetic model
w in [0.46,0.54]
dE0(w) = 0.10 + 0.20(w-0.50)
dH0(w) = 0.02 + 0.10(w-0.50)
D = w*dE + (1-w)*dH

## Preregistered perturbation geometries
G1 COMMON_ADDITIVE:
dE,dH each vary by +/- epsilon.

G2 EASY_ONLY_ADDITIVE:
only dE varies by +/- epsilon.

G3 HARD_ONLY_ADDITIVE:
only dH varies by +/- epsilon.

G4 RELATIVE_MULTIPLICATIVE:
dE=dE0*(1+uE), dH=dH0*(1+uH), with uE,uH in [-rho,+rho].

Each geometry gets its own critical parameter. Raw epsilon and rho are not interchangeable units.

## Principle
A fragility threshold is conditional on its perturbation geometry.
