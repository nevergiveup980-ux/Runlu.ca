# Experiment 075 — Target-Weight Flip Boundary

## Purpose
E074 found that common standardization cannot reverse a comparison when the stratum-specific difference is constant. E075 introduces preregistered effect heterogeneity and solves the exact target-weight boundary where the standardized direction flips.

## Fixed synthetic subgroup rates
EASY:
A = 0.90
B = 0.70
Difference = +0.20.

HARD:
A = 0.30
B = 0.50
Difference = -0.20.

Let w = target weight on EASY, so 1-w is HARD.

Standardized contrast:
D(w) = w(0.20) + (1-w)(-0.20)
     = 0.40w - 0.20.

Exact boundary:
D(w*) = 0 => w* = 0.50.

No subgroup rate may be altered after target-weight evaluation begins.
