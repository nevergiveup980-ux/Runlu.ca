# E023 — Analytical Result

For the current N2 specification, the only outcome metrics are conflict, deadlock, and progress, with

progress = 1 - conflict - deadlock.

The deterministic policy set already contains:
- always WAIT / always WAIT -> (conflict=0, deadlock=1, progress=0);
- always ENTER / always ENTER -> (1,0,0);
- fixed right-of-way (one always ENTER, the other always WAIT) -> (0,0,1).

These three metric points are the three vertices of the entire feasible simplex

conflict >= 0,
deadlock >= 0,
conflict + deadlock <= 1.

Because arbitrary shared-classical randomization can mix deterministic policies, its convex hull therefore fills the entire feasible metric simplex.

## Consequence
Under the current N2 metrics, **there is no metric point left outside the randomized-classical attainable set.** No alternative correlation resource can improve the conflict/deadlock/progress frontier because the classical hull already equals the full logically feasible region.

## Interpretation
N2, as presently specified, is too weak to test for a correlation-specific separation. This is not evidence against nonclassical resources in general; it is evidence that the native objective omitted any state-sensitive notion of which agent should enter.

Any refinement must add a genuinely operational state-sensitive requirement (for example stopping distance, load stability, or obstruction severity) before seeing the mathematical result. It must not add an artificial XOR payoff.
