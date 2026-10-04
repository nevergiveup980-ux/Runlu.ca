# E054 — Analytical / Numerical Results

For the E053 history:
- age 50: +8;
- age 5: -3.

## Rolling window

The decision is piecewise constant:

- 0 <= W < 5: debt = 0 -> TIE;
- 5 <= W < 50: debt = -3 -> A;
- W >= 50: debt = +5 -> B.

The only rolling-window decision boundaries are event ages 5 and 50.

This is stronger than a dense parameter sweep: for a finite event history, rolling-window debt changes only when W crosses an event age.

## Exponential decay

Debt is:

D(H) = 8 * 2^(-50/H) - 3 * 2^(-5/H).

Setting D(H)=0 gives an exact flip equation:

8 * 2^(-50/H) = 3 * 2^(-5/H)

and therefore:

H* = 45 / log2(8/3) ≈ 31.79.

Thus:
- 0 < H < H*: corrective preference A;
- H > H*: corrective preference B;
- at H*: tie.

The executable runner independently locates the root numerically by log sweep + bisection.

## Interpretation

A parameter estimate is decision-robust when its plausible uncertainty interval lies wholly inside one action interval.

If uncertainty crosses a flip boundary, the decision is horizon-sensitive and the system should not present a single fitted horizon as settled.
