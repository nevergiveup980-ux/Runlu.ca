# E039 — Hysteresis and Version Coordination

A reconfiguration has costs beyond payload regret:
- version agreement;
- activation timing;
- rollback/recovery state;
- monitoring uncertainty;
- possible safe-fallback interval during transition.

Therefore instantaneous re-optimization is not automatically optimal.

## Two-threshold discipline
A practical controller can require:
1. benefit threshold: predicted cumulative regret saving exceeds switching cost plus uncertainty margin;
2. persistence threshold: the new workload regime remains supported for a minimum evidence window.

This prevents codebook thrashing.

## Atomic activation requirement
Sender and receiver must not independently switch when their local detector fires.

A new codebook requires a shared activation condition/version handshake or an externally authoritative activation event. Until agreement is established, remain on the old admitted version or the defined safe fallback.

## Next drill
E040 should add workload-regime duration. A short surge may not justify reconfiguration even if the surge-specific codebook is better per encounter. Derive break-even encounter counts for each codebook transition as a function of switching cost.
