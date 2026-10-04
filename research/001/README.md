# RUNLU Research 001 — Fallback Correlation for Autonomous Agents

Status: EXPERIMENT STARTED
Started: 2026-09-20
Experiment: 001

## Hypothesis
A fallback correlation layer may reduce dangerous disagreement when autonomous agents have incomplete private observations and cannot exchange timely messages.

## Experiment 001
Two agents act on partial observations during a communication failure. We compare:

1. Independent — each agent acts from its own observation.
2. Shared deterministic rule — both use the same conservative fallback rule.
3. Correlation policy — both use a pre-agreed correlation key plus local evidence.

## Safety boundary
This experiment is synthetic and isolated. It does not write to Warehouse OS, inventory, Supabase production data, or any operational system.

## Primary metrics
- dangerous disagreement rate
- unsafe joint-action rate
- successful task rate
- deadlock / unnecessary stop rate

This first experiment is classical. It makes no claim of quantum advantage.
