# Experiment 009 — Information Value Test

## Question
In the E008 narrow-lane task, how much coordination value comes from (a) no shared resource, (b) one pre-shared random bit, and (c) one genuinely transmitted information bit after private urgency is known?

## Same native task
Each agent has urgency uA,uB in {0,1}; each chooses YIELD(0) or ENTER(1).
Metrics remain conflict, deadlock, progress, and urgent-priority satisfaction.

## Policy classes
A. Local deterministic: each action depends only on own urgency and fixed role.
B. Shared randomness: agents additionally observe the same pre-shared random bit z, independent of urgencies.
C. One-bit communication reference: A sends its urgency bit uA to B after inputs are known. Both then use a pre-agreed protocol. This is intentionally outside the outage/no-communication constraint and serves as an information-value upper reference.

## Fairness rule
Do not compare a hand-picked policy from one class against a weak policy from another. Exhaustively enumerate the finite policy classes where feasible and compare Pareto frontiers.

## Core hypothesis
Shared randomness can coordinate symmetry/fairness but cannot reveal the other agent's private urgency. A transmitted input-dependent bit can change the information set and may therefore improve urgency-aware coordination.

## Interpretation
Any gain from class C is a communication/information gain, not a quantum effect.
Any gain from class B must be compared with the full classical randomized frontier.

## Scope
Synthetic benchmark only; no production control or writes.
