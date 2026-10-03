# E043 — Complexity Gate

## Build gate
Do not implement adaptive codebook switching merely because an oracle can improve regret.

Proceed only if all are demonstrated:
1. measurable workload drift exists in real data;
2. robust static encoding misses a declared operational regret target;
3. adaptation has enough gross headroom to pay detection + switching + transition costs;
4. version agreement can be made fail-closed;
5. gains persist under estimation error and regime-duration uncertainty.

Otherwise prefer robust static encoding.

## Research consequence
Research 001B has now produced a hierarchy:

1. Safety envelope first.
2. Send the smallest decision-relevant information.
3. Protect identity/context/freshness/integrity.
4. Choose workload-aware encoding only when useful.
5. Prefer robust static encoding when it meets the target.
6. Adapt only when measured net value is positive.

## E044
The next useful drill is no longer another synthetic controller embellishment.

E044 should define the **minimum real telemetry needed to calibrate the model without touching Warehouse OS control logic**:
- anonymized queue/count snapshots;
- encounter timestamps;
- workload/shift context;
- observed decision opportunity;
- no autonomous actuation.

Goal: learn the empirical queue distribution, drift, and regime durations while keeping Research 001B observational and isolated from production control.
