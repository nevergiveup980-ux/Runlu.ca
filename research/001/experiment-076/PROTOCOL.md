# Experiment 076 — Target-Weight Uncertainty

## Purpose
E075 found an exact target-weight boundary w* = 0.50 for a synthetic heterogeneous-effect fixture. E076 replaces a point target weight with an uncertainty interval.

## Fixed contrast
D(w) = 0.40w - 0.20.
Boundary w* = 0.50.

## Interval classification
For target interval [L,U]:

ROBUST_B: U < w*.
ROBUST_A: L > w*.
BOUNDARY_TOUCHING: L = w* or U = w*, without crossing.
BOUNDARY_CROSSING: L < w* < U.
POINT_TIE: L = U = w*.

The audit also evaluates D(L) and D(U).

## Principle
A point estimate must not determine the comparative headline when the declared uncertainty set spans opposite decision regions.
