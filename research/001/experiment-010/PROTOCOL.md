# Experiment 010 — Communication Cost Curve

## Purpose
Measure how the E008 warehouse-native coordination frontier changes as agents gain progressively richer coordination resources.

## Resource ladder
R0 — deterministic local policy only; 0 communicated bits.
R0R — input-independent pre-shared classical randomness; 0 communicated bits.
R1A — one input-dependent bit A -> B.
R1B — one input-dependent bit B -> A.
R2 — both urgency bits are available to both agents before action (full two-bit state exchange reference).

## Native task
Same narrow-lane benchmark as E008/E009:
- private urgency bits uA,uB;
- actions YIELD/ENTER;
- both ENTER = conflict;
- both YIELD = deadlock;
- exactly one ENTER = progress;
- when exactly one load is urgent, urgent mover should receive priority.

## Method
Exhaustively enumerate finite policy classes where practical. Use exact uniform averaging over the four input states rather than Monte Carlo sampling.

## Metrics
Conflict, deadlock, progress, urgent-priority satisfaction.

## Decision questions
1. Does input-independent shared randomness improve any operational frontier beyond convexification/fairness?
2. How much does one transmitted urgency bit improve the frontier?
3. Is A->B equivalent to B->A under the symmetric benchmark?
4. Does full two-bit state knowledge improve materially beyond one bit?
5. What is the smallest communication resource that attains conflict=0, deadlock=0, progress=1, urgent-priority=1, if attainable?

## Interpretation
This experiment measures information value in a synthetic warehouse coordination game. It is not a quantum experiment.
