# Experiment 005 — Convex-Hull Classical Control

## Purpose
Test whether any apparent advantage from a one-bit shared-correlation policy lies outside what ordinary classical randomized mixtures of deterministic local policies can already achieve.

## Principle
For linear outcome metrics, a classical randomized mixture produces convex combinations of deterministic-policy metric vectors. Therefore comparison only against the 16 discrete deterministic policies is too weak.

## Procedure
1. Enumerate all 16 deterministic local response tables.
2. Evaluate each table on the same paired scenario set.
3. Enumerate the 256 equal-weight one-bit correlated table pairs.
4. For each correlated metric vector, test whether it is the midpoint of its two component deterministic vectors, within Monte Carlo tolerance.
5. Treat such points as classical convex-mixture points, not correlation-specific evidence.
6. Repeat for observation accuracy 0.55 through 0.95.

## Decision rule
If every correlated point is explained by the convex hull of deterministic policy metrics, record:
**No correlation-specific advantage demonstrated in this policy class.**

Only an unexplained point outside the appropriate classical randomized set would justify further investigation, and would first trigger implementation/debugging checks rather than a quantum claim.

## Scope
Synthetic model only. No Warehouse OS production data, Supabase production data, or physical quantum hardware.
