# Experiment 004 — Analysis Plan

The exhaustive runner is now locked. Before interpreting its output, use these checks:

1. Verify all 16 deterministic tables and all 256 ordered one-bit table pairs are present.
2. Treat pairs [m,m] as degenerate correlated policies equivalent to deterministic table m.
3. Remove duplicate metric points before visual interpretation; shared randomness can create many policy encodings with identical outcomes.
4. Compare the correlated Pareto set against the deterministic Pareto set. A correlated point counts as a genuinely new trade-off only if no deterministic point has equal-or-lower collision and deadlock with equal-or-higher correct-priority rate.
5. Repeat the frontier comparison over observation accuracies 0.55–0.95 before calling the effect robust.
6. Do not select a single winner by an invented weighted score.

## Important theoretical control

Because the correlated policy here is a 50/50 mixture of two deterministic local response tables, its expected metric vector should lie on a convex combination of deterministic-policy metric vectors (up to Monte Carlo noise). Therefore a new point can improve the *discrete deterministic* frontier without implying any non-classical effect. The proper next comparator is the convex hull / randomized-classical frontier, not deterministic tables alone.

This note is committed before any favorable interpretation of Experiment 004.
