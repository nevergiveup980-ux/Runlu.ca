# Experiment 025 — Exact E024 Classical Frontier

## Exact deterministic audit

Under the preregistered uniform independent stopping-margin states, all 16 deterministic local policy pairs were evaluated exactly.

Three especially important policies expose the tradeoff:

- Fixed right-of-way: one mover always ENTERs, the other always WAITs.
  - conflict = 0
  - deadlock = 0
  - progress = 1
  - tight-priority = 0.5

- Both follow local state: ENTER iff TIGHT.
  - conflict = 0.25
  - deadlock = 0.25
  - progress = 0.5
  - tight-priority = 1

- Opposite asymmetric state-sensitive policy can move along the same safety/priority trade space, but no local deterministic policy attains conflict=0, deadlock=0, tight-priority=1.

## Impossibility of the perfect tuple

Suppose conflict=0 and deadlock=0 for every input pair. Then actions must always be complementary. With no communication, A's action depends only on x and B's only on y. Requiring complementarity for all four (x,y) pairs forces each agent's output to be constant with respect to its local state; this reduces to fixed right-of-way. A fixed role cannot always give priority to whichever side alone is TIGHT, so tight-priority is only 1/2 under the symmetric distribution.

Therefore:

**(conflict=0, deadlock=0, tight-priority=1) is impossible for local deterministic policies.**

Because any shared-classical randomized strategy is a convex mixture of deterministic local policies, attaining zero conflict and zero deadlock in expectation requires support only on deterministic policies that themselves have zero conflict and zero deadlock. Those are fixed-role complementary policies, each with tight-priority=1/2. Hence shared classical randomness cannot attain the perfect tuple either.

## Result

The state-sensitive native task creates a genuine local-classical tradeoff. This is stronger than E023, where the classical hull filled the entire feasible outcome simplex.

It is **not** yet evidence of a nonclassical advantage. The next question is whether the operational target and input structure correspond naturally to any nonclassical correlation problem without modifying the warehouse semantics.
