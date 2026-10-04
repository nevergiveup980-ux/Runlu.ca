# E076 — Target-Weight Uncertainty Result

Using the fixed E075 synthetic contrast:

D(w) = 0.40w - 0.20,
with w* = 0.50.

Intervals entirely below 0.50 are ROBUST_B.

Intervals entirely above 0.50 are ROBUST_A.

Example:
w in [0.46, 0.54].

D(0.46) = -0.016.
D(0.54) = +0.016.

The uncertainty set contains both A<B and A>B regions.

Result:
BOUNDARY_CROSSING.

An interval ending exactly at 0.50 is distinguished as BOUNDARY_TOUCHING rather than treated as strictly robust. A degenerate interval [0.50,0.50] is POINT_TIE.

## Core result

A point estimate near a decision boundary is insufficient when the declared target-population uncertainty spans both sides.

The correct statement is about robustness over the uncertainty set, not about whichever side contains the point estimate.

## Boundary

The interval examples are synthetic. They are not confidence intervals estimated from warehouse telemetry.
