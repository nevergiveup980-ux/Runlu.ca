# Experiment 077 — Joint Effect-and-Target Uncertainty

## Purpose
E076 varied target weight while holding subgroup effects fixed. E077 lets both subgroup effects and target composition vary over declared intervals.

## Contrast
D(w,dE,dH) = w*dE + (1-w)*dH.

## Uncertainty box
dE in [LE,UE]
dH in [LH,UH]
w  in [Lw,Uw]

Because D is multilinear, extrema over a rectangular box occur at corners. The audit evaluates all 2^3 = 8 corners rather than selecting a favorable combination.

## Classification
ROBUST_A: minimum D > 0.
ROBUST_B: maximum D < 0.
EXACT_TIE_ONLY: minimum D = maximum D = 0.
SIGN_UNRESOLVED: minimum D <= 0 <= maximum D, with nonzero range.

This is deterministic set robustness, not probability.
