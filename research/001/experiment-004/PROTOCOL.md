# Experiment 004 — Exhaustive Policy-Class Test

## Purpose
Experiment 003 showed that a hand-written correlated tiebreak can fail badly. Experiment 004 removes hand tuning and exhaustively searches a small, explicit policy class.

## Information structure
Two agents approach a constrained shared zone. Hidden priority is A or B with equal probability. Each agent receives a noisy private binary signal indicating whether it has priority. No communication occurs at decision time.

## Policy class
A deterministic local response table has four binary decisions:
(A, signal 0), (A, signal 1), (B, signal 0), (B, signal 1).
There are 16 deterministic tables.

A one-bit shared-correlation policy contains two such tables, one selected by a pre-shared fair bit. There are 16 × 16 = 256 ordered correlated table pairs.

Both classes are evaluated exhaustively rather than tuned after seeing a favorite outcome.

## Evaluation
100,000 paired scenarios; seed 20260921; signal accuracy 0.72.

Report collision, deadlock, correct-priority, and complementary-action rates. Compare Pareto frontiers rather than declaring a winner from an arbitrary weighted score.

## Claim boundary
This is a classical shared-randomness study. It tests whether enlarging the fallback policy class with a pre-shared bit creates non-dominated safety/coordination trade-offs in this model. It is not a test of physical entanglement or quantum advantage.
