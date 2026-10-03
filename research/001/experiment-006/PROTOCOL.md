# Experiment 006 — CHSH Sanity Benchmark

## Purpose
Introduce a mathematically standard Bell/CHSH-style benchmark while keeping it strictly separate from the warehouse-inspired engineering experiments.

This experiment is a simulation sanity check, not evidence that RUNLU agents or computers are physically entangled.

## Game
Inputs x,y are independent uniform bits. Agents output a,b without communication after receiving inputs. They win when:

a XOR b = x AND y.

## Classical control
Any local hidden-variable strategy, including arbitrary pre-shared classical randomness, has CHSH game win probability at most 0.75.

## Ideal quantum simulation
An ideal Bell-pair measurement model reaches cos²(pi/8), approximately 0.853553.

## Experimental lanes
A. Enumerate all deterministic local classical response functions.
B. Verify shared classical random mixtures cannot exceed the best deterministic classical value.
C. Simulate the ideal quantum conditional probabilities / measurement rule.
D. Run finite-sample trials over multiple seeds and confirm estimates approach their theoretical values.

## Interpretation
Passing this benchmark only verifies that the simulator reproduces a known theoretical separation. It does not demonstrate a new quantum advantage, physical entanglement, or warehouse benefit.

Only after this sanity benchmark is validated may a later experiment ask whether a warehouse coordination problem can be mapped to a nonlocal-game structure without smuggling communication or shared state into the model.
