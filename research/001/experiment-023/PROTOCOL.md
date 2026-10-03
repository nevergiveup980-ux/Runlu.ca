# Experiment 023 — N2 Exact Classical Frontier

## Purpose
Compute the exact attainable metric set for the E022-N2 blind-corner fallback task before considering any nonclassical resource.

## Native model
Each agent observes one private binary local condition x or y:
0=CLEAR, 1=CONSTRAINED.
Each independently chooses WAIT(0) or ENTER(1) from its own observation only.
No communication occurs during the decision.

A deterministic local policy for one agent is one of four maps {0,1}->{0,1}; a joint deterministic policy is therefore one of 16 pairs.

## State distribution
First audit uses an explicit symmetric independent distribution P(x,y)=1/4. Later sensitivity work may vary it, but no conclusion may silently generalize beyond the chosen distribution.

## Metrics
conflict = P(ENTER,ENTER)
deadlock = P(WAIT,WAIT)
progress = P(exactly one ENTER)

Identity: progress = 1 - conflict - deadlock.

No priority metric is added yet because E022 has not justified a native priority variable.

## Classical resources
C0 deterministic local policies.
C1 arbitrary shared-classical random mixtures over C0.

C1 is exactly the convex hull of the 16 C0 metric vectors.

## Question
Does the native three-metric task contain any operational target outside this full classical hull that is justified independently of a Bell construction?
