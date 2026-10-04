# Experiment 006 — Expected Validation Targets

## Exact classical enumeration
There are 4 deterministic response functions per party and 16 joint deterministic strategies. Exhaustive enumeration must return a maximum CHSH-game win probability of **0.75**. Shared classical randomness cannot improve this maximum because it forms convex mixtures of deterministic local strategies.

## Ideal quantum target
The ideal Bell-pair CHSH strategy has win probability:

cos²(pi/8) = **0.853553390593...**

and CHSH S = **2√2 = 2.828427124746...**

## Finite-sample validation
The repository now contains a five-seed, 100,000-trial-per-seed convergence runner. Its purpose is software sanity checking only. Sampling should fluctuate around 0.75 and 0.853553 respectively and approach the theoretical values as N grows.

## Important implementation note
The first convergence runner samples Bernoulli wins at the known theoretical probabilities. It therefore validates sampling/convergence plumbing, not Bell measurement physics. The next implementation step must explicitly simulate measurement settings and joint outcomes rather than merely sampling the target win probability.

## Status
E006-A classical enumeration: implemented.
E006-B theoretical targets: implemented.
E006-C finite-sample convergence plumbing: implemented.
E006-D explicit Bell-pair measurement/outcome simulation: pending.

No empirical or physical quantum claim is made.
