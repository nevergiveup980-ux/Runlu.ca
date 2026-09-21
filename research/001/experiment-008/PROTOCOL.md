# Experiment 008 — Warehouse-Native Game Extraction

## Purpose
Start from a plausible warehouse coordination problem rather than from CHSH, then derive the information structure and payoff table without forcing a Bell-game shape.

## Native scenario
Two autonomous movers approach a shared narrow transfer lane from opposite ends during a temporary communications outage.

Each agent has a private local urgency bit:
- 0 = normal load
- 1 = urgent/time-sensitive load

Each chooses:
- YIELD
- ENTER

The physical lane admits only one mover safely at a time.

## Outcome principles
These are engineering semantics, not CHSH semantics:
- both ENTER -> collision/conflict risk: unacceptable;
- both YIELD -> safe but deadlocked/throughput loss;
- exactly one ENTER -> safe progress;
- when exactly one load is urgent, progress is better if the urgent mover enters;
- when both have equal urgency, either single entrant is operationally acceptable.

## Information constraint
During the fallback interval, A observes only its own urgency and B observes only its own urgency. No post-input communication is permitted in the benchmark. Pre-agreed classical policies and shared randomness are allowed.

## Extraction rule
Do not choose a payoff equation in advance. First enumerate the four private-input cases and four joint-action cases, classify safety/progress/priority correctness, then derive candidate metrics.

## Primary metrics
- conflict rate: both ENTER
- deadlock rate: both YIELD
- progress rate: exactly one ENTER
- urgent-priority satisfaction: when exactly one load is urgent, did that mover ENTER?

## Comparison classes
1. deterministic local policies;
2. shared-classical randomized policies;
3. delayed-communication reference (not under the no-communication constraint), used only to quantify the price of outage.

## CHSH bridge test
After the native payoff structure is derived, compare it to E007. Do not alter the warehouse payoff to make it CHSH-shaped.

If the native task does not exhibit the CHSH relation, record that result explicitly.

## Scope
Synthetic warehouse benchmark only. No production Warehouse OS writes or control.
