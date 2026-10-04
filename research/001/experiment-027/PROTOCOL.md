# Experiment 027 — Safety-Invariant Fallback Coordination

## Purpose
Rebuild the warehouse-native fallback problem so safety is a hard admissibility constraint rather than a metric traded against throughput.

## Layer 1 — Safety envelope
An agent may participate in normal fallback coordination only when its local certified controller reports that a safe WAIT/STOP action remains feasible before the shared conflict boundary.

If that invariant is not satisfied, the case leaves this experiment and enters a separate abnormal/emergency-control regime.

E027 does not model emergency control.

## Layer 2 — Coordination inside the envelope
Two agents approach one shared region during a short communication outage. Both remain capable of safe WAIT.

Actions:
- WAIT
- REQUEST_ENTER

A separate local safety controller may veto REQUEST_ENTER if entry is not locally admissible.

## Hard invariant
No policy is credited for throughput obtained by violating the safety envelope.

## Coordination metrics
- unnecessary dual-WAIT episodes;
- successful single-entry opportunities;
- fairness over repeated encounters;
- delay / waiting rounds.

Collision probability is not an optimization objective here; entry outside the safety invariant is inadmissible.

## Classical baselines
- fixed right-of-way;
- alternating pre-agreed schedule;
- local deterministic policy;
- local randomized policy;
- pre-shared classical schedule/randomness.

## Core question
With safety held fixed, does any fallback-correlation mechanism improve efficiency/fairness beyond the full matched classical strategy set?
