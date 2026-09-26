# Experiment 020 — Exact Classical-Hull Audit

## Why this is exact
The E004 "correlated" policy first samples one pre-shared fair classical bit z, then selects deterministic response table m0 or m1. Its expected metric vector is therefore exactly

M = 1/2 M(m0) + 1/2 M(m1).

That is a convex combination of two ordinary deterministic local-policy metric vectors.

## Consequence
For the E004 policy class, every one of the 256 shared-bit policies lies inside the randomized-classical convex hull by construction. Monte Carlo sampling is unnecessary to establish this fact.

Therefore the preregistered gate resolves as:

**No correlation-specific advantage demonstrated in this policy class.**

This is a negative result about E004's policy class, not a proof that every possible fallback-correlation design is useless.

## Important distinction
A shared-bit mixture can occupy a metric point that no single deterministic policy occupies. That can make it appear better than the *discrete deterministic frontier*. But it is not outside the correct randomized-classical comparator. The earlier deterministic-only comparison was therefore too weak for a correlation-specific claim.

## Status
Analytical/exact result; no physical or quantum claim.
