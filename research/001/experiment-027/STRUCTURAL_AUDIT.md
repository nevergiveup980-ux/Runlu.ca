# E027 — Structural Audit

## Immediate observation
Once both agents can always safely WAIT and collision is prohibited by the independent safety layer, a fixed right-of-way policy can avoid negotiation for a single isolated encounter.

For repeated encounters, a pre-agreed alternating schedule can provide both collision-free role complementarity and long-run role fairness without communication.

Therefore any claimed advantage must beat not merely "always A goes" but the stronger classical baseline:
**pre-agreed fair schedule with deterministic complementary roles.**

## Consequence
Simple fairness and deadlock reduction are unlikely to create a correlation-specific advantage by themselves. Shared clocks, encounter counters, or synchronized schedules may already solve them classically.

The remaining potentially nontrivial case requires private, time-varying local information that affects which safe agent should receive the opportunity, while neither side can communicate that information.

That requirement must be operationally justified before formalization.
